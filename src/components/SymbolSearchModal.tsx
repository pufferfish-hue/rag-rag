import React, { useState, useMemo } from 'react';
import { Quote, AssetType } from '../types/market';
import { Search, X, TrendingUp, Sparkles } from 'lucide-react';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  isOpen,
  onClose,
  quotes,
  onSelectQuote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'stock', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'index', label: 'Indices' },
    { id: 'commodity', label: 'Futures & Metals' },
    { id: 'bond', label: 'Bonds' },
  ];

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesCat = selectedCategory === 'all' || q.type === selectedCategory;
      const matchesQuery =
        !query ||
        q.symbol.toLowerCase().includes(query.toLowerCase()) ||
        q.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [quotes, query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#2a2e39] bg-[#131722]">
          <Search className="w-5 h-5 text-[#2962ff] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search symbol, company, or market (e.g. NVDA, BTC, EURUSD, SPX)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#787b86] text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#787b86] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-[#787b86] hover:text-white rounded border border-[#2a2e39]"
          >
            ESC
          </button>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1 p-2 border-b border-[#2a2e39] overflow-x-auto bg-[#131722]/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2e39]/50">
          {filteredQuotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787b86]">
              No financial symbols found matching "{query}".
            </div>
          ) : (
            filteredQuotes.map((q) => {
              const isUp = q.changePercent >= 0;
              return (
                <div
                  key={q.symbol}
                  onClick={() => {
                    onSelectQuote(q);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3.5 hover:bg-[#2a2e39]/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{q.symbol}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#131722] text-[#787b86] border border-[#2a2e39]">
                          {q.type}
                        </span>
                      </div>
                      <span className="text-xs text-[#787b86]">{q.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end font-mono tabular-nums text-xs">
                    <span className="font-bold text-white">
                      ${q.price > 1000 ? q.price.toFixed(1) : q.price.toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 px-4 bg-[#131722] border-t border-[#2a2e39] text-[11px] text-[#787b86] flex items-center justify-between">
          <span>Search global financial instruments</span>
          <span className="font-mono">{filteredQuotes.length} results</span>
        </div>
      </div>
    </div>
  );
};
