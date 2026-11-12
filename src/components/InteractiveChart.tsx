import React, { useState, useMemo, useRef } from 'react';
import { Quote, Candle } from '../types/market';
import { BarChart2, CandlestickChart, Activity, RefreshCw } from 'lucide-react';

interface InteractiveChartProps {
  quote: Quote;
  height?: number;
  onTradeClick?: () => void;
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '1Y' | 'ALL';
type ChartType = 'candles' | 'line' | 'heikin';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  quote,
  height = 420,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showMA, setShowMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(false);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Candles source
  const rawCandles = quote.candles && quote.candles.length > 5 ? quote.candles : [];

  // Filter or scale candles based on timeframe
  const candles = useMemo(() => {
    if (rawCandles.length === 0) return [];
    if (timeframe === '1D') return rawCandles.slice(-30);
    if (timeframe === '5D') return rawCandles.slice(-20);
    return rawCandles;
  }, [rawCandles, timeframe]);

  // Compute Moving Averages
  const ma20 = useMemo(() => {
    return candles.map((_, idx, arr) => {
      const windowSize = 10;
      if (idx < windowSize - 1) return null;
      const slice = arr.slice(idx - windowSize + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / windowSize;
    });
  }, [candles]);

  const ema50 = useMemo(() => {
    const k = 2 / (15 + 1);
    let prevEMA = candles[0]?.close || 0;
    return candles.map((c, idx) => {
      if (idx === 0) return prevEMA;
      prevEMA = c.close * k + prevEMA * (1 - k);
      return prevEMA;
    });
  }, [candles]);

  // Compute RSI (14)
  const rsiData = useMemo(() => {
    if (candles.length < 5) return [];
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;
    const period = 7;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      if (change > 0) gains += change;
      else losses += Math.abs(change);

      if (i < period) {
        rsi.push(null);
      } else {
        const avgGain = gains / period;
        const avgLoss = (losses / period) || 0.0001;
        const rs = avgGain / avgLoss;
        const val = 100 - (100 / (1 + rs));
        rsi.push(Math.min(100, Math.max(0, val)));
      }
    }
    return rsi;
  }, [candles]);

  // Dimensions
  const paddingRight = 72; // Price axis
  const paddingBottom = showRSI ? 120 : 36;
  const rsiHeight = 70;
  const paddingTop = 28;
  const paddingLeft = 16;

  const chartWidth = 780;
  const mainChartHeight = height - paddingBottom - paddingTop;

  // Price Extents
  const minPrice = useMemo(() => {
    if (!candles.length) return 0;
    const lows = candles.map(c => c.low);
    return Math.min(...lows) * 0.996;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return 100;
    const highs = candles.map(c => c.high);
    return Math.max(...highs) * 1.004;
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;

  // Max Volume
  const maxVolume = useMemo(() => {
    if (!candles.length) return 1;
    return Math.max(...candles.map(c => c.volume));
  }, [candles]);

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // Helper functions
  const getY = (val: number) => {
    return paddingTop + mainChartHeight - ((val - minPrice) / priceRange) * mainChartHeight;
  };

  const getX = (idx: number) => {
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const step = usableWidth / Math.max(1, candles.length);
    return paddingLeft + idx * step + step / 2;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const relativeX = Math.max(0, Math.min(x - paddingLeft, usableWidth));
    const step = usableWidth / Math.max(1, candles.length);
    const idx = Math.min(candles.length - 1, Math.max(0, Math.floor(relativeX / step)));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  // Build price ticks (5 evenly spaced lines)
  const priceTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const p = minPrice + (priceRange / (count - 1)) * i;
      ticks.push(p);
    }
    return ticks;
  }, [minPrice, priceRange]);

