/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DrinkEntry, MetabolismSpeed } from './types';
import {
  HALF_LIFE_MAP,
  getRecommendedDailyIntake,
  timeStringToMinutes,
} from './utils/caffeineCalculator';
import { ScenarioPreset } from './data/drinkPresets';
import { CaffeineChart } from './components/CaffeineChart';
import { NightStatusCard } from './components/NightStatusCard';
import { DailyIntakeGauge } from './components/DailyIntakeGauge';
import { UserProfileSection } from './components/UserProfileSection';
import { AddDrinkModal } from './components/AddDrinkModal';
import { QRCodeModal } from './components/QRCodeModal';
import { PosterSummaryModal } from './components/PosterSummaryModal';
import { EducationalGuide } from './components/EducationalGuide';
import {
  Clock,
  Sparkles,
  QrCode,
  Printer,
  ShieldAlert,
  Share2,
  Check,
} from 'lucide-react';

const STORAGE_KEY = 'my_caffeine_clock_state_v1';

export default function App() {
  // State with LocalStorage fallbacks
  const [weightKg, setWeightKg] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.weightKg) return Number(parsed.weightKg);
      }
    } catch (e) {
      // ignore
    }
    return 55; // Standard youth benchmark
  });

  const [metabolismSpeed, setMetabolismSpeed] = useState<MetabolismSpeed>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.metabolismSpeed) return parsed.metabolismSpeed;
      }
    } catch (e) {
      // ignore
    }
    return 'normal'; // 5h half-life
  });

  const [drinks, setDrinks] = useState<DrinkEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.drinks)) return parsed.drinks;
      }
    } catch (e) {
      // ignore
    }
    // Default initial sample for instant visual comprehension
    return [
      {
        id: 'initial-1',
        drinkName: '커피우유 (삼각/팩)',
        amountInfo: '200mL',
        caffeine: 47,
        intakeTime: '08:30',
        intakeMinutes: timeStringToMinutes('08:30'),
      },
      {
        id: 'initial-2',
        drinkName: '커피음료 (캔/페트)',
        amountInfo: '250mL',
        caffeine: 103,
        intakeTime: '13:30',
        intakeMinutes: timeStringToMinutes('13:30'),
      },
    ];
  });

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          weightKg,
          metabolismSpeed,
          drinks,
        })
      );
    } catch (e) {
      // ignore
    }
  }, [weightKg, metabolismSpeed, drinks]);

  const halfLifeHours = HALF_LIFE_MAP[metabolismSpeed];
  const recommendedLimit = getRecommendedDailyIntake(weightKg);

  // Drink handlers
  const handleAddDrink = (entry: {
    drinkName: string;
    amountInfo: string;
    caffeine: number;
    intakeTime: string;
    presetId?: string;
  }) => {
    const newEntry: DrinkEntry = {
      id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      presetId: entry.presetId,
      drinkName: entry.drinkName,
      amountInfo: entry.amountInfo,
      caffeine: entry.caffeine,
      intakeTime: entry.intakeTime,
      intakeMinutes: timeStringToMinutes(entry.intakeTime),
    };

    setDrinks((prev) => [...prev, newEntry].sort((a, b) => a.intakeMinutes - b.intakeMinutes));
  };

  const handleQuickAdd = (presetId: string) => {
    // Current time rounded to nearest 10 min
    const now = new Date();
    const currentH = String(now.getHours()).padStart(2, '0');
    const currentM = String(Math.floor(now.getMinutes() / 10) * 10).padStart(2, '0');
    const defaultTime = `${currentH}:${currentM}`;

    // Find preset
    import('./data/drinkPresets').then(({ OFFICIAL_PRESETS }) => {
      const p = OFFICIAL_PRESETS.find((x) => x.id === presetId);
      if (p) {
        handleAddDrink({
          presetId: p.id,
          drinkName: p.name,
          amountInfo: p.defaultAmount,
          caffeine: p.caffeine,
          intakeTime: defaultTime,
        });
      }
    });
  };

  const handleRemoveDrink = (id: string) => {
    setDrinks((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateTime = (id: string, newTime: string) => {
    setDrinks((prev) =>
      prev
        .map((d) =>
          d.id === id
            ? { ...d, intakeTime: newTime, intakeMinutes: timeStringToMinutes(newTime) }
            : d
        )
        .sort((a, b) => a.intakeMinutes - b.intakeMinutes)
    );
  };

  const handleLoadScenario = (sc: ScenarioPreset) => {
    setWeightKg(sc.weight);
    setMetabolismSpeed(sc.speed);
    const newDrinks: DrinkEntry[] = sc.drinks.map((d, idx) => ({
      id: `scenario-${Date.now()}-${idx}`,
      presetId: d.presetId,
      drinkName: d.drinkName,
      amountInfo: d.amountInfo,
      caffeine: d.caffeine,
      intakeTime: d.intakeTime,
      intakeMinutes: timeStringToMinutes(d.intakeTime),
    }));
    setDrinks(newDrinks.sort((a, b) => a.intakeMinutes - b.intakeMinutes));
  };

  const handleReset = () => {
    if (window.confirm('등록된 모든 음료를 비우시겠습니까?')) {
      setDrinks([]);
    }
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      {/* Top Navigation & Applet Branding */}
      <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  카페인 사용설명서 프로젝트
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                나의 카페인 대사시계
              </h1>
            </div>
          </div>

          {/* Action buttons: 9차시 QR코드 & 벽보 인쇄 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="링크 복사"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? '링크 복사됨' : '공유 링크'}
            </button>

            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>9차시 벽보용 QR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">벽보 리포트</span> 인쇄
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Project Intro Notice Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 rounded-2xl p-4 sm:p-5 border border-amber-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-600 text-white">
                프로젝트 안내
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                마신 음료와 시각을 입력하면, 시간이 지나면서 내 몸에 카페인이 얼마나 남는지 보여줍니다.
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              간의 CYP1A2 대사 효소 활성에 따른 개인별 반감기(3시간 / 5시간 / 7시간)와 체중 기준 권장량(체중 × 2.5mg),
              그리고 <strong className="text-indigo-800">밤 10시 수면 안전도</strong>를 실시간으로 탐구해보세요.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-indigo-900 bg-white/80 px-3.5 py-2 rounded-xl border border-indigo-100 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>9차시 벽보 제작용 QR 생성 지원</span>
          </div>
        </div>

        {/* 1. Core Visual: The Caffeine Metabolism Curve (Chart) */}
        <section aria-label="카페인 대사 곡선 그래프">
          <CaffeineChart
            drinks={drinks}
            halfLifeHours={halfLifeHours}
            weightKg={weightKg}
            recommendedLimit={recommendedLimit}
          />
        </section>

        {/* 2. Key Diagnostic Outputs Grid: Night 10 Status & Daily Intake Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section aria-label="밤 10시 수면 영향도">
            <NightStatusCard
              drinks={drinks}
              halfLifeHours={halfLifeHours}
              metabolismSpeed={metabolismSpeed}
            />
          </section>

          <section aria-label="하루 총 섭취량과 권장량 비교">
            <DailyIntakeGauge drinks={drinks} weightKg={weightKg} />
          </section>
        </div>

        {/* 3. Inputs Section: Weight, Metabolism Speed, and Drinks Management */}
        <section aria-label="대사 조건 및 음료 입력">
          <UserProfileSection
            weightKg={weightKg}
            onWeightChange={setWeightKg}
            metabolismSpeed={metabolismSpeed}
            onMetabolismChange={setMetabolismSpeed}
            drinks={drinks}
            onAddDrinkClick={() => setIsAddModalOpen(true)}
            onQuickAddDrink={handleQuickAdd}
            onRemoveDrink={handleRemoveDrink}
            onUpdateTime={handleUpdateTime}
            onLoadScenario={handleLoadScenario}
            onReset={handleReset}
          />
        </section>

        {/* 4. Educational Pharmacology Accordion */}
        <section aria-label="카페인 과학 원리">
          <EducationalGuide />
        </section>
      </main>

      {/* Footer with MANDATORY Educational Disclaimer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>필수 안내</span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-800">
            ⚠️ 본 프로그램은 교육용 단순화 모델(1차 약동학 모델)이며 의학적 조언이 아닙니다.
          </p>

          <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            공식: 잔존량 = 섭취량 × 0.5^(경과시간 ÷ 반감기) | 빠른 대사(3시간) / 보통 대사(5시간) / 느린 대사(7시간)
            <br />
            개인의 건강 상태, 기저 질환, 약물 복용(피임약, 항우울제 등), 간 기능 등에 따라 실제 체내 대사는 상이할 수 있습니다.
          </p>

          <div className="pt-2 text-[10px] text-slate-400">
            나의 카페인 대사시계 • [카페인 사용설명서 프로젝트] 교육 및 벽보 발표용
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddDrinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDrink={handleAddDrink}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onOpenPosterPrint={() => setIsPosterModalOpen(true)}
      />

      <PosterSummaryModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        weightKg={weightKg}
        metabolismSpeed={metabolismSpeed}
        drinks={drinks}
      />
    </div>
  );
}
