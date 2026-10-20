import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Dna, Moon, Activity, Sparkles, ShieldAlert } from 'lucide-react';

export const EducationalGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-gradient-to-r from-amber-50/50 to-indigo-50/50 hover:from-amber-50 hover:to-indigo-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>[카페인 사용설명서] 과학적 원리와 대사 메커니즘 알아보기</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                탐구 가이드
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              CYP1A2 유전자, 아데노신 수용체, 반감기 공식의 과학적 배경
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
          <span>{isOpen ? '접기' : '자세히 보기'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200 bg-white space-y-6 text-slate-700 text-xs leading-relaxed animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Pharmacokinetics formula */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Activity className="w-4 h-4 text-amber-600" />
                1차 약동학 모델 공식
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-amber-900 font-bold text-center">
                잔존량 = 섭취량 × 0.5^(경과시간 ÷ 반감기)
              </div>
              <p className="text-slate-600">
                인체는 흡수된 카페인을 일정한 비율(지수 함수적 감쇠)로 분해합니다. 반감기(Half-life)가 지날 때마다 체내 잔여량은 절반씩 줄어듭니다.
              </p>
            </div>

            {/* 2. CYP1A2 Enzyme */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Dna className="w-4 h-4 text-indigo-600" />
                CYP1A2 효소와 개인차
              </div>
              <p className="text-slate-600">
                카페인의 약 95%는 간의 <strong className="text-slate-900">CYP1A2 효소</strong>에 의해 대사됩니다. 유전자 다형성에 따라 대사가 빠른 사람(반감기 약 3시간), 보통(약 5시간), 느린 사람(약 7시간 이상)으로 나뉩니다.
              </p>
              <div className="text-[11px] text-indigo-700 font-medium">
                * 청소년기는 간 대사 효소 발달 중으로 성인보다 민감할 수 있습니다.
              </div>
            </div>

            {/* 3. Adenosine & Sleep */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Moon className="w-4 h-4 text-purple-600" />
                아데노신과 밤 10시 수면
              </div>
              <p className="text-slate-600">
                카페인은 수면 유도 물질인 <strong className="text-slate-900">아데노신(Adenosine)</strong>의 수용체에 대신 결합하여 졸음을 일시적으로 속입니다.
              </p>
              <div className="text-[11px] text-purple-700 font-medium">
                * 밤 10시에 카페인이 25mg 이상 남아있으면 깊은 잠(N3 단계) 진입이 어려워 다음날 뇌 피로가 누적됩니다.
              </div>
            </div>
          </div>

          {/* Why Youth limit 2.5mg/kg */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-xs">
                식약처 지정 청소년 일일 최대 권장량: 체중 1kg당 2.5mg 이하
              </div>
              <p className="text-slate-700">
                성장기 청소년의 과도한 카페인 섭취는 장에서 칼슘 및 철분의 체내 흡수를 방해하여 뼈 성장과 빈혈에 악영향을 줄 수 있습니다. 또한 중추신경계 자극으로 인한 신경과민, 두근거림, 수면장애가 성인보다 쉽게 유발됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
