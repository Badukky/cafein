import { ChartDataPoint, DrinkEntry, MetabolismSpeed, Night10Eval } from '../types';

export const HALF_LIFE_MAP: Record<MetabolismSpeed, number> = {
  fast: 3,   // 3 hours
  normal: 5, // 5 hours
  slow: 7,   // 7 hours
};

export const METABOLISM_LABELS: Record<MetabolismSpeed, { label: string; desc: string; geneNote: string }> = {
  fast: {
    label: '빠른 대사 (3시간)',
    desc: '카페인을 빠르게 분해하여 배출합니다.',
    geneNote: 'CYP1A2 효소 활성이 매우 높은 유전형 (*1A/*1A)',
  },
  normal: {
    label: '보통 대사 (5시간)',
    desc: '일반적인 청소년 및 성인의 평균적인 대사 속도입니다.',
    geneNote: 'CYP1A2 효소 활성이 표준적인 유전형',
  },
  slow: {
    label: '느린 대사 (7시간)',
    desc: '카페인이 체내에 오래 머물며 밤늦게까지 영향을 줍니다.',
    geneNote: 'CYP1A2 효소 활성이 낮거나 (*1F 동형 등) 대사 지연 요인 보유',
  },
};

/**
 * Converts "HH:mm" time string into minutes from 00:00 of the day.
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts minutes from 00:00 to "HH:mm" or "+1일 HH:mm".
 */
export function minutesToTimeString(minutes: number, showDayOffset = false): string {
  const dayOffset = Math.floor(minutes / 1440);
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  if (showDayOffset && dayOffset > 0) {
    return `익일 ${timeFormatted}`;
  }
  return timeFormatted;
}

/**
 * Calculates remaining caffeine for a single drink intake at target minute.
 * Formula: 잔존량 = 섭취량 × 0.5^(경과시간 ÷ 반감기)
 */
export function calculateDrinkRemaining(
  drinkCaffeine: number,
  intakeMinute: number,
  targetMinute: number,
  halfLifeHours: number
): number {
  if (targetMinute < intakeMinute) {
    return 0;
  }
  const elapsedMinutes = targetMinute - intakeMinute;
  const elapsedHours = elapsedMinutes / 60;
  return drinkCaffeine * Math.pow(0.5, elapsedHours / halfLifeHours);
}

/**
 * Calculates total remaining caffeine at target minute across all drinks.
 */
export function calculateTotalRemainingAt(
  drinks: DrinkEntry[],
  targetMinute: number,
  halfLifeHours: number
): number {
  return drinks.reduce((sum, drink) => {
    return sum + calculateDrinkRemaining(drink.caffeine, drink.intakeMinutes, targetMinute, halfLifeHours);
  }, 0);
}

/**
 * Evaluates the caffeine remaining at 10 PM (22:00, 1320 minutes).
 */
export function evaluateNight10(
  drinks: DrinkEntry[],
  halfLifeHours: number
): Night10Eval {
  const NIGHT_10_MINUTES = 22 * 60; // 1320 min
  const remaining = calculateTotalRemainingAt(drinks, NIGHT_10_MINUTES, halfLifeHours);

  // Safety thresholds for sleep:
  // < 25mg: Safe (minimal adenosine receptor blockade)
  // 25mg ~ 50mg: Caution (sleep onset latency prolonged, light sleep)
  // >= 50mg: Danger/Excess (restlessness, insomnia, disrupts deep/REM sleep)
  if (remaining < 25) {
    return {
      caffeineRemaining: remaining,
      status: 'safe',
      statusLabel: '안전 (수면 지장 미미)',
      statusDesc: '밤 10시 체내 카페인이 25mg 미만으로 유지되어 깊은 수면(서파수면)에 드는 데 무리가 없습니다.',
      bedtimeSafetyMargin: 25 - remaining,
    };
  } else if (remaining <= 50) {
    return {
      caffeineRemaining: remaining,
      status: 'caution',
      statusLabel: '주의 (수면 질 저하 우려)',
      statusDesc: '밤 10시 기준 카페인이 25~50mg 잔류합니다. 잠드는 데 시간이 더 걸리거나 깊은 잠을 방해받을 수 있습니다.',
      bedtimeSafetyMargin: remaining - 25,
    };
  } else {
    return {
      caffeineRemaining: remaining,
      status: 'danger',
      statusLabel: '초과 (수면 방해 심각)',
      statusDesc: '밤 10시에도 50mg 이상의 카페인이 남아 뇌의 아데노신 결합을 차단합니다. 불면, 잦은 깸, 다음날 피로가 우려됩니다.',
      bedtimeSafetyMargin: remaining - 25,
    };
  }
}

