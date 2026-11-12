import React from 'react';
import { Quote, SectorPerformance } from '../types/market';
import { MarketTable } from '../components/MarketTable';
import { TrendingUp, Layers, Award } from 'lucide-react';

interface StocksScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
  sectors: SectorPerformance[];
}

export const StocksScreen: React.FC<StocksScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
  sectors,
}) => {
  const stockQuotes = quotes.filter(q => q.type === 'stock');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Stocks Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Stock Market Leaders & Screener</h1>
        <p className="text-xs text-[#787b86]">Explore large-cap US equities, sector performance, volume leaders, and technical ratings</p>
      </div>

      {/* Sector Performance Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {sectors.slice(0, 5).map((sec) => {
          const isUp = sec.changePercent >= 0;
          return (
            <div
              key={sec.name}
              className="p-3 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between"
            >
              <span className="text-xs font-semibold text-[#787b86] truncate">{sec.name}</span>
              <div className="flex items-baseline justify-between mt-2 font-mono tabular-nums">
                <span className={`text-base font-bold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {isUp ? '+' : ''}{sec.changePercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-[#787b86]">{sec.marketCap}</span>
              </div>
              <span className="text-[10px] text-[#787b86] mt-1 truncate">Top: {sec.topStock}</span>
            </div>
          );
        })}
      </div>

      {/* Main Stock Table */}
      <MarketTable
        quotes={stockQuotes}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onSelectQuote={onSelectQuote}
        title="U.S. Mega-Cap Equities"
      />
    </div>
  );
};