  // SVG Area / Line path generator
  const areaPath = useMemo(() => {
    if (chartType === 'candles') return '';
    const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`);
    return `M ${points.join(' L ')}`;
  }, [candles, chartType]);

  const areaFillPath = useMemo(() => {
    if (chartType === 'candles' || !candles.length) return '';
    const firstX = getX(0);
    const lastX = getX(candles.length - 1);
    const bottomY = paddingTop + mainChartHeight;
    return `${areaPath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [areaPath, candles, chartType]);

  // Moving Average Path
  const maPath = useMemo(() => {
    const valid = ma20
      .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
      .filter(Boolean);
    return valid.length ? `M ${valid.join(' L ')}` : '';
  }, [ma20]);

  // EMA Path
  const emaPath = useMemo(() => {
    const valid = ema50.map((val, i) => `${getX(i)},${getY(val)}`);
    return valid.length ? `M ${valid.join(' L ')}` : '';
  }, [ema50]);

  const isUp = (quote.changePercent ?? 0) >= 0;
  const candleColor = (c: Candle) => (c.close >= c.open ? '#089981' : '#f23645');

  return (
    <div className="flex flex-col w-full bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] rounded-xl overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#2a2e39] bg-[#1e222d]">
        {/* Left: Timeframe selectors */}
        <div className="flex items-center gap-1">
          {(['1D', '5D', '1M', '3M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                timeframe === tf
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {tf}
            </button>
          ))}

          <span className="h-4 w-px bg-[#2a2e39] mx-1" />

          {/* Chart Types */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setChartType('candles')}
              title="Candlestick Chart"
              className={`p-1.5 rounded transition-colors ${
                chartType === 'candles' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <CandlestickChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Line & Area Chart"
              className={`p-1.5 rounded transition-colors ${
                chartType === 'line' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Technical Indicator Toggles */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              showVolume ? 'bg-[#2a2e39] text-[#089981]' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            VOL
          </button>
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              showMA ? 'bg-[#2a2e39] text-[#f59e0b]' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            MA (20)
          </button>
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              showEMA ? 'bg-[#2a2e39] text-[#3b82f6]' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            EMA (50)
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              showRSI ? 'bg-[#2a2e39] text-[#a855f7]' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            RSI (14)
          </button>
        </div>
      </div>

      {/* Crosshair / Active Candle Legend Header */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-1.5 text-xs font-mono tabular-nums bg-[#131722]/90 border-b border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{quote.symbol}</span>
          <span className="text-[#787b86] text-[11px]">{quote.name}</span>
          <span className="text-[11px] px-1.5 py-0.2 bg-[#1e222d] border border-[#2a2e39] rounded text-slate-400">
            {quote.exchange || 'INDEX'}
          </span>
        </div>

        {activeCandle && (
          <div className="flex items-center gap-3 text-[11px] text-[#787b86]">
            <span>O: <strong className="text-white">{activeCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-[#089981]">{activeCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-[#f23645]">{activeCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#089981]' : 'text-[#f23645]'}>{activeCandle.close.toFixed(2)}</strong></span>
            {showVolume && <span>Vol: <strong className="text-white">{activeCandle.volume.toLocaleString()}</strong></span>}
          </div>
        )}
      </div>

      {/* Main SVG Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962ff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2962ff" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {priceTicks.map((p, i) => {
            const y = getY(p);
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#2a2e39"
                  strokeDasharray="2 3"
                  strokeWidth="0.8"
                />
                {/* Price labels on right axis */}
                <text
                  x={chartWidth - paddingRight + 8}
                  y={y + 3.5}
                  fill="#787b86"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {p > 1000 ? p.toFixed(1) : p > 1 ? p.toFixed(2) : p.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* Volume Histogram (bottom 25% of main chart) */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i);
              const barWidth = Math.max(2, (chartWidth - paddingLeft - paddingRight) / candles.length * 0.6);
              const volHeight = (c.volume / maxVolume) * (mainChartHeight * 0.28);
              const y = paddingTop + mainChartHeight - volHeight;
              const color = c.close >= c.open ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)';

              return (
                <rect
                  key={`vol-${i}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={volHeight}
                  fill={color}
                />
              );
            })}

          {/* Line/Area Mode */}
          {chartType === 'line' && (
            <>
              <path d={areaFillPath} fill="url(#chartAreaGradient)" />
              <path
                d={areaPath}
                fill="none"
                stroke="#2962ff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candlestick Mode */}
          {chartType === 'candles' &&
            candles.map((c, i) => {
              const x = getX(i);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const color = candleColor(c);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
              const candleWidth = Math.max(3, (chartWidth - paddingLeft - paddingRight) / candles.length * 0.68);

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="0.5"
                  />
                </g>
              );
            })}

          {/* Moving Average Overlays */}
          {showMA && maPath && (
            <path
              d={maPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          )}
          {showEMA && emaPath && (
            <path
              d={emaPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          )}

          {/* Current Live Price Level Line & Right Tag */}
          {candles.length > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(quote.price)}
                x2={chartWidth - paddingRight}
                y2={getY(quote.price)}
                stroke={isUp ? '#089981' : '#f23645'}
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />
              {/* Badge on Right Axis */}
              <rect
                x={chartWidth - paddingRight + 2}
                y={getY(quote.price) - 9}
                width={paddingRight - 4}
                height={18}
                fill={isUp ? '#089981' : '#f23645'}
                rx="2"
              />
              <text
                x={chartWidth - paddingRight + 6}
                y={getY(quote.price) + 3.5}
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {quote.price > 1000 ? quote.price.toFixed(1) : quote.price > 1 ? quote.price.toFixed(2) : quote.price.toFixed(4)}
              </text>
            </g>
          )}

          {/* Crosshair Lines when Hovering */}
          {mousePos && hoverIndex !== null && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={height - paddingBottom}
                stroke="#787b86"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Horizontal line */}
              <line
                x1={paddingLeft}
                y1={mousePos.y}
                x2={chartWidth - paddingRight}
                y2={mousePos.y}
                stroke="#787b86"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Sub-Chart: RSI (14) */}
          {showRSI && (
            <g transform={`translate(0, ${height - rsiHeight - 20})`}>
              <line
                x1={paddingLeft}
                y1={0}
                x2={chartWidth - paddingRight}
                y2={0}
                stroke="#2a2e39"
                strokeWidth="1"
              />
              {/* Overbought / Oversold Zones (70 and 30) */}
              <rect
                x={paddingLeft}
                y={rsiHeight * 0.3}
                width={chartWidth - paddingLeft - paddingRight}
                height={rsiHeight * 0.4}
                fill="rgba(168, 85, 247, 0.05)"
              />
              <line
                x1={paddingLeft}
                y1={rsiHeight * 0.3}
                x2={chartWidth - paddingRight}
                y2={rsiHeight * 0.3}
                stroke="#a855f7"
                strokeDasharray="2 3"
                strokeOpacity="0.4"
              />
              <line
                x1={paddingLeft}
                y1={rsiHeight * 0.7}
                x2={chartWidth - paddingRight}
                y2={rsiHeight * 0.7}
                stroke="#a855f7"
                strokeDasharray="2 3"
                strokeOpacity="0.4"
              />
              <text x={chartWidth - paddingRight + 8} y={rsiHeight * 0.3 + 3} fill="#a855f7" fontSize="8" fontFamily="JetBrains Mono">70</text>
              <text x={chartWidth - paddingRight + 8} y={rsiHeight * 0.7 + 3} fill="#a855f7" fontSize="8" fontFamily="JetBrains Mono">30</text>
              <text x={paddingLeft + 4} y={12} fill="#a855f7" fontSize="9" fontWeight="600">RSI (14)</text>

              {/* RSI Curve */}
              {(() => {
                const points = rsiData
                  .map((val, idx) => {
                    if (val === null) return null;
                    const x = getX(idx);
                    const y = rsiHeight - (val / 100) * rsiHeight;
                    return `${x},${y}`;
                  })
                  .filter(Boolean);
                return points.length ? (
                  <path
                    d={`M ${points.join(' L ')}`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                  />
                ) : null;
              })()}
            </g>
          )}

          {/* Bottom Time Axis Labels */}
          {candles.filter((_, i) => i % 6 === 0).map((c, i) => {
            const originalIndex = i * 6;
            return (
              <text
                key={`time-${i}`}
                x={getX(originalIndex)}
                y={height - 6}
                fill="#787b86"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {c.time}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
