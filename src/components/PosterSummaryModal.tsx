import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DrinkEntry, MetabolismSpeed } from '../types';
import {
  getTotalIntake,
  getRecommendedDailyIntake,
  evaluateNight10,
  HALF_LIFE_MAP,
  METABOLISM_LABELS,
  findPeakCaffeine,
} from '../utils/caffeineCalculator';
import { X, Printer, Sparkles, AlertCircle, QrCode as QrIcon, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface PosterSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightKg: number;
  metabolismSpeed: MetabolismSpeed;
  drinks: DrinkEntry[];
}

export const PosterSummaryModal: React.FC<PosterSummaryModalProps> = ({
  isOpen,
  onClose,
  weightKg,
  metabolismSpeed,
  drinks,
}) => {
  const [studentName, setStudentName] = useState('홍길동');
  const [studentGrade, setStudentGrade] = useState('2학년 3반 15번');
  const [posterTitle, setPosterTitle] = useState('나의 카페인 대사시계와 수면 건강 리포트');
  const [studentNotes, setStudentNotes] = useState(
    '오후 4시 이후에 고카페인 에너지 음료를 마시면 밤 10시에도 카페인이 40mg 이상 남아 숙면을 방해하므로, 시험 기간이라도 카페인은 가급적 오전이나 점심 직후에만 섭취해야 함을 배웠습니다.'
  );
  const [qrDataUrl, setQrDataUrl] = useState('');

  const halfLife = HALF_LIFE_MAP[metabolismSpeed];
  const totalIntake = getTotalIntake(drinks);
  const recommendedLimit = getRecommendedDailyIntake(weightKg);
  const nightEval = evaluateNight10(drinks, halfLife);
  const peak = findPeakCaffeine(drinks, halfLife);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      QRCode.toDataURL(
        window.location.href,
        {
          width: 180,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        },
        (err, dataUrl) => {
          if (!err && dataUrl) setQrDataUrl(dataUrl);
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                [9차시] 벽보 포스터용 A4 출력 리포트
              </h3>
              <p className="text-xs text-slate-500">
                인쇄하거나 PDF로 저장하여 벽보에 부착할 수 있는 공식 리포트 양식입니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              지금 인쇄하기 (Ctrl+P)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Poster Canvas */}
        <div className="p-8 space-y-6 bg-white text-slate-900 font-sans print:p-0 print:space-y-4">
          {/* Poster Header */}
          <div className="border-b-2 border-indigo-600 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="text-xs font-extrabold text-indigo-700 tracking-wider uppercase mb-1">
                카페인 사용설명서 프로젝트 • 9차시 벽보 제출용
              </div>
              <input
                type="text"
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                className="text-2xl font-black text-slate-900 w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none bg-transparent"
              />
              <div className="text-xs text-slate-500 mt-1">
                1차 약동학 반감기 모델 기반 체내 잔존량 및 수면 영향 분석
              </div>
            </div>

            {/* Student ID / Name Inputs */}
            <div className="shrink-0 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold">학번/반</label>
                <input
                  type="text"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="text-xs font-bold text-slate-800 border-b border-slate-300 bg-transparent focus:outline-none w-24"
                />
              </div>
              <div className="border-l border-slate-200 pl-2">
                <label className="block text-[10px] text-slate-400 font-semibold">이름</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="text-xs font-bold text-slate-800 border-b border-slate-300 bg-transparent focus:outline-none w-20"
                />
              </div>
            </div>
          </div>

          {/* Key Parameters 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">나의 체중 & 권장 한도</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {weightKg} kg
              </div>
              <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                최대 권장량: {recommendedLimit} mg
              </div>
              <span className="text-[9px] text-slate-400">(체중 × 2.5mg/kg)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">CYP1A2 대사 속도</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {metabolismSpeed === 'fast' && '빠른 대사'}
                {metabolismSpeed === 'normal' && '보통 대사'}
                {metabolismSpeed === 'slow' && '느린 대사'}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                반감기: {halfLife}시간
              </div>
              <span className="text-[9px] text-slate-400">간 효소 활성도 반영</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">하루 총 섭취 카페인</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {totalIntake} mg
              </div>
              <div className={`text-[11px] font-bold mt-0.5 ${totalIntake > recommendedLimit ? 'text-rose-600' : 'text-emerald-700'}`}>
                {totalIntake > recommendedLimit ? '권장 섭취량 초과!' : '권장량 이내 안전'}
              </div>
              <span className="text-[9px] text-slate-400">마신 음료 {drinks.length}잔</span>
            </div>
          </div>

          {/* Table of Drinks Ingested */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 flex justify-between">
              <span>오늘 섭취한 음료 목록</span>
              <span>총 {drinks.length}종</span>
            </div>
            {drinks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">섭취 음료 없음</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">음료명</th>
                    <th className="px-4 py-2 font-medium">용량</th>
                    <th className="px-4 py-2 font-medium">카페인</th>
                    <th className="px-4 py-2 font-medium">마신 시각</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drinks.map((d, i) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-slate-400">{i + 1}</td>
                      <td className="px-4 py-2 font-bold text-slate-800">{d.drinkName}</td>
                      <td className="px-4 py-2 text-slate-600">{d.amountInfo}</td>
                      <td className="px-4 py-2 font-mono font-bold text-amber-700">{d.caffeine} mg</td>
                      <td className="px-4 py-2 font-mono text-slate-700">{d.intakeTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Key Simulation Results: Night 10 PM Evaluation & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left 2 Cols: Night 10 Status Card */}
            <div className={`col-span-2 p-4 rounded-xl border ${
              nightEval.status === 'safe'
                ? 'bg-emerald-50/70 border-emerald-200'
                : nightEval.status === 'caution'
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  🌙 밤 10시 (22:00) 잔존량 및 수면 진단
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  nightEval.status === 'safe'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : nightEval.status === 'caution'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {nightEval.statusLabel}
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">
                  {Math.round(nightEval.caffeineRemaining * 10) / 10} mg
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  (수면 방해 기준치: 25mg)
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {nightEval.statusDesc}
              </p>
            </div>

            {/* Right 1 Col: QR Code for the Wall Poster */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="웹페이지 QR코드"
                  className="w-24 h-24 rounded-lg border border-slate-200 bg-white p-1"
                />
              )}
              <span className="text-[10px] font-bold text-indigo-700 mt-1">
                벽보 부착용 대사시계 QR
              </span>
              <span className="text-[9px] text-slate-400">스캔하여 직접 계산해보기</span>
            </div>
          </div>

          {/* Student Notes / Key Learning for the Project */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              💡 나의 결론 및 건강한 카페인 섭취 실천 가이드
            </label>
            <textarea
              rows={3}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              className="w-full p-3 text-xs leading-relaxed border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 resize-none font-sans"
              placeholder="프로젝트 활동 후 나의 느낀 점과 앞으로의 실천 다짐을 적어주세요."
            />
          </div>

          {/* Required Educational Disclaimer */}
          <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
            ⚠️ <strong>본 프로그램은 교육용 단순화 모델(1차 약동학 모델)이며 의학적 조언이 아닙니다.</strong>
            <br />
            (공식 기준: 섭취량 × 0.5^(경과시간 ÷ 반감기) | 권장량 = 체중 × 2.5mg | 제작: 카페인 사용설명서 프로젝트)
          </div>
        </div>
      </div>
    </div>
  );
};
