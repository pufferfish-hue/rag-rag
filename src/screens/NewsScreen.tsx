import React, { useState } from 'react';
import { EconomicEvent, NewsArticle } from '../types/market';
import { Calendar, Newspaper, ExternalLink, Filter } from 'lucide-react';

interface NewsScreenProps {
  news: NewsArticle[];
  economicEvents: EconomicEvent[];
}

export const NewsScreen: React.FC<NewsScreenProps> = ({ news, economicEvents }) => {
  const [newsFilter, setNewsFilter] = useState<string>('All');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium'>('all');

  const categories = ['All', 'Equities', 'Crypto', 'Bonds', 'Commodities', 'Forex'];

  const filteredNews = newsFilter === 'All'
    ? news
    : news.filter(n => n.category.toLowerCase() === newsFilter.toLowerCase());

  const filteredEvents = impactFilter === 'all'
    ? economicEvents
    : economicEvents.filter(e => e.impact === impactFilter);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Market News & Economic Calendar</h1>
        <p className="text-xs text-[#787b86]">Macroeconomic indicators, central bank decisions, and real-time financial reporting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Full News Stream */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2a2e39]">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#2962ff]" />
              <h2 className="text-base font-bold text-white">Financial News Stream</h2>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39] overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewsFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    newsFilter === cat
                      ? 'bg-[#2962ff] text-white'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] hover:border-[#2962ff]/50 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs text-[#787b86]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2962ff]">{item.source}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.2 bg-[#131722] rounded border border-[#2a2e39] text-[10px]">
                      {item.category}
                    </span>
                  </div>
                  <span>{item.timeAgo}</span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug hover:text-[#2962ff] cursor-pointer transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-[#d1d4dc] leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-[#787b86]">Tickers:</span>
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

        {/* Right Column: Full Economic Calendar */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#f59e0b]" />
              <h2 className="text-base font-bold text-white">Economic Releases</h2>
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39]">
              <button
                onClick={() => setImpactFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  impactFilter === 'all' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setImpactFilter('high')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  impactFilter === 'high' ? 'bg-[#f23645] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                High Impact
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ev.flag}</span>
                    <span className="text-xs text-[#787b86]">{ev.country}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ev.impact === 'high' ? 'bg-[#f23645]/20 text-[#f23645]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  }`}>
                    {ev.impact}
                  </span>
                </div>

                <span className="text-xs font-bold text-white leading-snug">{ev.event}</span>

                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums pt-1 border-t border-[#2a2e39]/50 text-[#787b86]">
                  <span>Time: <strong className="text-white">{ev.time}</strong></span>
                  <span>Act: <strong className="text-white">{ev.actual}</strong></span>
                  <span>Forecast: {ev.forecast}</span>
                  <span>Prev: {ev.previous}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
