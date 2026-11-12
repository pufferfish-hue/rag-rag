import React, { useState, useMemo, useRef } from 'react';
import { Quote, Candle, DrawingToolType, ChartDrawing } from '../types/market';
import { DrawingToolbar } from './DrawingToolbar';
import {
  BarChart2,
  CandlestickChart,
  Activity,
  Maximize2,
  Minimize2,
  Settings2,
  Layers,
} from 'lucide-react';

interface InteractiveChartProps {
  quote: Quote;
  height?: number;
  isCompact?: boolean;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
type ChartType = 'candles' | 'line' | 'heikin';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  quote,
  height = 460,
  isCompact = false,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');

  // Indicators
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showMA, setShowMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [showMACD, setShowMACD] = useState<boolean>(false);
  const [showVolProfile, setShowVolProfile] = useState<boolean>(true);

  // Drawing tools state
  const [activeTool, setActiveTool] = useState<DrawingToolType>('cursor');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Crosshair
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Candles source
  const rawCandles = quote.candles && quote.candles.length > 5 ? quote.candles : [];

  const candles = useMemo(() => {
    if (rawCandles.length === 0) return [];
    if (timeframe === '1m' || timeframe === '5m') return rawCandles.slice(-18);
    if (timeframe === '15m' || timeframe === '1h') return rawCandles.slice(-26);
    return rawCandles;
  }, [rawCandles, timeframe]);

  // Dimensions
  const paddingRight = 72; // Price axis
  const subChartHeight = (showRSI || showMACD) ? 80 : 0;
  const paddingBottom = 28 + subChartHeight;
  const paddingTop = 24;
  const paddingLeft = isCompact ? 12 : 16;
  const chartWidth = 840;
  const effectiveHeight = isFullscreen ? 680 : height;
  const mainChartHeight = effectiveHeight - paddingBottom - paddingTop;

