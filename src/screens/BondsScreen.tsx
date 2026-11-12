import React from 'react';
import { Quote } from '../types/market';
import { MarketTable } from '../components/MarketTable';
import { YieldCurveChart } from '../components/YieldCurveChart';

interface BondsScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
}

export const BondsScreen: React.FC<BondsScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
}) => {
  const bondQuotes = quotes.filter(q => q.type === 'bond');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Bonds Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Sovereign Bonds & Fixed Income</h1>
        <p className="text-xs text-[#787b86]">Government debt yields, term structures, and macroeconomic interest rate expectations</p>
      </div>

      {/* Yield Curve Interactive Chart */}
      <YieldCurveChart />

      {/* Sovereign Yields Table */}
      <MarketTable
        quotes={bondQuotes}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onSelectQuote={onSelectQuote}
        title="Benchmark Sovereign Debt Yields"
      />
    </div>
  );
};
