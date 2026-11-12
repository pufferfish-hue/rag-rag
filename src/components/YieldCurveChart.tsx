import React, { useState } from 'react';
import { TREASURY_YIELD_CURVE } from '../data/mockMarketData';

export const YieldCurveChart: React.FC = () => {
  const [showMonthAgo, setShowMonthAgo] = useState(true);
  const [showYearAgo, setShowYearAgo] = useState(true);

  const width = 640;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const minYield = 3.8;
  const maxYield = 5.8;
  const yieldRange = maxYield - minYield;

  const getY = (val: number) => {
    return height - paddingBottom - ((val - minYield) / yieldRange) * (height - paddingTop - paddingBottom);
  };

  const getX = (idx: number) => {
    const usableWidth = width - paddingLeft - paddingRight;
    const step = usableWidth / (TREASURY_YIELD_CURVE.length - 1);
    return paddingLeft + idx * step;
  };

  // Generate paths
  const currentPath = `M ${TREASURY_YIELD_CURVE.map((d, i) => `${getX(i)},${getY(d.current)}`).join(' L ')}`;
  const monthAgoPath = `M ${TREASURY_YIELD_CURVE.map((d, i) => `${getX(i)},${getY(d.monthAgo)}`).join(' L ')}`;
  const yearAgoPath = `M ${TREASURY_YIELD_CURVE.map((d, i) => `${getX(i)},${getY(d.yearAgo)}`).join(' L ')}`;

  const yieldTicks = [4.0, 4.5, 5.0, 5.5];

  return (
    <div className="flex flex-col w-full bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">US Treasury Sovereign Yield Curve</h3>
          <p className="text-xs text-[#787b86]">Term structure of interest rates from 1 Month to 30 Years</p>
        </div>

        {/* Legend / Toggles */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#2962ff] rounded"></span>
            <span className="text-white font-medium">Current ({TREASURY_YIELD_CURVE.find(d => d.maturity === '10Y')?.current}% 10Y)</span>
          </div>

          <button
            onClick={() => setShowMonthAgo(!showMonthAgo)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
              showMonthAgo ? 'border-[#f59e0b]/40 text-[#f59e0b]' : 'border-[#2a2e39] text-[#787b86]'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-[#f59e0b] rounded"></span>
            <span>1 Mo Ago</span>
          </button>

          <button
            onClick={() => setShowYearAgo(!showYearAgo)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
              showYearAgo ? 'border-[#a855f7]/40 text-[#a855f7]' : 'border-[#2a2e39] text-[#787b86]'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-[#a855f7] rounded"></span>
            <span>1 Yr Ago</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Horizontal gridlines */}
          {yieldTicks.map((yVal) => {
            const y = getY(yVal);
            return (
              <g key={yVal}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#2a2e39"
                  strokeDasharray="2 3"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  fill="#787b86"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {yVal.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* 1 Year Ago curve */}
          {showYearAgo && (
            <path
              d={yearAgoPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* 1 Month Ago curve */}
          {showMonthAgo && (
            <path
              d={monthAgoPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Current Yield Curve */}
          <path
            d={currentPath}
            fill="none"
            stroke="#2962ff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Dots on Current Curve */}
          {TREASURY_YIELD_CURVE.map((d, i) => {
            const x = getX(i);
            const y = getY(d.current);
            return (
              <g key={d.maturity}>
                <circle cx={x} cy={y} r="3.5" fill="#2962ff" stroke="#1e222d" strokeWidth="1.5" />
                <text
                  x={x}
                  y={height - 10}
                  fill="#787b86"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {d.maturity}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
