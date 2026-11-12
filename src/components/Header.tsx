import React from 'react';
import { Search, Sun, Moon, Play, Pause, Wallet, ListFilter, Globe } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  balance: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  isSimulating,
  onToggleSimulation,
  onToggleSidebar,
  isSidebarOpen,
  balance,
  theme,
  onToggleTheme,
  selectedRegion,
  onSelectRegion,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 border-b border-[#2a2e39] bg-[#1e222d] shrink-0 select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('overview');
          }}
          className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight whitespace-nowrap hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded bg-[#2962ff] flex items-center justify-center text-white font-black text-xs shadow-sm shadow-[#2962ff]/30">
            TV
          </div>
          <span>TradingView</span>
        </a>
      </div>

      {/* Zone 2: 4-5 Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#787b86]">
        <button
          onClick={() => onTabChange('overview')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'overview' ? 'text-white font-semibold' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('stocks')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'stocks' ? 'text-white font-semibold' : ''
          }`}
        >
          Stocks
        </button>
        <button
          onClick={() => onTabChange('crypto')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'crypto' ? 'text-white font-semibold' : ''
          }`}
        >
          Crypto
        </button>
        <button
          onClick={() => onTabChange('heatmap')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'heatmap' ? 'text-white font-semibold' : ''
          }`}
        >
          Heatmap
        </button>
        <button
          onClick={() => onTabChange('news')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'news' ? 'text-white font-semibold' : ''
          }`}
        >
          News & Calendar
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action & Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Trigger Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#787b86] bg-[#131722] hover:text-white hover:bg-[#2a2e39] rounded-lg border border-[#2a2e39] transition-all whitespace-nowrap"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search markets, stocks, crypto...</span>
          <kbd className="hidden lg:inline px-1 py-0.5 text-[10px] bg-[#1e222d] rounded text-[#787b86] border border-[#2a2e39]">
            ⌘K
          </kbd>
        </button>

        {/* Live Simulation status toggle */}
        <button
          onClick={onToggleSimulation}
          title={isSimulating ? 'Pause Live Price Ticking' : 'Resume Live Price Ticking'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isSimulating
              ? 'border-[#089981]/40 text-[#089981] bg-[#089981]/10'
              : 'border-[#2a2e39] text-[#787b86] hover:text-white'
          }`}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Theme switch */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
