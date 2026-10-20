import React, { useState, useMemo, useRef } from 'react';
import { DrinkEntry } from '../types';
import {
  generateTimelineData,
  calculateTotalRemainingAt,
  minutesToTimeString,
} from '../utils/caffeineCalculator';
import { Moon, Coffee, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface CaffeineChartProps {
  drinks: DrinkEntry[];
  halfLifeHours: number;
  weightKg: number;
  recommendedLimit: number;
}

export const CaffeineChart: React.FC<CaffeineChartProps> = ({
  drinks,
  halfLifeHours,
  recommendedLimit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverMinute, setHoverMinute] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'24h' | 'dayOnly'>('24h');

  // Start at 06:00 (360m). DayOnly goes to 24:00 (1440m). 24h goes to next day 08:00 (1920m).
  const startMinute = 6 * 60;
  const endMinute = viewMode === 'dayOnly' ? 24 * 60 : 32 * 60; // 08:00 next day
  const totalSpanMinutes = endMinute - startMinute;

  // Generate points
  const points = useMemo(() => {
    return generateTimelineData(drinks, halfLifeHours, startMinute, endMinute, 10);
  }, [drinks, halfLifeHours, startMinute, endMinute]);

  // Max Y value calculation
  const maxDataVal = useMemo(() => {
    if (points.length === 0) return 100;
    const maxVal = Math.max(...points.map((p) => p.totalCaffeine));
    return Math.max(maxVal, recommendedLimit, 100);
  }, [points, recommendedLimit]);

  const yMax = Math.ceil((maxDataVal * 1.15) / 20) * 20;

  // SVG dimensions
  const width = 800;
  const height = 360;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (minute: number) => {
    const clamped = Math.max(startMinute, Math.min(endMinute, minute));
    return padding.left + ((clamped - startMinute) / totalSpanMinutes) * graphWidth;
  };

  const scaleY = (val: number) => {
    return padding.top + graphHeight - (Math.min(val, yMax) / yMax) * graphHeight;
  };

  // Build SVG path
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      const x = scaleX(pt.minutesFromMidnight);
      const y = scaleY(pt.totalCaffeine);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [points, yMax, graphWidth, graphHeight]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    const firstX = scaleX(points[0].minutesFromMidnight);
    const lastX = scaleX(points[points.length - 1].minutesFromMidnight);
    const bottomY = scaleY(0);
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, yMax]);

  // Key reference positions
  const night10Minute = 22 * 60; // 1320
  const night10X = scaleX(night10Minute);
  const night10Remaining = useMemo(() => {
    return calculateTotalRemainingAt(drinks, night10Minute, halfLifeHours);
  }, [drinks, halfLifeHours]);
  const night10Y = scaleY(night10Remaining);

  const safeLineY = scaleY(25); // 25mg bedtime threshold

  // X-axis ticks (every 3 hours)
  const xTicks = useMemo(() => {
    const ticks: { minute: number; label: string; isNight10?: boolean }[] = [];
    for (let m = startMinute; m <= endMinute; m += 180) {
      ticks.push({
        minute: m,
        label: minutesToTimeString(m, true),
      });
    }
    return ticks;
  }, [startMinute, endMinute]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const step = yMax / count;
    return Array.from({ length: count + 1 }, (_, i) => Math.round(i * step));
  }, [yMax]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = (clientX - (padding.left * rect.width) / width) / ((graphWidth * rect.width) / width);
    const minute = Math.round(startMinute + ratio * totalSpanMinutes);
    if (minute >= startMinute && minute <= endMinute) {
      setHoverMinute(minute);
    }
  };

  const activeHoverData = useMemo(() => {
    if (hoverMinute === null) return null;
    const amount = calculateTotalRemainingAt(drinks, hoverMinute, halfLifeHours);
    const activeDrinks = drinks
      .map((d) => {
        if (hoverMinute < d.intakeMinutes) return null;
        const elapsed = (hoverMinute - d.intakeMinutes) / 60;
        const rem = d.caffeine * Math.pow(0.5, elapsed / halfLifeHours);
        return { name: d.drinkName, rem };
      })
      .filter((d): d is { name: string; rem: number } => d !== null && d.rem > 0.1);

    return {
      minute: hoverMinute,
      timeStr: minutesToTimeString(hoverMinute, true),
      amount: Math.round(amount * 10) / 10,
      activeDrinks,
    };
  }, [hoverMinute, drinks, halfLifeHours]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              시간대별 체내 카페인 잔존량 곡선
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              반감기 {halfLifeHours}시간 기준
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            그래프에 마우스를 올리면 특정 시각의 잔존량과 마신 음료별 분해 현황을 확인할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setViewMode('24h')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === '24h' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              24시간+ 익일 수면 보기
            </button>
            <button
              onClick={() => setViewMode('dayOnly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'dayOnly' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              낮~자정 (06:00~24:00)
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair touch-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverMinute(null)}
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="caffeineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.0" />
            </linearGradient>

            {/* Night shaded area (22:00 to 07:00 next day) */}
            <pattern id="nightStripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.15" />
            </pattern>
          </defs>

          {/* Background: Sleep zone (from 22:00 onwards) */}
          <rect
            x={night10X}
            y={padding.top}
            width={Math.max(0, scaleX(Math.min(endMinute, 31 * 60)) - night10X)}
            height={graphHeight}
            fill="#e0e7ff"
            fillOpacity="0.3"
          />

          {/* Grid lines - horizontal */}
          {yTicks.map((val) => {
            const y = scaleY(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono"
                >
                  {val}mg
                </text>
              </g>
            );
          })}

          {/* Grid lines - vertical */}
          {xTicks.map((tick) => {
            const x = scaleX(tick.minute);
            return (
              <g key={`x-${tick.minute}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-[11px] fill-slate-500 font-medium"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Safe threshold horizontal line (25mg) */}
          {safeLineY >= padding.top && safeLineY <= height - padding.bottom && (
            <g>
              <line
                x1={padding.left}
                y1={safeLineY}
                x2={width - padding.right}
                y2={safeLineY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <rect
                x={width - padding.right - 145}
                y={safeLineY - 18}
                width="145"
                height="16"
                rx="4"
                fill="#ecfdf5"
                stroke="#a7f3d0"
                strokeWidth="1"
              />
              <text
                x={width - padding.right - 72}
                y={safeLineY - 6}
                textAnchor="middle"
                className="text-[10px] fill-emerald-700 font-semibold"
              >
                숙면 안전 기준 (25mg 이하)
              </text>
            </g>
          )}

          {/* Caffeine Curve Area & Line */}
          {pathD && (
            <>
              <path d={areaD} fill="url(#caffeineGradient)" />
              <path
                d={pathD}
                fill="none"
                stroke="#d97706"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Markers for Drink Intake Events */}
          {drinks.map((drink, idx) => {
            const drinkX = scaleX(drink.intakeMinutes);
            if (drinkX < padding.left || drinkX > width - padding.right) return null;
            const currentCaff = calculateTotalRemainingAt(drinks, drink.intakeMinutes, halfLifeHours);
            const drinkY = scaleY(currentCaff);

            return (
              <g key={`intake-${drink.id || idx}`}>
                {/* Vertical intake stem */}
                <line
                  x1={drinkX}
                  y1={height - padding.bottom}
                  x2={drinkX}
                  y2={drinkY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                {/* Pulse circle */}
                <circle cx={drinkX} cy={drinkY} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                {/* Intake badge */}
                <g transform={`translate(${drinkX}, ${Math.max(padding.top + 10, drinkY - 24)})`}>
                  <rect
                    x="-42"
                    y="-12"
                    width="84"
                    height="18"
                    rx="9"
                    fill="#451a03"
                    opacity="0.85"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[9px] fill-amber-100 font-semibold"
                  >
                    +{drink.caffeine}mg ({drink.intakeTime})
                  </text>
                </g>
              </g>
            );
          })}

          {/* 22:00 (밤 10시) Special Marker Line */}
          {night10X >= padding.left && night10X <= width - padding.right && (
            <g>
              <line
                x1={night10X}
                y1={padding.top}
                x2={night10X}
                y2={height - padding.bottom}
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              {/* Highlight circle on curve */}
              <circle
                cx={night10X}
                cy={night10Y}
                r="7"
                fill={night10Remaining > 50 ? '#ef4444' : night10Remaining > 25 ? '#f59e0b' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              {/* Night 10 Badge on Top */}
              <g transform={`translate(${night10X}, ${padding.top - 8})`}>
                <rect
                  x="-48"
                  y="-16"
                  width="96"
                  height="22"
                  rx="6"
                  fill="#4338ca"
                  stroke="#a5b4fc"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] fill-white font-bold"
                >
                  🌙 밤 10시 (22:00)
                </text>
              </g>

              {/* Remaining value badge at 22:00 point */}
              <g transform={`translate(${night10X + (night10X > width - 120 ? -60 : 12)}, ${Math.max(padding.top + 20, night10Y - 10)})`}>
                <rect
                  x="0"
                  y="-12"
                  width="68"
                  height="20"
                  rx="4"
                  fill={night10Remaining > 50 ? '#fee2e2' : night10Remaining > 25 ? '#fef3c7' : '#d1fae5'}
                  stroke={night10Remaining > 50 ? '#f87171' : night10Remaining > 25 ? '#fbbf24' : '#6ee7b7'}
                  strokeWidth="1"
                />
                <text
                  x="34"
                  y="-1"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[10px] font-bold ${
                    night10Remaining > 50 ? 'fill-red-800' : night10Remaining > 25 ? 'fill-amber-800' : 'fill-emerald-800'
                  }`}
                >
                  {Math.round(night10Remaining * 10) / 10} mg
                </text>
              </g>
            </g>
          )}

          {/* Interactive Hover Crosshair */}
          {activeHoverData && (
            <g>
              <line
                x1={scaleX(activeHoverData.minute)}
                y1={padding.top}
                x2={scaleX(activeHoverData.minute)}
                y2={height - padding.bottom}
                stroke="#0f172a"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={scaleX(activeHoverData.minute)}
                cy={scaleY(activeHoverData.amount)}
                r="5"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip during Hover */}
        {activeHoverData && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-900/95 text-white p-3 rounded-xl shadow-xl backdrop-blur-xs text-xs border border-slate-700 w-52"
            style={{
              left: `${Math.min(
                Math.max(10, ((scaleX(activeHoverData.minute) - padding.left) / graphWidth) * 100),
                70
              )}%`,
              top: '15px',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-1.5">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                {activeHoverData.timeStr}
              </span>
              <span className="font-mono text-sm font-extrabold text-white">
                {activeHoverData.amount} <span className="text-[10px] font-normal text-slate-300">mg</span>
              </span>
            </div>

            {activeHoverData.activeDrinks.length > 0 ? (
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-medium">잔여 기여 음료:</div>
                {activeHoverData.activeDrinks.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="truncate max-w-[120px] text-slate-200">{ad.name}</span>
                    <span className="font-mono text-amber-300">
                      {Math.round(ad.rem * 10) / 10}mg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">카페인 섭취 전 상태 (0 mg)</div>
            )}
          </div>
        )}
      </div>

      {/* Legend & Key Indicators Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full inline-block"></span>
            <span>체내 잔존량 곡선</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-500 inline-block"></span>
            <span>수면 안전 기준 (25mg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-indigo-500 inline-block"></span>
            <span className="text-indigo-700 font-medium">밤 10시 취침 판정선</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="inline-block w-3 h-3 bg-indigo-100 border border-indigo-300 rounded-xs"></span>
          <span>수면 권장 시간대 (22:00 이후)</span>
        </div>
      </div>
    </div>
  );
};
