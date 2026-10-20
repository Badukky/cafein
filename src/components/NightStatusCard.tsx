import React from 'react';
import { DrinkEntry, MetabolismSpeed } from '../types';
import { evaluateNight10, calculateSleepCutoffHours } from '../utils/caffeineCalculator';
import { Moon, ShieldCheck, AlertTriangle, AlertOctagon, Info, ArrowRight, BedDouble } from 'lucide-react';

interface NightStatusCardProps {
  drinks: DrinkEntry[];
  halfLifeHours: number;
  metabolismSpeed: MetabolismSpeed;
}

export const NightStatusCard: React.FC<NightStatusCardProps> = ({
  drinks,
  halfLifeHours,
  metabolismSpeed,
}) => {
  const evalResult = evaluateNight10(drinks, halfLifeHours);
  const remainingRounded = Math.round(evalResult.caffeineRemaining * 10) / 10;

  // Compute cutoff hours for standard coffee drink
  const cutoffStandardCoffee = Math.round(calculateSleepCutoffHours(132, halfLifeHours, 25) * 10) / 10;
  // Cutoff hour before 22:00
  const cutoffHour = 22 - cutoffStandardCoffee;
  const cutoffHourInt = Math.floor(cutoffHour);
  const cutoffMinInt = Math.round((cutoffHour - cutoffHourInt) * 60);
  const cutoffTimeString = `오후 ${cutoffHourInt > 12 ? cutoffHourInt - 12 : cutoffHourInt}시 ${cutoffMinInt > 0 ? `${cutoffMinInt}분` : ''}`;

  const statusConfig = {
    safe: {
      bgColor: 'bg-emerald-50/70 border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      accentColor: 'text-emerald-700',
      statusTitle: '안전 (Safe)',
      sleepQuality: '깊은 수면(N3 서파수면) 진입 양호',
      summary: '밤 10시 체내 카페인 잔류량이 25mg 미만으로 유지되어 수면 호르몬 멜라토닌 및 아데노신 작용에 지장이 적습니다.',
    },
    caution: {
      bgColor: 'bg-amber-50/70 border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      accentColor: 'text-amber-700',
      statusTitle: '주의 (Caution)',
      sleepQuality: '입면 지연 및 얕은 잠 발생 가능',
      summary: '밤 10시에 25~50mg의 카페인이 남아 있습니다. 잠들기까지 시간이 평소보다 오래 걸리거나 수면 도중 깰 수 있습니다.',
    },
    danger: {
      bgColor: 'bg-rose-50/70 border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <AlertOctagon className="w-6 h-6 text-rose-600" />,
      accentColor: 'text-rose-700',
      statusTitle: '초과 (Excessive)',
      sleepQuality: '각성 지속, 숙면 장애 및 불면 우려',
      summary: '밤 10시에도 50mg 이상의 고카페인이 중추신경계의 아데노신 수용체를 차단하고 있어 심박수 증가와 불면이 예상됩니다.',
    },
  }[evalResult.status];

  return (
    <div className={`rounded-2xl p-6 border shadow-xs transition-all ${statusConfig.bgColor}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Status Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/60 inline-flex">
              <Moon className="w-5 h-5 text-indigo-600" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  밤 10시 (22:00) 수면 영향도 판정
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${statusConfig.badgeBg}`}
                >
                  {statusConfig.icon}
                  {statusConfig.statusTitle}
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">
                잔여 카페인: <span className={statusConfig.accentColor}>{remainingRounded}</span> mg
              </h4>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-normal pt-1">
            {statusConfig.summary}
          </p>
        </div>

        {/* Right: Quick Metric Badge */}
        <div className="shrink-0 bg-white/90 rounded-xl p-3.5 border border-slate-200 shadow-2xs min-w-[210px]">
          <div className="text-[11px] text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-indigo-500" />
            예상 수면 상태 진단
          </div>
          <div className={`text-sm font-bold ${statusConfig.accentColor}`}>
            {statusConfig.sleepQuality}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>수면 안전 기준선</span>
            <span className="font-mono font-bold text-slate-700">25.0 mg 이하</span>
          </div>
        </div>
      </div>

      {/* Educational tip bar */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {metabolismSpeed === 'fast' && '빠른 대사 타입(반감기 3시간)이므로 분해가 빠르지만, 늦은 저녁 음료는 여전히 주의해야 합니다.'}
            {metabolismSpeed === 'normal' && '보통 대사 타입(반감기 5시간) 기준, 밤 10시 숙면을 위해선 아메리카노(132mg)는 12시간 전인 '}
            {metabolismSpeed === 'slow' && '느린 대사 타입(반감기 7시간)은 카페인이 밤새 잔류하므로 점심 이후 카페인을 피하는 것이 안전합니다.'}
            {metabolismSpeed === 'normal' && (
              <span className="font-bold text-indigo-700">{cutoffTimeString} 이전</span>
            )}
            {metabolismSpeed === 'normal' && '에 마시는 것이 권장됩니다.'}
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          * 아데노신 수용체 차단 임계 모델
        </div>
      </div>
    </div>
  );
};
