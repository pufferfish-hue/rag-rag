import React, { useState, useEffect, useCallback } from 'react';
import { Quote, PaperPosition, PriceAlert, SectorPerformance } from './types/market';
import {
  INITIAL_QUOTES,
  SECTOR_PERFORMANCE,
  ECONOMIC_EVENTS,
  NEWS_ARTICLES,
} from './data/mockMarketData';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { RightSidebar } from './components/RightSidebar';
import { ChartModal } from './components/ChartModal';
import { SymbolSearchModal } from './components/SymbolSearchModal';

// Screens
import { OverviewScreen } from './screens/OverviewScreen';
import { StocksScreen } from './screens/StocksScreen';
import { CryptoScreen } from './screens/CryptoScreen';
import { ForexScreen } from './screens/ForexScreen';
import { FuturesScreen } from './screens/FuturesScreen';
import { BondsScreen } from './screens/BondsScreen';
import { HeatmapScreen } from './screens/HeatmapScreen';
import { NewsScreen } from './screens/NewsScreen';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedRegion, setSelectedRegion] = useState<string>('US');

  // Quotes data & live ticking simulation
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Selected Quote for modal inspection
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Watchlist state
  const [watchlist, setWatchlist] = useState<string[]>([
    'SPX',
    'NVDA',
    'AAPL',
    'BTCUSD',
    'EURUSD',
    'XAUUSD',
  ]);

  // Right sidebar dock state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'watchlist' | 'alerts' | 'calendar' | 'portfolio'>('watchlist');

  // Paper Trading State
  const [balance, setBalance] = useState<number>(100000.0);
  const [positions, setPositions] = useState<PaperPosition[]>([
    {
      id: 'pos-1',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      type: 'BUY',
      shares: 50,
      entryPrice: 142.50,
      currentPrice: 148.88,
      pnl: 319.00,
      pnlPercent: 4.48,
      openedAt: 'Today 09:35',
    },
    {
      id: 'pos-2',
      symbol: 'BTCUSD',
      name: 'Bitcoin',
      type: 'BUY',
      shares: 0.5,
      entryPrice: 86200.00,
      currentPrice: 88450.00,
      pnl: 1125.00,
      pnlPercent: 2.61,
      openedAt: 'Yesterday 14:20',
    },
  ]);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alt-1',
      symbol: 'NVDA',
      targetPrice: 155.00,
      condition: 'above',
      createdAt: 'Today',
      active: true,
    },
    {
      id: 'alt-2',
      symbol: 'BTCUSD',
      targetPrice: 90000.00,
      condition: 'above',
      createdAt: 'Today',
      active: true,
    },
  ]);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut for search (Cmd+K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time market tick simulator
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setQuotes(prevQuotes => {
        // Pick 2 random quotes to update
        const randIndices = [
          Math.floor(Math.random() * prevQuotes.length),
          Math.floor(Math.random() * prevQuotes.length),
        ];

        return prevQuotes.map((q, idx) => {
          if (!randIndices.includes(idx)) {
            if (q.flash) return { ...q, flash: null };
            return q;
          }

          // Gentle delta (-0.2% to +0.25%)
          const pctDelta = (Math.random() - 0.47) * 0.004;
          const oldPrice = q.price;
          const newPrice = Number(Math.max(0.01, oldPrice * (1 + pctDelta)).toFixed(oldPrice < 1 ? 4 : 2));
          const deltaPrice = newPrice - oldPrice;
          const isUp = deltaPrice >= 0;

          const updatedSpark = [...q.sparkline.slice(1), newPrice];

          // Update candles if available
          let updatedCandles = q.candles;
          if (updatedCandles && updatedCandles.length > 0) {
            const lastCandle = updatedCandles[updatedCandles.length - 1];
            const updatedLast = {
              ...lastCandle,
              close: newPrice,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              volume: lastCandle.volume + Math.floor(Math.random() * 200 + 50),
            };
            updatedCandles = [...updatedCandles.slice(0, -1), updatedLast];
          }

          return {
            ...q,
            price: newPrice,
            change: Number((q.change + deltaPrice).toFixed(2)),
            changePercent: Number((q.changePercent + pctDelta * 100).toFixed(2)),
            high24h: Math.max(q.high24h, newPrice),
            low24h: Math.min(q.low24h, newPrice),
            sparkline: updatedSpark,
            candles: updatedCandles,
            flash: isUp ? 'up' : 'down',
          };
        });
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Also sync open position mark prices
  useEffect(() => {
    setPositions(prev =>
      prev.map(pos => {
        const matching = quotes.find(q => q.symbol === pos.symbol);
        if (!matching) return pos;
        const mark = matching.price;
        const diff = pos.type === 'BUY' ? mark - pos.entryPrice : pos.entryPrice - mark;
        const pnl = diff * pos.shares;
        const pnlPercent = (diff / pos.entryPrice) * 100;
        return {
          ...pos,
          currentPrice: mark,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
        };
      })
    );
  }, [quotes]);

  // Keep selectedQuote in sync with live quotes
  useEffect(() => {
    if (!selectedQuote) return;
    const fresh = quotes.find(q => q.symbol === selectedQuote.symbol);
    if (fresh) setSelectedQuote(fresh);
  }, [quotes, selectedQuote?.symbol]);

  // Toggle watchlist
  const handleToggleWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  }, []);

  // Remove from watchlist
  const handleRemoveFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  }, []);

  // Paper order placement
  const handlePlaceOrder = (
    symbol: string,
    name: string,
    type: 'BUY' | 'SELL',
    shares: number,
    price: number
  ) => {
    const cost = shares * price;
    if (cost > balance && type === 'BUY') return;

    const newPos: PaperPosition = {
      id: `pos-${Date.now()}`,
      symbol,
      name,
      type,
      shares,
      entryPrice: price,
      currentPrice: price,
      pnl: 0,
      pnlPercent: 0,
      openedAt: 'Just now',
    };

    setPositions(prev => [newPos, ...prev]);
    if (type === 'BUY') {
      setBalance(b => b - cost);
    }
  };

  // Close position
  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (pos) {
      if (pos.type === 'BUY') {
        setBalance(b => b + pos.shares * pos.currentPrice);
      } else {
        setBalance(b => b + pos.pnl);
      }
      setPositions(prev => prev.filter(p => p.id !== id));
    }
  };

  // Alerts
  const handleAddAlert = (symbol: string, price: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      symbol,
      targetPrice: price,
      condition,
      createdAt: 'Just now',
      active: true,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const watchlistQuotes = quotes.filter(q => watchlist.includes(q.symbol));

  const marketTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'futures', label: 'Futures & Energy' },
    { id: 'bonds', label: 'Bonds & Yields' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'news', label: 'News & Calendar' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#131722] text-[#d1d4dc] transition-colors duration-200">
      {/* 1. Global Navigation Top Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        balance={balance}
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
      />

      {/* 2. Real-time Ticker Tape Marquee */}
      <TickerTape quotes={quotes} onSelectQuote={setSelectedQuote} />

      {/* 3. Sub-Navigation / Market Screens Tab Bar */}
      <div className="border-b border-[#2a2e39] bg-[#1e222d] px-4 sm:px-6 sticky top-0 z-20 shadow-sm select-none">
        <div className="flex items-center justify-between overflow-x-auto gap-4 max-w-7xl mx-auto py-1">
          <div className="flex items-center gap-1 sm:gap-2">
            {marketTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                  currentTab === tab.id
                    ? 'border-[#2962ff] text-white'
                    : 'border-transparent text-[#787b86] hover:text-[#d1d4dc] hover:border-[#2a2e39]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Region Selector */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-[#787b86] shrink-0">
            <span>Market Region:</span>
            {['US', 'World', 'Europe', 'Asia'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedRegion === r ? 'bg-[#2962ff] text-white' : 'hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Main Body: Active Screen + Collapsible Right Dock */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Screen Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewScreen
              quotes={quotes}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectQuote={setSelectedQuote}
              sectors={SECTOR_PERFORMANCE}
              economicEvents={ECONOMIC_EVENTS}
              news={NEWS_ARTICLES}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'stocks' && (
            <StocksScreen
              quotes={quotes}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectQuote={setSelectedQuote}
              sectors={SECTOR_PERFORMANCE}
            />
          )}

          {currentTab === 'crypto' && (
            <CryptoScreen
              quotes={quotes}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectQuote={setSelectedQuote}
            />
          )}

          {currentTab === 'forex' && (
            <ForexScreen
              quotes={quotes}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectQuote={setSelectedQuote}
            />
          )}

          {currentTab === 'futures' && (
            <FuturesScreen
              quotes={quotes}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectQuote={setSelectedQuote}
            />
          )}

          {currentTab === 'bonds' && (
            <BondsScreen
              quotes={quotes}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectQuote={setSelectedQuote}
            />
          )}

          {currentTab === 'heatmap' && (
            <HeatmapScreen quotes={quotes} onSelectQuote={setSelectedQuote} />
          )}

          {currentTab === 'news' && (
            <NewsScreen news={NEWS_ARTICLES} economicEvents={ECONOMIC_EVENTS} />
          )}

          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-[#2a2e39] text-center text-xs text-[#787b86] max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>Market quotes and technical indicators inspired by TradingView</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-[#089981]">● Live Data Active</span>
              <span>New York (EST) UTC-5</span>
              <span>Paper Trading Mode</span>
            </div>
          </footer>
        </main>

        {/* 5. Collapsible TradingView Right Dock */}
        <RightSidebar
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={sidebarTab}
          setActiveTab={setSidebarTab}
          watchlistQuotes={watchlistQuotes}
          selectedQuote={selectedQuote}
          onSelectQuote={setSelectedQuote}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          positions={positions}
          onClosePosition={handleClosePosition}
          balance={balance}
          alerts={alerts}
          onAddAlert={handleAddAlert}
          onDeleteAlert={handleDeleteAlert}
          economicEvents={ECONOMIC_EVENTS}
        />
      </div>

      {/* 6. Interactive Chart Modal */}
      {selectedQuote && (
        <ChartModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          isWatchlisted={watchlist.includes(selectedQuote.symbol)}
          onToggleWatchlist={handleToggleWatchlist}
          onPlaceOrder={handlePlaceOrder}
          balance={balance}
        />
      )}

      {/* 7. Comprehensive Symbol Search Modal */}
      <SymbolSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        quotes={quotes}
        onSelectQuote={(q) => setSelectedQuote(q)}
      />
    </div>
  );
}
