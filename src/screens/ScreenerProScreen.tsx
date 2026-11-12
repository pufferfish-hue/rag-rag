import React, { useState, useMemo } from 'react';
import { Quote } from '../types/market';
import { Sparkline } from '../components/Sparkline';
import {
  Filter,
  Download,
  Search,
  ArrowUpDown,
  Star,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';

interface ScreenerProScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
}

export const ScreenerProScreen: React.FC<ScreenerProScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [rsiFilter, setRsiFilter] = useState<'all' | 'oversold' | 'overbought'>('all');
  const [sortField, setSortField] = useState<keyof Quote>('changePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [exportedNotice, setExportedNotice] = useState<boolean>(false);

  // Extract unique sectors
  const sectors = ['all', ...Array.from(new Set(quotes.map(q => q.sector).filter(Boolean)))];

  // Filtering logic
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (selectedSector !== 'all' && q.sector !== selectedSector) return false;
      if (selectedRating !== 'all' && q.rating !== selectedRating) return false;

      // Simulated RSI filter
      if (rsiFilter === 'oversold' && q.changePercent > -0.5) return false;
      if (rsiFilter === 'overbought' && q.changePercent < 2.0) return false;

      if (search) {
        const query = search.toLowerCase();
        if (!q.symbol.toLowerCase().includes(query) && !q.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [quotes, selectedType, selectedSector, selectedRating, rsiFilter, search, sortField, sortOrder]);

  const handleSort = (field: keyof Quote) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Symbol', 'Name', 'Type', 'Price', 'Change%', '24h High', '24h Low', 'Volume', 'Market Cap', 'Rating'];
    const rows = filteredQuotes.map(q => [
      q.symbol,
      `"${q.name}"`,
      q.type,
      q.price,
      `${q.changePercent}%`,
      q.high24h,
      q.low24h,
      `"${q.volume}"`,
      `"${q.marketCap || '—'}"`,
      q.rating,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradingview_pro_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Institutional Pro Screener</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#2962ff] text-white">
              PRO+
            </span>
          </div>
          <p className="text-xs text-[#787b86]">Multi-variable quantitative screening, technical indicator filtering, and data export</p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1e222d] border border-[#2a2e39] text-white hover:bg-[#2a2e39] transition-colors"
        >
          {exportedNotice ? <CheckCircle2 className="w-4 h-4 text-[#089981]" /> : <Download className="w-4 h-4 text-[#2962ff]" />}
          <span>{exportedNotice ? 'Exported CSV!' : 'Export Screener (CSV)'}</span>
        </button>
      </div>

      {/* Advanced Filter Matrix */}
      <div className="p-4 bg-[#1e222d] border border-[#2a2e39] rounded-xl flex flex-col gap-3 text-xs">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider border-b border-[#2a2e39]/60 pb-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2962ff]" />
          <span>Screening Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-[#787b86] text-[11px]">Symbol / Name</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787b86]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#131722] border border-[#2a2e39] rounded text-white focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          </div>

          {/* Asset Class */}
          <div className="flex flex-col gap-1">
            <label className="text-[#787b86] text-[11px]">Asset Class</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="py-1.5 px-2 bg-[#131722] border border-[#2a2e39] rounded text-white focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">All Asset Classes</option>
              <option value="stock">Equities (Stocks)</option>
              <option value="crypto">Cryptocurrencies</option>
              <option value="forex">Currencies (Forex)</option>
              <option value="commodity">Commodities</option>
              <option value="bond">Sovereign Bonds</option>
            </select>
          </div>

          {/* Sector */}
          <div className="flex flex-col gap-1">
            <label className="text-[#787b86] text-[11px]">Sector</label>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="py-1.5 px-2 bg-[#131722] border border-[#2a2e39] rounded text-white focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">All Sectors</option>
              {sectors.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Technical Rating */}
          <div className="flex flex-col gap-1">
            <label className="text-[#787b86] text-[11px]">Technical Rating</label>
            <select
              value={selectedRating}
              onChange={e => setSelectedRating(e.target.value)}
              className="py-1.5 px-2 bg-[#131722] border border-[#2a2e39] rounded text-white focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">All Ratings</option>
              <option value="Strong Buy">Strong Buy</option>
              <option value="Buy">Buy</option>
              <option value="Neutral">Neutral</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* RSI Momentum Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[#787b86] text-[11px]">RSI Momentum</label>
            <select
              value={rsiFilter}
              onChange={e => setRsiFilter(e.target.value as any)}
              className="py-1.5 px-2 bg-[#131722] border border-[#2a2e39] rounded text-white focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">Any RSI</option>
              <option value="oversold">Oversold Dip (&lt; 35)</option>
              <option value="overbought">Overbought Momentum (&gt; 65)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Screener Table */}
      <div className="flex flex-col bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-[#2a2e39] bg-[#131722]/50 text-xs">
          <span className="font-bold text-white font-mono">{filteredQuotes.length} matching securities</span>
          <span className="text-[#787b86] text-[11px]">Click column header to sort</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[11px] font-semibold text-[#787b86] uppercase tracking-wider bg-[#131722]/30 font-mono">
                <th className="p-3 w-8 text-center"></th>
                <th onClick={() => handleSort('symbol')} className="p-3 cursor-pointer hover:text-white">Symbol</th>
                <th onClick={() => handleSort('price')} className="p-3 text-right cursor-pointer hover:text-white">Price</th>
                <th onClick={() => handleSort('changePercent')} className="p-3 text-right cursor-pointer hover:text-white">24H Chg %</th>
                <th className="p-3 text-right">Volume</th>
                <th className="p-3 text-right">Market Cap</th>
                <th className="p-3 text-center">7D Trend</th>
                <th className="p-3 text-center">Technical Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50">
              {filteredQuotes.map((q) => {
                const isSaved = watchlist.includes(q.symbol);
                const isUp = q.changePercent >= 0;

                return (
                  <tr
                    key={q.symbol}
                    onClick={() => onSelectQuote(q)}
                    className="hover:bg-[#2a2e39]/40 cursor-pointer transition-colors"
                  >
                    <td
                      className="p-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(q.symbol);
                      }}
                    >
                      <button className={`p-1 rounded ${isSaved ? 'text-[#f59e0b]' : 'text-[#787b86] hover:text-white'}`}>
                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{q.symbol}</span>
                          <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded border border-[#2a2e39]">
                            {q.type.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#787b86] truncate max-w-[160px]">{q.name}</span>
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono tabular-nums font-semibold text-white">
                      ${q.price.toFixed(q.price < 1 ? 4 : 2)}
                    </td>

                    <td className="p-3 text-right font-mono tabular-nums">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                        isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                      }`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono tabular-nums text-white">
                      {q.volume}
                    </td>

                    <td className="p-3 text-right font-mono tabular-nums text-[#787b86]">
                      {q.marketCap || '—'}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        <Sparkline data={q.sparkline} width={75} height={20} isPositive={isUp} />
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                        q.rating.includes('Buy')
                          ? 'bg-[#089981]/15 text-[#089981] border-[#089981]/30'
                          : q.rating.includes('Sell')
                          ? 'bg-[#f23645]/15 text-[#f23645] border-[#f23645]/30'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {q.rating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