/**
 * Generates continuous timeline data for charts (default 06:00 Day 1 to 06:00 Day 2 = 24h, or up to 30h).
 */
export function generateTimelineData(
  drinks: DrinkEntry[],
  halfLifeHours: number,
  startMinute = 6 * 60, // 06:00
  endMinute = 30 * 60,  // 06:00 next day (30 hours)
  stepMinutes = 15
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];

  for (let m = startMinute; m <= endMinute; m += stepMinutes) {
    const activeDrinks: { name: string; remaining: number }[] = [];
    let total = 0;

    for (const d of drinks) {
      const rem = calculateDrinkRemaining(d.caffeine, d.intakeMinutes, m, halfLifeHours);
      if (rem > 0.05) {
        activeDrinks.push({
          name: d.drinkName,
          remaining: rem,
        });
        total += rem;
      }
    }

    points.push({
      timeStr: minutesToTimeString(m, true),
      minutesFromMidnight: m,
      totalCaffeine: total,
      isNight10: m === 22 * 60,
      activeDrinks,
    });
  }

  return points;
}

/**
 * Calculates recommended intake limit based on youth standard (weight × 2.5mg).
 */
export function getRecommendedDailyIntake(weightKg: number): number {
  return Math.round(weightKg * 2.5 * 10) / 10;
}

/**
 * Calculates total daily intake sum.
 */
export function getTotalIntake(drinks: DrinkEntry[]): number {
  return drinks.reduce((sum, d) => sum + d.caffeine, 0);
}

/**
 * Finds peak caffeine concentration and its time.
 */
export function findPeakCaffeine(
  drinks: DrinkEntry[],
  halfLifeHours: number
): { peakAmount: number; peakMinute: number; peakTimeStr: string } {
  if (drinks.length === 0) {
    return { peakAmount: 0, peakMinute: 0, peakTimeStr: '--:--' };
  }

  // Peak generally occurs immediately upon or shortly after the last drink intake
  // We can scan minute by minute from earliest drink to 24h
  const earliest = Math.min(...drinks.map(d => d.intakeMinutes));
  const latest = Math.max(...drinks.map(d => d.intakeMinutes));
  const scanEnd = Math.min(latest + 120, 24 * 60);

  let peakAmount = 0;
  let peakMinute = earliest;

  for (let m = earliest; m <= scanEnd; m += 5) {
    const amount = calculateTotalRemainingAt(drinks, m, halfLifeHours);
    if (amount > peakAmount) {
      peakAmount = amount;
      peakMinute = m;
    }
  }

  return {
    peakAmount: Math.round(peakAmount * 10) / 10,
    peakMinute,
    peakTimeStr: minutesToTimeString(peakMinute),
  };
}

/**
 * Calculates cutoff time for a standard coffee (132mg) to safely decay to under 25mg by 22:00.
 */
export function calculateSleepCutoffHours(caffeineAmount: number, halfLifeHours: number, targetRemaining = 25): number {
  if (caffeineAmount <= targetRemaining) return 0;
  // target = amount * (0.5)^(t / halfLife)
  // log2(target / amount) = -t / halfLife
  // t = halfLife * log2(amount / target)
  const ratio = caffeineAmount / targetRemaining;
  return halfLifeHours * (Math.log(ratio) / Math.LN2);
}
