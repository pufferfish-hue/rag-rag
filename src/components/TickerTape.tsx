import React from 'react';
import { Quote } from '../types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TickerTapeProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ quotes, onSelectQuote }) => {
  // Select top representative assets for the marquee
  const tapeQuotes = quotes.filter(q =>
    ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'EURUSD', 'XAUUSD', 'USOIL', 'US10Y', 'NVDA', 'AAPL', 'TSLA'].includes(q.symbol)
  );

  // Duplicate for smooth seamless loop
  const displayItems = [...tapeQuotes, ...tapeQuotes];

  return (
    <div className="w-full bg-[#131722] border-b border-[#2a2e39] py-1.5 overflow-hidden select-none relative group">
      {/* Scroll Track */}
      <div className="flex items-center gap-6 whitespace-nowrap animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]">
        {displayItems.map((q, idx) => {
          const isUp = q.changePercent >= 0;
          const flashClass = q.flash === 'up' ? 'flash-up' : q.flash === 'down' ? 'flash-down' : '';

          return (
            <button
              key={`${q.symbol}-${idx}`}
              onClick={() => onSelectQuote(q)}
              className={`inline-flex items-center gap-2.5 px-3 py-1 rounded hover:bg-[#1e222d] transition-all cursor-pointer font-mono tabular-nums text-xs ${flashClass}`}
            >
              <span className="font-extrabold text-white text-[11px] font-sans tracking-tight">
                {q.symbol}
              </span>

              <span className="text-white font-medium">
                {q.price > 1000
                  ? q.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
                  : q.price.toFixed(q.price < 1 ? 4 : 2)}
              </span>

              <span
                className={`inline-flex items-center text-[11px] font-semibold ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
