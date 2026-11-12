import React from 'react';
import { Quote } from '../types/market';
import { MarketTable } from '../components/MarketTable';
import { ForexMatrix } from '../components/ForexMatrix';

interface ForexScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
}

export const ForexScreen: React.FC<ForexScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
}) => {
  const forexQuotes = quotes.filter(q => q.type === 'forex');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Forex Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Foreign Exchange & Currencies</h1>
        <p className="text-xs text-[#787b86]">Live exchange rates for major, minor, and exotic global currency pairs</p>
      </div>

      {/* Currency Strength Matrix */}
      <ForexMatrix />

      {/* Forex Quotes Table */}
      <MarketTable
        quotes={forexQuotes}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onSelectQuote={onSelectQuote}
        title="Major Currency Pairs"
      />
    </div>
  );
};
