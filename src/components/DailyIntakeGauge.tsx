import React from 'react';
import { DrinkEntry } from '../types';
import { getTotalIntake, getRecommendedDailyIntake } from '../utils/caffeineCalculator';
import { Scale, CheckCircle2, AlertTriangle, XCircle, Flame } from 'lucide-react';

interface DailyIntakeGaugeProps {
  drinks: DrinkEntry[];
  weightKg: number;
}

export const DailyIntakeGauge: React.FC<DailyIntakeGaugeProps> = ({ drinks, weightKg }) => {
  const totalIntake = getTotalIntake(drinks);
  const recommendedLimit = getRecommendedDailyIntake(weightKg);
  const ratio = recommendedLimit > 0 ? (totalIntake / recommendedLimit) * 100 : 0;
  const ratioRounded = Math.round(ratio);

  const diff = Math.round(Math.abs(recommendedLimit - totalIntake) * 10) / 10;
  const isOver = totalIntake > recommendedLimit;

  // Level classification
  let levelColor = 'text-emerald-600';
  let barGradient = 'from-emerald-400 to-teal-500';
  let badgeText = '적정 섭취 (권장량 이내)';
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let StatusIcon = CheckCircle2;

  if (ratio > 100) {
    levelColor = 'text-rose-600';
    barGradient = 'from-amber-400 via-rose-500 to-rose-600';
    badgeText = '일일 권장량 초과!';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
    StatusIcon = XCircle;
  } else if (ratio > 80) {
    levelColor = 'text-amber-600';
    barGradient = 'from-teal-400 via-emerald-400 to-amber-500';
    badgeText = '권장량 근접 주의';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              하루 총 섭취량 vs 권장 섭취량
            </h3>
            <p className="text-xs text-slate-500">
              체중 기반 권장량: <span className="font-semibold text-slate-700">{weightKg}kg × 2.5mg = {recommendedLimit}mg</span>
            </p>
          </div>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold border inline-flex items-center gap-1.5 ${badgeBg}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {badgeText}
        </span>
      </div>

      {/* Quantitative Summary Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">오늘 마신 총 카페인</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-2xl font-black font-mono ${levelColor}`}>{totalIntake}</span>
            <span className="text-xs text-slate-500 font-medium">mg</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">나의 일일 권장 최대량</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black font-mono text-slate-800">{recommendedLimit}</span>
            <span className="text-xs text-slate-500 font-medium">mg</span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">권장량 대비 비율</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-2xl font-black font-mono ${levelColor}`}>{ratioRounded}%</span>
            <span className="text-xs text-slate-500 font-medium">
              {isOver ? `(${diff}mg 초과)` : `(${diff}mg 여유)`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar with Indicator Line */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>0 mg</span>
          <span className="font-semibold text-slate-700">권장 기준 (100% = {recommendedLimit}mg)</span>
          <span>{Math.max(recommendedLimit * 1.5, totalIntake, 100)}mg</span>
        </div>

        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${barGradient}`}
            style={{ width: `${Math.min(100, (totalIntake / Math.max(recommendedLimit * 1.25, totalIntake, 100)) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            마신 음료 개수: <strong className="text-slate-800">{drinks.length}잔</strong>
          </span>
          <span>
            {isOver ? (
              <span className="text-rose-600 font-semibold">
                ⚠️ 성장기 청소년 기준치보다 {diff}mg을 더 마셨습니다!
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                안전 범위 내에서 건강하게 조절하고 있습니다.
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
