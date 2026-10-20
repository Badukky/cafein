import React, { useState } from 'react';
import { DrinkPreset } from '../types';
import { OFFICIAL_PRESETS } from '../data/drinkPresets';
import { Plus, X, Coffee, Zap, Droplet, Sparkles } from 'lucide-react';

interface AddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrink: (entry: {
    drinkName: string;
    amountInfo: string;
    caffeine: number;
    intakeTime: string;
    presetId?: string;
  }) => void;
}

export const AddDrinkModal: React.FC<AddDrinkModalProps> = ({ isOpen, onClose, onAddDrink }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('specialty-coffee');
  const [customName, setCustomName] = useState('');
  const [customCaffeine, setCustomCaffeine] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState('350mL');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Time picker: default to current hour or sensible preset
  const now = new Date();
  const defaultHour = String(now.getHours()).padStart(2, '0');
  const defaultMin = String(Math.floor(now.getMinutes() / 10) * 10).padStart(2, '0');
  const [intakeTime, setIntakeTime] = useState(`${defaultHour}:${defaultMin}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCustomMode) {
      if (!customName.trim()) return;
      onAddDrink({
        drinkName: customName.trim(),
        amountInfo: customAmount.trim() || '1회분',
        caffeine: Number(customCaffeine) || 0,
        intakeTime,
      });
    } else {
      const preset = OFFICIAL_PRESETS.find((p) => p.id === selectedPresetId);
      if (!preset) return;
      onAddDrink({
        drinkName: preset.name,
        amountInfo: preset.defaultAmount,
        caffeine: preset.caffeine,
        intakeTime,
        presetId: preset.id,
      });
    }

    onClose();
  };

  const quickTimeButtons = [
    { label: '아침 등교/기상 (08:00)', time: '08:00' },
    { label: '점심 식후 (13:00)', time: '13:00' },
    { label: '오후 졸림 (15:30)', time: '15:30' },
    { label: '방과후/학원 (18:00)', time: '18:00' },
    { label: '야간 학습 (20:30)', time: '20:30' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">마신 음료 추가하기</h3>
              <p className="text-xs text-slate-500">음료 종류와 마신 시각을 지정하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Mode Switch (Preset vs Custom) */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                !isCustomMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              기본 음료 목록에서 선택
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                isCustomMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              직접 입력하기
            </button>
          </div>

          {!isCustomMode ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                음료 선택 (공식 기준 함량)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {OFFICIAL_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 leading-snug">{preset.name}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="text-slate-500">{preset.defaultAmount}</span>
                        <span className="font-mono font-bold text-amber-700">{preset.caffeine}mg</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  음료 이름
                </label>
                <input
                  type="text"
                  placeholder="예: 편의점 디카페인 라떼, 에너지바 등"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    카페인 함량 (mg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={customCaffeine}
                    onChange={(e) => setCustomCaffeine(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    용량/단위
                  </label>
                  <input
                    type="text"
                    placeholder="예: 300mL"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Intake Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                마신 시각 (24시간 형식)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">선택: {intakeTime}</span>
            </div>

            <input
              type="time"
              value={intakeTime}
              onChange={(e) => setIntakeTime(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              required
            />

            {/* Quick time suggestion pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickTimeButtons.map((btn) => (
                <button
                  key={btn.time}
                  type="button"
                  onClick={() => setIntakeTime(btn.time)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    intakeTime === btn.time
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              음료 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
