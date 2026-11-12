import React, { useState } from 'react';
import { Quote } from '../types/market';

interface MarketHeatmapProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ quotes, onSelectQuote }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [hoveredQuote, setHoveredQuote] = useState<Quote | null>(null);

  // Filter stocks or major assets that have a sector
  const stockQuotes = quotes.filter(q => q.type === 'stock' || (q.type === 'crypto' && q.marketCap));

  // Extract unique sectors
  const sectors = ['All', ...Array.from(new Set(stockQuotes.map(q => q.sector || 'Crypto')))];

  const filteredQuotes = selectedSector === 'All'
    ? stockQuotes
    : stockQuotes.filter(q => (q.sector || 'Crypto') === selectedSector);

  // Group by sector
  const groupedBySector = filteredQuotes.reduce((acc, q) => {
    const sec = q.sector || (q.type === 'crypto' ? 'Digital Assets' : 'Other');
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(q);
    return acc;
  }, {} as Record<string, Quote[]>);

  // Color mapper based on changePercent
  const getColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-[#089981] text-white hover:brightness-110';
    if (pct >= 1.5) return 'bg-[#089981]/85 text-white hover:brightness-110';
    if (pct > 0) return 'bg-[#089981]/60 text-white hover:brightness-110';
    if (pct === 0) return 'bg-[#2a2e39] text-[#d1d4dc] hover:brightness-110';
    if (pct > -1.5) return 'bg-[#f23645]/60 text-white hover:brightness-110';
    if (pct > -3.0) return 'bg-[#f23645]/85 text-white hover:brightness-110';
    return 'bg-[#f23645] text-white hover:brightness-110';
  };

  // Weight / sizing factor based on marketCap string ($3.64T -> weight)
  const parseMarketCap = (cap?: string): number => {
    if (!cap) return 10;
    if (cap.includes('T')) return parseFloat(cap.replace(/[$T]/g, '')) * 1000;
    if (cap.includes('B')) return parseFloat(cap.replace(/[$B]/g, ''));
    if (cap.includes('M')) return parseFloat(cap.replace(/[$M]/g, '')) / 1000;
    return 50;
  };

  return (
    <div className="flex flex-col w-full bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
      {/* Heatmap Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#2a2e39] bg-[#131722]/50">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">S&P 500 & Mega-Cap Market Heatmap</h3>
            <p className="text-xs text-[#787b86]">Visualizing market cap weighting and daily performance distribution</p>
          </div>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39]">
          {sectors.slice(0, 6).map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedSector === sec
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Layout */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[440px]">
        {Object.entries(groupedBySector).map(([secName, secQuotes]) => {
          return (
            <div
              key={secName}
              className="flex flex-col bg-[#131722] border border-[#2a2e39] rounded-lg p-2.5 overflow-hidden"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {secName}
                </span>
                <span className="text-[11px] text-[#787b86]">
                  {secQuotes.length} assets
                </span>
              </div>

              {/* Tiles in Sector */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {secQuotes.map((q) => {
                  const capWeight = parseMarketCap(q.marketCap);
                  const isLarge = capWeight > 500;
                  const colorClass = getColor(q.changePercent);

                  return (
                    <button
                      key={q.symbol}
                      onClick={() => onSelectQuote(q)}
                      onMouseEnter={() => setHoveredQuote(q)}
                      onMouseLeave={() => setHoveredQuote(null)}
                      className={`relative flex flex-col justify-between p-3 rounded transition-all cursor-pointer text-left shadow-sm ${
                        isLarge ? 'col-span-2 min-h-[90px]' : 'col-span-1 min-h-[75px]'
                      } ${colorClass}`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className="font-bold text-sm tracking-tight drop-shadow-sm">
                          {q.symbol}
                        </span>
                        <span className="text-xs font-mono tabular-nums font-semibold drop-shadow-sm">
                          {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex items-end justify-between w-full mt-2 text-[11px] font-mono tabular-nums opacity-95">
                        <span className="truncate max-w-[120px] font-medium">
                          ${q.price > 1000 ? q.price.toLocaleString() : q.price.toFixed(2)}
                        </span>
                        {q.marketCap && (
                          <span className="text-[10px] opacity-80">{q.marketCap}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend & Tooltip Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-[#2a2e39] bg-[#131722]/80 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[#787b86]">Performance:</span>
          <span className="px-2 py-0.5 rounded bg-[#f23645] text-white">&lt; -3%</span>
          <span className="px-2 py-0.5 rounded bg-[#f23645]/70 text-white">-1.5%</span>
          <span className="px-2 py-0.5 rounded bg-[#2a2e39] text-[#787b86]">0%</span>
          <span className="px-2 py-0.5 rounded bg-[#089981]/70 text-white">+1.5%</span>
          <span className="px-2 py-0.5 rounded bg-[#089981] text-white">&gt; +3%</span>
        </div>

        {hoveredQuote ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white font-semibold">{hoveredQuote.name} ({hoveredQuote.symbol})</span>
            <span className="text-[#787b86]">Cap: {hoveredQuote.marketCap || '—'}</span>
            <span className="text-[#787b86]">P/E: {hoveredQuote.pe || '—'}</span>
            <span className="text-[#787b86]">Vol: {hoveredQuote.volume}</span>
          </div>
        ) : (
          <span className="text-[#787b86] text-[11px]">
            Hover over any tile to preview metrics or click to open full chart studio.
          </span>
        )}
      </div>
    </div>
  );
};
