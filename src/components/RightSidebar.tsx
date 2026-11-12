import React, { useState } from 'react';
import { Quote, PaperPosition, PriceAlert, EconomicEvent } from '../types/market';
import { Sparkline } from './Sparkline';
import {
  ListFilter,
  Bell,
  Calendar,
  Wallet,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface RightSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  activeTab: 'watchlist' | 'alerts' | 'calendar' | 'portfolio';
  setActiveTab: (tab: 'watchlist' | 'alerts' | 'calendar' | 'portfolio') => void;
  watchlistQuotes: Quote[];
  selectedQuote: Quote | null;
  onSelectQuote: (quote: Quote) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  positions: PaperPosition[];
  onClosePosition: (id: string) => void;
  balance: number;
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, price: number, condition: 'above' | 'below') => void;
  onDeleteAlert: (id: string) => void;
  economicEvents: EconomicEvent[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onToggleOpen,
  activeTab,
  setActiveTab,
  watchlistQuotes,
  selectedQuote,
  onSelectQuote,
  onRemoveFromWatchlist,
  positions,
  onClosePosition,
  balance,
  alerts,
  onAddAlert,
  onDeleteAlert,
  economicEvents,
}) => {
  // Alert creation state
  const [alertPrice, setAlertPrice] = useState<string>('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  // Compute portfolio metrics
  const totalPnL = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalEquity = balance + totalPnL;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !alertPrice) return;
    const p = parseFloat(alertPrice);
    if (isNaN(p) || p <= 0) return;
    onAddAlert(selectedQuote.symbol, p, alertCondition);
    setAlertPrice('');
  };

  return (
    <div className="flex h-full border-l border-[#2a2e39] bg-[#1e222d] shrink-0 z-30 select-none">
      {/* Expanded Panel (if open) */}
      {isOpen && (
        <div className="w-80 md:w-88 flex flex-col h-full bg-[#1e222d] border-r border-[#2a2e39] overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39] bg-[#131722]/50">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {activeTab === 'watchlist' && 'Watchlist & Details'}
              {activeTab === 'alerts' && 'Price Alerts'}
              {activeTab === 'calendar' && 'Economic Calendar'}
              {activeTab === 'portfolio' && 'Paper Trading Portfolio'}
            </span>
            <button
              onClick={onToggleOpen}
              className="p-1 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto">
            {/* 1. Watchlist Tab */}
            {activeTab === 'watchlist' && (
              <div className="flex flex-col h-full">
                {/* Watchlist Items */}
                <div className="divide-y divide-[#2a2e39]/50 flex-1 overflow-y-auto max-h-[360px]">
                  {watchlistQuotes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#787b86]">
                      No items in your watchlist yet. Star any ticker in the tables to add it here.
                    </div>
                  ) : (
                    watchlistQuotes.map((q) => {
                      const isSelected = selectedQuote?.symbol === q.symbol;
                      const isUp = q.changePercent >= 0;
                      return (
                        <div
                          key={q.symbol}
                          onClick={() => onSelectQuote(q)}
                          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#2a2e39]/80 border-l-2 border-[#2962ff]' : 'hover:bg-[#2a2e39]/40'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-white">{q.symbol}</span>
                            <span className="text-[11px] text-[#787b86] truncate max-w-[110px]">{q.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Sparkline data={q.sparkline} width={45} height={18} isPositive={isUp} />
                            <div className="flex flex-col items-end font-mono tabular-nums text-xs">
                              <span className="font-semibold text-white">
                                ${q.price > 1000 ? q.price.toFixed(1) : q.price.toFixed(2)}
                              </span>
                              <span className={`text-[10px] font-medium ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromWatchlist(q.symbol);
                              }}
                              className="p-1 text-[#787b86] hover:text-[#f23645] rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Quote Details Snapshot */}
                {selectedQuote && (
                  <div className="p-4 border-t border-[#2a2e39] bg-[#131722]/60 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-white">{selectedQuote.symbol}</span>
                        <span className="text-xs text-[#787b86] truncate max-w-[180px]">{selectedQuote.name}</span>
                      </div>
                      <div className="flex flex-col items-end font-mono tabular-nums">
                        <span className="text-base font-bold text-white">
                          ${selectedQuote.price > 1000 ? selectedQuote.price.toFixed(1) : selectedQuote.price.toFixed(2)}
                        </span>
                        <span className={`text-xs font-semibold ${selectedQuote.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {selectedQuote.changePercent >= 0 ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#2a2e39]/60 font-mono tabular-nums">
                      <div>
                        <span className="text-[10px] text-[#787b86] block">24H High</span>
                        <span className="text-white">${selectedQuote.high24h.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#787b86] block">24H Low</span>
                        <span className="text-white">${selectedQuote.low24h.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#787b86] block">Volume</span>
                        <span className="text-white">{selectedQuote.volume}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#787b86] block">Rating</span>
                        <span className="text-[#089981] font-semibold">{selectedQuote.rating}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="p-4 flex flex-col gap-4">
                {/* Create Alert Form */}
                {selectedQuote && (
                  <form onSubmit={handleCreateAlert} className="flex flex-col gap-2.5 p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                    <span className="text-xs font-bold text-white">Set Alert for {selectedQuote.symbol}</span>
                    <div className="flex gap-2">
                      <select
                        value={alertCondition}
                        onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                        className="px-2 py-1.5 text-xs bg-[#1e222d] border border-[#2a2e39] rounded text-white focus:outline-none"
                      >
                        <option value="above">Crossing Above</option>
                        <option value="below">Crossing Below</option>
                      </select>
                      <input
                        type="number"
                        step="any"
                        placeholder={selectedQuote.price.toString()}
                        value={alertPrice}
                        onChange={(e) => setAlertPrice(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs bg-[#1e222d] border border-[#2a2e39] rounded text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 text-xs font-semibold text-white bg-[#2962ff] hover:bg-[#1e53e5] rounded transition-colors"
                    >
                      Create Price Alert
                    </button>
                  </form>
                )}

                {/* Active Alerts */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">
                    Active Alerts ({alerts.length})
                  </span>
                  {alerts.length === 0 ? (
                    <span className="text-xs text-[#787b86] italic">No active alerts set.</span>
                  ) : (
                    alerts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs font-mono"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{a.symbol}</span>
                          <span className="text-[11px] text-[#787b86]">
                            {a.condition === 'above' ? '≥' : '≤'} ${a.targetPrice.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => onDeleteAlert(a.id)}
                          className="p-1 text-[#787b86] hover:text-[#f23645]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Economic Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="p-3 flex flex-col gap-2.5 divide-y divide-[#2a2e39]/50">
                {economicEvents.map((ev) => (
                  <div key={ev.id} className="pt-2.5 first:pt-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-[#787b86]">{ev.time}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        ev.impact === 'high' ? 'bg-[#f23645]/20 text-[#f23645]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                      }`}>
                        {ev.impact} impact
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{ev.flag}</span>
                      <span className="text-xs font-medium text-white">{ev.event}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#787b86] mt-0.5">
                      <span>Act: <strong className="text-white">{ev.actual}</strong></span>
                      <span>Frc: {ev.forecast}</span>
                      <span>Prev: {ev.previous}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="p-4 flex flex-col gap-4">
                {/* Account Summary */}
                <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#787b86]">Paper Balance:</span>
                    <span className="font-mono font-bold text-white">${balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#787b86]">Unrealized P&L:</span>
                    <span className={`font-mono font-bold ${totalPnL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2a2e39]">
                    <span className="text-[#787b86]">Total Equity:</span>
                    <span className="font-mono font-bold text-white">${totalEquity.toFixed(2)}</span>
                  </div>
                </div>

                {/* Open Positions */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">
                    Open Positions ({positions.length})
                  </span>
                  {positions.length === 0 ? (
                    <span className="text-xs text-[#787b86] italic">No active simulated trades. Open the chart modal on any asset to execute a paper trade.</span>
                  ) : (
                    positions.map((pos) => {
                      const isUp = pos.pnl >= 0;
                      return (
                        <div
                          key={pos.id}
                          className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1 rounded text-[10px] font-bold ${
                                pos.type === 'BUY' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                              }`}>
                                {pos.type}
                              </span>
                              <span className="font-bold text-white">{pos.symbol}</span>
                              <span className="text-[11px] text-[#787b86]">x{pos.shares}</span>
                            </div>
                            <button
                              onClick={() => onClosePosition(pos.id)}
                              className="px-2 py-0.5 text-[10px] font-semibold text-white bg-[#2a2e39] hover:bg-[#f23645] rounded transition-colors"
                            >
                              Close
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#787b86]">
                            <span>Entry: ${pos.entryPrice.toFixed(2)}</span>
                            <span>Mark: ${pos.currentPrice.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2a2e39]/40 font-semibold">
                            <span className="text-[#787b86]">Net P&L:</span>
                            <span className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                              {isUp ? '+' : ''}${pos.pnl.toFixed(2)} ({isUp ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Iconic TradingView Right-Edge Icon Bar */}
      <div className="w-12 flex flex-col items-center py-3 bg-[#1e222d] border-l border-[#2a2e39] gap-4 shrink-0">
        <button
          onClick={() => {
            if (isOpen && activeTab === 'watchlist') onToggleOpen();
            else {
              setActiveTab('watchlist');
              if (!isOpen) onToggleOpen();
            }
          }}
          title="Watchlist & Details"
          className={`p-2 rounded-lg transition-colors relative ${
            isOpen && activeTab === 'watchlist'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
          }`}
        >
          <ListFilter className="w-5 h-5" />
          {watchlistQuotes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2962ff] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {watchlistQuotes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (isOpen && activeTab === 'alerts') onToggleOpen();
            else {
              setActiveTab('alerts');
              if (!isOpen) onToggleOpen();
            }
          }}
          title="Price Alerts"
          className={`p-2 rounded-lg transition-colors relative ${
            isOpen && activeTab === 'alerts'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
          }`}
        >
          <Bell className="w-5 h-5" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f59e0b] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {alerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (isOpen && activeTab === 'calendar') onToggleOpen();
            else {
              setActiveTab('calendar');
              if (!isOpen) onToggleOpen();
            }
          }}
          title="Economic Calendar"
          className={`p-2 rounded-lg transition-colors ${
            isOpen && activeTab === 'calendar'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
          }`}
        >
          <Calendar className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (isOpen && activeTab === 'portfolio') onToggleOpen();
            else {
              setActiveTab('portfolio');
              if (!isOpen) onToggleOpen();
            }
          }}
          title="Paper Trading Portfolio"
          className={`p-2 rounded-lg transition-colors relative ${
            isOpen && activeTab === 'portfolio'
              ? 'bg-[#2962ff] text-white shadow-sm'
              : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
          }`}
        >
          <Wallet className="w-5 h-5" />
          {positions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#089981] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {positions.length}
            </span>
          )}
        </button>

        {/* Toggle open/collapse arrow at bottom */}
        <div className="mt-auto pt-2 border-t border-[#2a2e39] w-full flex justify-center">
          <button
            onClick={onToggleOpen}
            title={isOpen ? 'Collapse Panel' : 'Expand Panel'}
            className="p-1.5 text-[#787b86] hover:text-white hover:bg-[#2a2e39] rounded"
          >
            {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
