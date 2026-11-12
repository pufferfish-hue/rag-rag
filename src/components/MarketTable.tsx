import React, { useState, useMemo } from 'react';
import { Quote } from '../types/market';
import { Sparkline } from './Sparkline';
import { Star, ArrowUpRight, ArrowDownRight, ArrowUpDown, Search } from 'lucide-react';

interface MarketTableProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
  title?: string;
  showFilters?: boolean;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume';
type SortOrder = 'asc' | 'desc';
type PresetFilter = 'all' | 'gainers' | 'losers' | 'active';

export const MarketTable: React.FC<MarketTableProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
  title,
  showFilters = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [preset, setPreset] = useState<PresetFilter>('all');

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let result = quotes.filter(q => {
      const matchQuery =
        q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchQuery) return false;

      if (preset === 'gainers') return q.changePercent > 0;
      if (preset === 'losers') return q.changePercent < 0;
      if (preset === 'active') return true;
      return true;
    });

    result.sort((a, b) => {
      let valA: number | string = a[sortField] ?? 0;
      let valB: number | string = b[sortField] ?? 0;

      if (sortField === 'symbol') {
        valA = a.symbol;
        valB = b.symbol;
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });

    return result;
  }, [quotes, searchQuery, sortField, sortOrder, preset]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getRatingBadge = (rating: Quote['rating']) => {
    switch (rating) {
      case 'Strong Buy':
        return 'text-[#089981] bg-[#089981]/15 border-[#089981]/30';
      case 'Buy':
        return 'text-[#089981] bg-[#089981]/10 border-[#089981]/20';
      case 'Neutral':
        return 'text-[#787b86] bg-slate-500/10 border-slate-500/20';
      case 'Sell':
        return 'text-[#f23645] bg-[#f23645]/10 border-[#f23645]/20';
      case 'Strong Sell':
        return 'text-[#f23645] bg-[#f23645]/15 border-[#f23645]/30';
      default:
        return 'text-slate-400 bg-slate-800';
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#2a2e39] bg-[#131722]/60">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-sm font-bold text-white">{title}</h3>}

          {showFilters && (
            <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
              <button
                onClick={() => setPreset('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  preset === 'all'
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPreset('gainers')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  preset === 'gainers'
                    ? 'bg-[#089981] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setPreset('losers')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  preset === 'losers'
                    ? 'bg-[#f23645] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Losers
              </button>
              <button
                onClick={() => setPreset('active')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  preset === 'active'
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Most Active
              </button>
            </div>
          )}
        </div>

        {/* Search Input within Table */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#787b86]" />
          <input
            type="text"
            placeholder="Filter symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 pl-8 pr-3 py-1.5 text-xs bg-[#131722] border border-[#2a2e39] rounded-lg text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2a2e39] text-[11px] font-semibold text-[#787b86] uppercase tracking-wider bg-[#131722]/40">
              <th className="py-2.5 px-3 w-8 text-center"></th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Symbol / Name</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Change %</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">24h Range</th>
              <th
                onClick={() => handleSort('volume')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors hidden md:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden lg:table-cell">Market Cap</th>
              <th className="py-2.5 px-3 text-center hidden xl:table-cell">7D Trend</th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">Technical</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/60 text-xs">
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#787b86]">
                  No matching assets found for "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => {
                const isSaved = watchlist.includes(q.symbol);
                const isPositive = q.changePercent >= 0;
                const flashClass = q.flash === 'up' ? 'flash-up' : q.flash === 'down' ? 'flash-down' : '';

                // Calculate range percentage
                const rangeWidth = q.high24h - q.low24h;
                const curPos = rangeWidth > 0 ? ((q.price - q.low24h) / rangeWidth) * 100 : 50;

                return (
                  <tr
                    key={q.symbol}
                    onClick={() => onSelectQuote(q)}
                    className={`hover:bg-[#2a2e39]/40 cursor-pointer transition-colors duration-150 ${flashClass}`}
                  >
                    {/* Star / Watchlist Toggle */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(q.symbol);
                      }}
                    >
                      <button
                        title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className={`p-1 rounded hover:bg-[#2a2e39] transition-colors ${
                          isSaved ? 'text-[#f59e0b]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{q.symbol}</span>
                            {q.exchange && (
                              <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded border border-[#2a2e39]">
                                {q.exchange}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#787b86] truncate max-w-[160px] sm:max-w-[200px]">
                            {q.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-white">
                      ${q.price > 1000 ? q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : q.price.toFixed(q.price < 1 ? 4 : 2)}
                    </td>

                    {/* Change % */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                        isPositive ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                      }`}>
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>{isPositive ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
                      </div>
                    </td>

                    {/* 24h High/Low Range bar */}
                    <td className="py-3 px-3 text-right hidden sm:table-cell">
                      <div className="flex flex-col items-end gap-1 w-28 ml-auto font-mono text-[10px] text-[#787b86]">
                        <div className="w-full bg-[#131722] h-1.5 rounded-full relative overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                            style={{ width: `${Math.min(100, Math.max(5, curPos))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between w-full text-[10px]">
                          <span>{q.low24h > 1000 ? q.low24h.toFixed(0) : q.low24h.toFixed(2)}</span>
                          <span>{q.high24h > 1000 ? q.high24h.toFixed(0) : q.high24h.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc] hidden md:table-cell">
                      {q.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden lg:table-cell">
                      {q.marketCap || '—'}
                    </td>

                    {/* 7D Sparkline */}
                    <td className="py-3 px-3 text-center hidden xl:table-cell">
                      <div className="flex items-center justify-center">
                        <Sparkline data={q.sparkline} width={90} height={26} isPositive={isPositive} />
                      </div>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded border ${getRatingBadge(q.rating)}`}>
                        {q.rating}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
