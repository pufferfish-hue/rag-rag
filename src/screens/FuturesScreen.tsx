import React from 'react';
import { Quote } from '../types/market';
import { MarketTable } from '../components/MarketTable';

interface FuturesScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
}

export const FuturesScreen: React.FC<FuturesScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
}) => {
  const commodityQuotes = quotes.filter(q => q.type === 'commodity');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Futures Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Commodities & Futures Contracts</h1>
        <p className="text-xs text-[#787b86]">Energy, precious metals, industrial materials, and agricultural benchmark prices</p>
      </div>

      {/* Main Table */}
      <MarketTable
        quotes={commodityQuotes}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onSelectQuote={onSelectQuote}
        title="Commodities & Energy Benchmarks"
      />
    </div>
  );
};
