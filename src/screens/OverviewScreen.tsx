import React, { useState } from 'react';
import { Quote, SectorPerformance, EconomicEvent, NewsArticle } from '../types/market';
import { Sparkline } from '../components/Sparkline';
import { MarketTable } from '../components/MarketTable';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock, Globe, ChevronRight } from 'lucide-react';

interface OverviewScreenProps {
  quotes: Quote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectQuote: (quote: Quote) => void;
  sectors: SectorPerformance[];
  economicEvents: EconomicEvent[];
  news: NewsArticle[];
  onNavigateTab: (tab: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  quotes,
  watchlist,
  onToggleWatchlist,
  onSelectQuote,
  sectors,
  economicEvents,
  news,
  onNavigateTab,
}) => {
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');

  // Key hero indices
  const heroIndices = quotes.filter(q => ['SPX', 'NDX', 'DJI', 'BTCUSD', 'XAUUSD', 'US10Y'].includes(q.symbol));

  // Top gainers & losers across equities and crypto
  const tradableQuotes = quotes.filter(q => q.type === 'stock' || q.type === 'crypto');
  const topGainers = [...tradableQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...tradableQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const topVolume = [...tradableQuotes].slice(0, 5);

  // Market Breadth Sentiment Calculation
  const totalUp = quotes.filter(q => q.changePercent > 0).length;
  const sentimentPct = Math.round((totalUp / quotes.length) * 100);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* 1. Hero Market Strip: Major World Indices & Anchors */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">World Financial Markets</h1>
            <p className="text-xs text-[#787b86]">Real-time quotes across global benchmarks and key asset classes</p>
          </div>

          {/* Sentiment Barometer */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-xs">
            <span className="text-[#787b86]">Market Sentiment:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-[#131722] h-2 rounded-full overflow-hidden relative">
                <div
                  className="bg-[#089981] h-full rounded-full transition-all duration-500"
                  style={{ width: `${sentimentPct}%` }}
                />
              </div>
              <span className="font-mono font-bold text-[#089981]">{sentimentPct}% Bullish</span>
            </div>
          </div>
        </div>

        {/* 6 Hero Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {heroIndices.map((q) => {
            const isUp = q.changePercent >= 0;
            const flashClass = q.flash === 'up' ? 'flash-up' : q.flash === 'down' ? 'flash-down' : '';

            return (
              <button
                key={q.symbol}
                onClick={() => onSelectQuote(q)}
                className={`flex flex-col justify-between p-3 rounded-xl bg-[#1e222d] border border-[#2a2e39] hover:border-[#2962ff]/60 hover:bg-[#2a2e39]/50 transition-all text-left cursor-pointer ${flashClass}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-xs text-white">{q.symbol}</span>
                  <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded border border-[#2a2e39]">
                    {q.type.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col my-1 font-mono tabular-nums">
                  <span className="text-base font-extrabold text-white">
                    ${q.price > 1000 ? q.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : q.price.toFixed(q.price < 1 ? 4 : 2)}
                  </span>
                  <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{isUp ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Mini Sparkline */}
                <div className="mt-1 flex justify-center">
                  <Sparkline data={q.sparkline} width={90} height={24} isPositive={isUp} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Section: Sector Performance & Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sector Performance Bar */}
        <div className="lg:col-span-5 flex flex-col bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">US Sector Performance</h3>
              <p className="text-xs text-[#787b86]">Today's sector rotational trends</p>
            </div>
            <button
              onClick={() => onNavigateTab('heatmap')}
              className="text-xs text-[#2962ff] hover:underline flex items-center gap-0.5"
            >
              <span>Heatmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {sectors.slice(0, 7).map((sec) => {
              const isPositive = sec.changePercent >= 0;
              const absVal = Math.min(100, Math.abs(sec.changePercent) * 35);

              return (
                <div key={sec.name} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{sec.name}</span>
                    <span className={`font-mono tabular-nums font-semibold ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {isPositive ? '+' : ''}{sec.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Relative bar */}
                  <div className="w-full bg-[#131722] h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all ${isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                      style={{ width: `${absVal}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Movers Tabs (Gainers, Losers, Most Active) */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden">
          {/* Mover Tabs Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] bg-[#131722]/50">
            <h3 className="text-sm font-bold text-white">Market Movers</h3>

            <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
              <button
                onClick={() => setMoversTab('gainers')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  moversTab === 'gainers' ? 'bg-[#089981] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setMoversTab('losers')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  moversTab === 'losers' ? 'bg-[#f23645] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setMoversTab('volume')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  moversTab === 'volume' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Most Active
              </button>
            </div>
          </div>

          {/* Movers List */}
          <div className="divide-y divide-[#2a2e39]/60 flex-1">
            {(moversTab === 'gainers' ? topGainers : moversTab === 'losers' ? topLosers : topVolume).map((q) => {
              const isUp = q.changePercent >= 0;

              return (
                <div
                  key={q.symbol}
                  onClick={() => onSelectQuote(q)}
                  className="flex items-center justify-between p-3 px-4 hover:bg-[#2a2e39]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{q.symbol}</span>
                        <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded border border-[#2a2e39]">
                          {q.exchange || q.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-[#787b86] truncate max-w-[160px] sm:max-w-[220px]">
                        {q.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Sparkline data={q.sparkline} width={70} height={20} isPositive={isUp} className="hidden sm:block" />
                    <div className="flex flex-col items-end font-mono tabular-nums text-xs">
                      <span className="font-bold text-white">${q.price.toFixed(2)}</span>
                      <span className={`text-[11px] font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Comprehensive All Markets Table */}
      <MarketTable
        quotes={quotes}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onSelectQuote={onSelectQuote}
        title="Global Asset Screener & Leaders"
      />

      {/* 4. Bottom Row: Economic Releases & Latest Market News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Economic Calendar Snapshot */}
        <div className="lg:col-span-5 flex flex-col bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Economic Calendar</h3>
              <p className="text-xs text-[#787b86]">Key macroeconomic events today</p>
            </div>
            <button
              onClick={() => onNavigateTab('news')}
              className="text-xs text-[#2962ff] hover:underline flex items-center gap-0.5"
            >
              <span>Full Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 divide-y divide-[#2a2e39]/50">
            {economicEvents.slice(0, 4).map((ev) => (
              <div key={ev.id} className="pt-2.5 first:pt-0 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#787b86] text-[11px]">{ev.time}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                    ev.impact === 'high' ? 'bg-[#f23645]/20 text-[#f23645]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  }`}>
                    {ev.impact} impact
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{ev.flag}</span>
                  <span className="text-xs font-medium text-white">{ev.event}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#787b86]">
                  <span>Actual: <strong className="text-white">{ev.actual}</strong></span>
                  <span>Forecast: {ev.forecast}</span>
                  <span>Previous: {ev.previous}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Market News Feed */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Latest Market Insights</h3>
              <p className="text-xs text-[#787b86]">Real-time financial news coverage</p>
            </div>
            <button
              onClick={() => onNavigateTab('news')}
              className="text-xs text-[#2962ff] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 divide-y divide-[#2a2e39]/50">
            {news.slice(0, 3).map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#787b86]">
                  <span className="font-semibold text-[#2962ff]">{item.source}</span>
                  <span>{item.timeAgo}</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug hover:text-[#2962ff] cursor-pointer transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#787b86] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {item.relatedSymbols.map((sym) => (
                    <span
                      key={sym}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#131722] text-[#d1d4dc] border border-[#2a2e39]"
                    >
                      ${sym}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
