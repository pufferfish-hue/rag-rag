import React, { useState } from 'react';
import { Quote } from '../types/market';
import { MarketTable } from '../components/MarketTable';
import { Coins, Zap, Shield, Flame } from 'lucide-react';

interface CryptoScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
}

export const CryptoScreen: React.FC<CryptoScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
}) => {
  const cryptoQuotes = quotes.filter(q => q.type === 'crypto');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Crypto Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Cryptocurrency Markets</h1>
        <p className="text-xs text-[#787b86]">Real-time digital asset prices, volume, market cap, and blockchain metrics</p>
      </div>

      {/* Global Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#787b86]">Total Crypto Market Cap</span>
          <div className="flex items-baseline justify-between mt-1 font-mono tabular-nums">
            <span className="text-lg font-bold text-white">$3.18T</span>
            <span className="text-xs text-[#089981] font-semibold">+3.4%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#787b86]">24h Total Volume</span>
          <div className="flex items-baseline justify-between mt-1 font-mono tabular-nums">
            <span className="text-lg font-bold text-white">$114.6B</span>
            <span className="text-xs text-[#089981] font-semibold">+18.2%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#787b86]">Bitcoin Dominance</span>
          <div className="flex items-baseline justify-between mt-1 font-mono tabular-nums">
            <span className="text-lg font-bold text-white">58.4%</span>
            <span className="text-xs text-[#787b86]">BTC / Altcoins</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#787b86]">Ethereum Gas</span>
          <div className="flex items-baseline justify-between mt-1 font-mono tabular-nums">
            <span className="text-lg font-bold text-white">12 Gwei</span>
            <span className="text-xs text-[#089981]">Standard</span>
          </div>
        </div>
      </div>

      {/* Crypto Screener Table */}
      <MarketTable
        quotes={cryptoQuotes}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onSelectQuote={onSelectQuote}
        title="Top Cryptocurrencies by Market Capitalization"
      />
    </div>
  );
};