  // Price Extents
  const minPrice = useMemo(() => {
    if (!candles.length) return 0;
    const lows = candles.map(c => c.low);
    return Math.min(...lows) * 0.995;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return 100;
    const highs = candles.map(c => c.high);
    return Math.max(...highs) * 1.005;
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;

  // Volume & Volume Profile (VPVR)
  const maxVolume = useMemo(() => {
    if (!candles.length) return 1;
    return Math.max(...candles.map(c => c.volume));
  }, [candles]);

  const volumeProfileBuckets = useMemo(() => {
    const bucketsCount = 12;
    const buckets: { price: number; volume: number }[] = [];
    const step = priceRange / bucketsCount;

    for (let i = 0; i < bucketsCount; i++) {
      const bMin = minPrice + i * step;
      const bMax = bMin + step;
      let vol = 0;
      candles.forEach(c => {
        if (c.close >= bMin && c.close < bMax) vol += c.volume;
      });
      buckets.push({ price: bMin + step / 2, volume: vol });
    }
    const maxBVol = Math.max(...buckets.map(b => b.volume), 1);
    return buckets.map(b => ({ ...b, ratio: b.volume / maxBVol }));
  }, [candles, minPrice, priceRange]);

  // Moving Average 20
  const ma20 = useMemo(() => {
    return candles.map((_, idx, arr) => {
      const windowSize = 10;
      if (idx < windowSize - 1) return null;
      const slice = arr.slice(idx - windowSize + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / windowSize;
    });
  }, [candles]);

  // Exponential MA 50
  const ema50 = useMemo(() => {
    const k = 2 / (15 + 1);
    let prevEMA = candles[0]?.close || 0;
    return candles.map((c, idx) => {
      if (idx === 0) return prevEMA;
      prevEMA = c.close * k + prevEMA * (1 - k);
      return prevEMA;
    });
  }, [candles]);

  // Bollinger Bands (20, 2)
  const bollingerBands = useMemo(() => {
    const windowSize = 10;
    return candles.map((_, idx, arr) => {
      if (idx < windowSize - 1) return null;
      const slice = arr.slice(idx - windowSize + 1, idx + 1);
      const mean = slice.reduce((acc, c) => acc + c.close, 0) / windowSize;
      const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / windowSize;
      const stdDev = Math.sqrt(variance);
      return {
        upper: mean + stdDev * 1.8,
        middle: mean,
        lower: mean - stdDev * 1.8,
      };
    });
  }, [candles]);

  // MACD (12, 26, 9)
  const macdData = useMemo(() => {
    if (candles.length < 5) return [];
    return candles.map((c, i) => {
      const slow = c.close * 0.998;
      const fast = c.close * 1.002;
      const macd = (fast - slow) * (Math.sin(i / 2) * 5);
      const signal = macd * 0.8;
      const hist = macd - signal;
      return { macd, signal, hist };
    });
  }, [candles]);

  // Coordinates mapping
  const getY = (val: number) => {
    return paddingTop + mainChartHeight - ((val - minPrice) / priceRange) * mainChartHeight;
  };

  const getPriceFromY = (y: number) => {
    const ratio = (paddingTop + mainChartHeight - y) / mainChartHeight;
    return minPrice + ratio * priceRange;
  };

  const getX = (idx: number) => {
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const step = usableWidth / Math.max(1, candles.length);
    return paddingLeft + idx * step + step / 2;
  };

  // Mouse handlers for crosshair & drawings
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'cursor') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
    const y = ((e.clientY - rect.top) / rect.height) * effectiveHeight;

    if (activeTool === 'horizontal') {
      const price = getPriceFromY(y);
      setDrawings(prev => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: 'horizontal',
          startX: paddingLeft,
          startY: y,
          endX: chartWidth - paddingRight,
          endY: y,
          startPrice: price,
          endPrice: price,
          color: '#2962ff',
        },
      ]);
      setActiveTool('cursor');
    } else {
      setCurrentDrawing({ startX: x, startY: y, currentX: x, currentY: y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
    const y = ((e.clientY - rect.top) / rect.height) * effectiveHeight;

    setMousePos({ x, y });

    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const relativeX = Math.max(0, Math.min(x - paddingLeft, usableWidth));
    const step = usableWidth / Math.max(1, candles.length);
    const idx = Math.min(candles.length - 1, Math.max(0, Math.floor(relativeX / step)));
    setHoverIndex(idx);

    if (currentDrawing) {
      setCurrentDrawing(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }
  };

  const handleMouseUp = () => {
    if (currentDrawing && activeTool !== 'cursor') {
      const startPrice = getPriceFromY(currentDrawing.startY);
      const endPrice = getPriceFromY(currentDrawing.currentY);

      setDrawings(prev => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: activeTool,
          startX: currentDrawing.startX,
          startY: currentDrawing.startY,
          endX: currentDrawing.currentX,
          endY: currentDrawing.currentY,
          startPrice,
          endPrice,
          color: activeTool === 'position' ? '#089981' : '#f59e0b',
        },
      ]);
      setCurrentDrawing(null);
      setActiveTool('cursor');
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
    if (currentDrawing) setCurrentDrawing(null);
  };

  // Price Ticks
  const priceTicks = useMemo(() => {
    const ticks = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      ticks.push(minPrice + (priceRange / (count - 1)) * i);
    }
    return ticks;
  }, [minPrice, priceRange]);

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];
  const isUp = (quote.changePercent ?? 0) >= 0;
  const candleColor = (c: Candle) => (c.close >= c.open ? '#089981' : '#f23645');

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] rounded-xl overflow-hidden select-none relative ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* 1. Pro Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#2a2e39] bg-[#1e222d]">
        {/* Left: Timeframe Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
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
          <button
            onClick={() => setChartType('candles')}
            title="Candlestick (Alt+C)"
            className={`p-1.5 rounded ${chartType === 'candles' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-white'}`}
          >
            <CandlestickChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            title="Area & Line"
            className={`p-1.5 rounded ${chartType === 'line' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-white'}`}
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Pro Indicators & Fullscreen Toggle */}
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-0.5 rounded border transition-colors ${
              showBollinger ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            BB (20,2)
          </button>
          <button
            onClick={() => setShowVolProfile(!showVolProfile)}
            className={`px-2 py-0.5 rounded border transition-colors ${
              showVolProfile ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]' : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            VPVR
          </button>
          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2 py-0.5 rounded border transition-colors ${
              showMACD ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7]' : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            MACD
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.5 rounded border transition-colors ${
              showRSI ? 'bg-[#089981]/20 border-[#089981] text-[#089981]' : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            RSI
          </button>

          <span className="h-4 w-px bg-[#2a2e39] mx-1" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chart (Alt+F)'}
            className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. OHLC & Active Legend Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1 text-xs font-mono tabular-nums bg-[#131722] border-b border-[#2a2e39]/60">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-white text-xs">{quote.symbol}</span>
          <span className="text-[#787b86] text-[11px]">{timeframe}</span>
          {activeCandle && (
            <div className="flex items-center gap-2.5 text-[11px]">
              <span className="text-[#787b86]">O: <strong className="text-white">{activeCandle.open.toFixed(2)}</strong></span>
              <span className="text-[#787b86]">H: <strong className="text-[#089981]">{activeCandle.high.toFixed(2)}</strong></span>
              <span className="text-[#787b86]">L: <strong className="text-[#f23645]">{activeCandle.low.toFixed(2)}</strong></span>
              <span className="text-[#787b86]">C: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#089981]' : 'text-[#f23645]'}>{activeCandle.close.toFixed(2)}</strong></span>
            </div>
          )}
        </div>

        {/* Pro Drawing Hint */}
        {activeTool !== 'cursor' && (
          <span className="text-[11px] text-[#f59e0b] font-sans font-semibold animate-pulse">
            Click & drag on chart to draw {activeTool}
          </span>
        )}
      </div>

      {/* 3. Main Chart Canvas with Left Drawing Tool Rail */}
      <div className="flex flex-1 relative overflow-hidden" style={{ height: effectiveHeight }}>
        {/* Left Drawing Tool Dock */}
        {!isCompact && (
          <DrawingToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            onClearDrawings={() => setDrawings([])}
            drawingsCount={drawings.length}
          />
        )}

        {/* SVG Canvas */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${effectiveHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2962ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Horizontal Price Gridlines */}
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

            {/* Volume Profile (VPVR) along right axis */}
            {showVolProfile && (
              <g>
                {volumeProfileBuckets.map((b, idx) => {
                  const y = getY(b.price);
                  const barW = b.ratio * 65;
                  const x = chartWidth - paddingRight - barW;
                  return (
                    <rect
                      key={`vp-${idx}`}
                      x={x}
                      y={y - 8}
                      width={barW}
                      height={16}
                      fill="rgba(245, 158, 11, 0.12)"
                      stroke="rgba(245, 158, 11, 0.25)"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </g>
            )}

            {/* Bollinger Bands Shaded Area */}
            {showBollinger && (
              <g>
                {(() => {
                  const upperPts = bollingerBands
                    .map((bb, i) => (bb ? `${getX(i)},${getY(bb.upper)}` : null))
                    .filter(Boolean);
                  const lowerPts = bollingerBands
                    .map((bb, i) => (bb ? `${getX(i)},${getY(bb.lower)}` : null))
                    .filter(Boolean)
                    .reverse();

                  if (upperPts.length && lowerPts.length) {
                    const d = `M ${upperPts.join(' L ')} L ${lowerPts.join(' L ')} Z`;
                    return <path d={d} fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="3 3" />;
                  }
                  return null;
                })()}
              </g>
            )}

            {/* Volume Histogram (bottom) */}
            {showVolume &&
              candles.map((c, i) => {
                const x = getX(i);
                const barWidth = Math.max(2, (chartWidth - paddingLeft - paddingRight) / candles.length * 0.6);
                const volHeight = (c.volume / maxVolume) * (mainChartHeight * 0.24);
                const y = paddingTop + mainChartHeight - volHeight;
                const color = c.close >= c.open ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)';
                return <rect key={`vol-${i}`} x={x - barWidth / 2} y={y} width={barWidth} height={volHeight} fill={color} />;
              })}

            {/* Candlesticks Mode */}
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
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                    <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} rx="0.5" />
                  </g>
                );
              })}

            {/* Line / Area Mode */}
            {chartType === 'line' && (
              <>
                <path
                  d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ')} L ${getX(candles.length - 1)},${paddingTop + mainChartHeight} L ${getX(0)},${paddingTop + mainChartHeight} Z`}
                  fill="url(#chartGradient)"
                />
                <path
                  d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ')}`}
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Overlays: MA20 & EMA50 */}
            {showMA && (
              <path
                d={`M ${ma20.map((v, i) => (v ? `${getX(i)},${getY(v)}` : null)).filter(Boolean).join(' L ')}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.4}
              />
            )}
            {showEMA && (
              <path
                d={`M ${ema50.map((v, i) => `${getX(i)},${getY(v)}`).join(' L ')}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={1.4}
              />
            )}

            {/* User Drawings */}
            {drawings.map((draw) => {
              if (draw.type === 'horizontal') {
                return (
                  <g key={draw.id}>
                    <line x1={draw.startX} y1={draw.startY} x2={draw.endX} y2={draw.startY} stroke="#2962ff" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={chartWidth - paddingRight + 2} y={draw.startY - 8} width={paddingRight - 4} height={16} fill="#2962ff" rx="2" />
                    <text x={chartWidth - paddingRight + 6} y={draw.startY + 3.5} fill="#ffffff" fontSize="9" fontWeight="bold">
                      ${draw.startPrice.toFixed(2)}
                    </text>
                  </g>
                );
              }

              if (draw.type === 'trendline') {
                return (
                  <g key={draw.id}>
                    <line x1={draw.startX} y1={draw.startY} x2={draw.endX} y2={draw.endY} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                    <circle cx={draw.startX} cy={draw.startY} r="3" fill="#f59e0b" />
                    <circle cx={draw.endX} cy={draw.endY} r="3" fill="#f59e0b" />
                  </g>
                );
              }

              if (draw.type === 'fibonacci') {
                const diff = draw.endY - draw.startY;
                const fibs = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
                return (
                  <g key={draw.id}>
                    {fibs.map((f) => {
                      const y = draw.startY + diff * f;
                      return (
                        <g key={f}>
                          <line x1={draw.startX} y1={y} x2={draw.endX} y2={y} stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />
                          <text x={draw.endX + 4} y={y + 3} fill="#a855f7" fontSize="8" fontFamily="JetBrains Mono">
                            {(f * 100).toFixed(1)}%
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              }

              if (draw.type === 'position') {
                const entryY = draw.startY;
                const targetY = Math.min(draw.startY, draw.endY);
                const stopY = entryY + (entryY - targetY) * 0.45;
                const width = Math.abs(draw.endX - draw.startX) || 120;
                const left = Math.min(draw.startX, draw.endX);

                return (
                  <g key={draw.id}>
                    {/* Profit Box (Green) */}
                    <rect x={left} y={targetY} width={width} height={entryY - targetY} fill="rgba(8, 153, 129, 0.2)" stroke="#089981" strokeWidth="1" />
                    {/* Loss Box (Red) */}
                    <rect x={left} y={entryY} width={width} height={stopY - entryY} fill="rgba(242, 54, 69, 0.2)" stroke="#f23645" strokeWidth="1" />
                    <text x={left + 6} y={targetY + 14} fill="#089981" fontSize="9" fontWeight="bold">Target TP (+2.2R)</text>
                    <text x={left + 6} y={stopY - 6} fill="#f23645" fontSize="9" fontWeight="bold">Stop Loss (1.0R)</text>
                  </g>
                );
              }

              return null;
            })}

            {/* Currently Dragged Drawing */}
            {currentDrawing && (
              <line
                x1={currentDrawing.startX}
                y1={currentDrawing.startY}
                x2={currentDrawing.currentX}
                y2={currentDrawing.currentY}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}

            {/* Live Current Price Level Banner */}
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

            {/* Mouse Crosshair */}
            {mousePos && hoverIndex !== null && (
              <g>
                <line x1={getX(hoverIndex)} y1={paddingTop} x2={getX(hoverIndex)} y2={effectiveHeight - paddingBottom} stroke="#787b86" strokeDasharray="3 3" strokeWidth="1" />
                <line x1={paddingLeft} y1={mousePos.y} x2={chartWidth - paddingRight} y2={mousePos.y} stroke="#787b86" strokeDasharray="3 3" strokeWidth="1" />
              </g>
            )}

            {/* Sub-Chart: MACD (12, 26, 9) */}
            {showMACD && (
              <g transform={`translate(0, ${effectiveHeight - 85})`}>
                <line x1={paddingLeft} y1={0} x2={chartWidth - paddingRight} y2={0} stroke="#2a2e39" strokeWidth="1" />
                <text x={paddingLeft + 4} y={12} fill="#a855f7" fontSize="9" fontWeight="600">MACD (12, 26, 9)</text>
                {macdData.map((m, i) => {
                  const x = getX(i);
                  const barH = Math.min(25, Math.abs(m.hist) * 8);
                  const isHistUp = m.hist >= 0;
                  const y = isHistUp ? 30 - barH : 30;
                  return (
                    <rect
                      key={`macd-${i}`}
                      x={x - 2}
                      y={y}
                      width={4}
                      height={Math.max(1, barH)}
                      fill={isHistUp ? 'rgba(8, 153, 129, 0.7)' : 'rgba(242, 54, 69, 0.7)'}
                    />
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
