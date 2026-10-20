import React from 'react';
import { DrinkEntry, MetabolismSpeed } from '../types';
import { METABOLISM_LABELS, HALF_LIFE_MAP, getRecommendedDailyIntake, timeStringToMinutes } from '../utils/caffeineCalculator';
import { OFFICIAL_PRESETS, SAMPLE_SCENARIOS, ScenarioPreset } from '../data/drinkPresets';
import { Weight, Zap, Clock, Plus, Trash2, Coffee, Sparkles, AlertCircle, RefreshCw, BookmarkCheck } from 'lucide-react';

interface UserProfileSectionProps {
  weightKg: number;
  onWeightChange: (val: number) => void;
  metabolismSpeed: MetabolismSpeed;
  onMetabolismChange: (speed: MetabolismSpeed) => void;
  drinks: DrinkEntry[];
  onAddDrinkClick: () => void;
  onQuickAddDrink: (presetId: string) => void;
  onRemoveDrink: (id: string) => void;
  onUpdateTime: (id: string, newTime: string) => void;
  onLoadScenario: (scenario: ScenarioPreset) => void;
  onReset: () => void;
}

export const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  weightKg,
  onWeightChange,
  metabolismSpeed,
  onMetabolismChange,
  drinks,
  onAddDrinkClick,
  onQuickAddDrink,
  onRemoveDrink,
  onUpdateTime,
  onLoadScenario,
  onReset,
}) => {
  const recommendedLimit = getRecommendedDailyIntake(weightKg);

  return (
    <div className="space-y-5">
      {/* 1. Body & Metabolism Setting Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Weight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">내 몸의 대사 조건 설정</h3>
              <p className="text-xs text-slate-500">체중과 간의 CYP1A2 효소 활성에 따른 대사 속도</p>
            </div>
          </div>

          {/* Quick Scenario Preset Dropdown / Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">예시 불러오기:</span>
            {SAMPLE_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => onLoadScenario(sc)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-slate-200"
              >
                {sc.title}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid: Weight & Metabolism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Weight */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="weight-input" className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>체중 (kg)</span>
                <span className="text-[11px] font-normal text-slate-500">
                  (권장량: {weightKg}kg × 2.5mg = <strong className="text-indigo-600">{recommendedLimit}mg</strong>)
                </span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="weight-input"
                  type="number"
                  min="30"
                  max="130"
                  value={weightKg}
                  onChange={(e) => onWeightChange(Math.max(20, Math.min(150, Number(e.target.value) || 30)))}
                  className="w-16 px-2 py-1 text-right text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-500">kg</span>
              </div>
            </div>

            <input
              type="range"
              min="35"
              max="110"
              step="1"
              value={weightKg}
              onChange={(e) => onWeightChange(Number(e.target.value))}
              aria-label="체중 (kg) 슬라이더"
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>35kg (초·중등)</span>
              <span>55kg (청소년 평균)</span>
              <span>75kg (성인)</span>
              <span>110kg</span>
            </div>
          </div>

          {/* Metabolism Speed Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                대사 타입 (CYP1A2 효소 활성)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                현재 반감기: <strong className="text-amber-700">{HALF_LIFE_MAP[metabolismSpeed]}시간</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['fast', 'normal', 'slow'] as MetabolismSpeed[]).map((speed) => {
                const info = METABOLISM_LABELS[speed];
                const isSelected = metabolismSpeed === speed;
                const halfLife = HALF_LIFE_MAP[speed];

                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => onMetabolismChange(speed)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-400/20 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-xs font-black">
                      {speed === 'fast' && '⚡ 빠름'}
                      {speed === 'normal' && '⚖️ 보통'}
                      {speed === 'slow' && '🐢 느림'}
                    </div>
                    <div className="text-[11px] text-indigo-600 font-mono font-bold mt-0.5">
                      반감기 {halfLife}시간
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {METABOLISM_LABELS[metabolismSpeed].geneNote}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Drink List & Quick Add Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">마신 음료 기록</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                  {drinks.length}개 섭취
                </span>
              </div>
              <p className="text-xs text-slate-500">
                음료를 추가하면 실시간으로 시간대별 대사 곡선에 합산 반영됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {drinks.length > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                모두 비우기
              </button>
            )}
            <button
              type="button"
              onClick={onAddDrinkClick}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              음료 직접 추가
            </button>
          </div>
        </div>

        {/* Quick 1-Click Adder Bar for Prompt's Official Presets */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            클릭 한 번으로 빠른 추가 (기준 카페인 함량):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {OFFICIAL_PRESETS.slice(0, 8).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onQuickAddDrink(preset.id)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-xs text-slate-800"
              >
                <span className="font-medium group-hover:text-amber-900">{preset.name}</span>
                <span className="text-[11px] font-mono font-bold text-amber-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 group-hover:border-amber-200">
                  {preset.caffeine}mg
                </span>
                <Plus className="w-3 h-3 text-slate-400 group-hover:text-amber-600 ml-0.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Active Drinks Table / Cards */}
        {drinks.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">기록된 음료가 없습니다</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              위의 빠른 추가 버튼을 누르거나 [음료 직접 추가]를 눌러 오늘 마셨거나 마실 예정인 음료와 시각을 등록해 보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {drinks.map((drink, index) => (
              <div
                key={drink.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{drink.drinkName}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        {drink.caffeine} mg
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>용량: {drink.amountInfo}</span>
                      <span>•</span>
                      <span>섭취 시각: <strong className="text-slate-800 font-mono">{drink.intakeTime}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="time"
                      value={drink.intakeTime}
                      onChange={(e) => onUpdateTime(drink.id, e.target.value)}
                      className="text-xs font-mono px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50"
                      title="섭취 시각 변경"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveDrink(drink.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="음료 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
