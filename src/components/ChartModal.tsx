import React, { useState } from 'react';
import { Quote } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { TechnicalGauge } from './TechnicalGauge';
import { X, Star, ArrowUpRight, ArrowDownRight, ExternalLink, ShieldCheck } from 'lucide-react';

interface ChartModalProps {
  quote: Quote | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onPlaceOrder: (symbol: string, name: string, type: 'BUY' | 'SELL', shares: number, price: number) => void;
  balance: number;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  quote,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onPlaceOrder,
  balance,
}) => {
  if (!quote) return null;

  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(10);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const isUp = quote.changePercent >= 0;
  const totalCost = shares * quote.price;

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0) return;
    onPlaceOrder(quote.symbol, quote.name, orderType, shares, quote.price);
    setOrderSuccess(`Successfully placed ${orderType} order for ${shares} units of ${quote.symbol}`);
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-[#2a2e39] bg-[#131722]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWatchlist(quote.symbol)}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className={`p-1.5 rounded-lg border border-[#2a2e39] transition-colors ${
                isWatchlisted ? 'text-[#f59e0b] bg-[#f59e0b]/10' : 'text-[#787b86] hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{quote.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[#787b86]">
                  {quote.exchange || quote.type.toUpperCase()}
                </span>
                <span className="text-xs text-[#787b86] hidden sm:inline">· {quote.name}</span>
              </div>
            </div>
          </div>

          {/* Current Live Price Banner */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end font-mono tabular-nums">
              <span className="text-2xl font-bold text-white">
                ${quote.price > 1000 ? quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : quote.price.toFixed(quote.price < 1 ? 4 : 2)}
              </span>
              <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isUp ? '+' : ''}{quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#787b86] hover:text-white rounded-lg hover:bg-[#2a2e39] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Chart + Side Panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-4">
          {/* Main Chart Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <InteractiveChart quote={quote} height={420} />

            {/* Description & Overview */}
            {quote.description && (
              <div className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] text-xs">
                <span className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider block mb-1">
                  About {quote.name}
                </span>
                <p className="text-[#d1d4dc] leading-relaxed">{quote.description}</p>
              </div>
            )}
          </div>

          {/* Right Rail: Technical Gauge & Instant Paper Trading */}
          <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
            {/* Technical Gauge */}
            <TechnicalGauge rating={quote.rating} size={200} />

            {/* Key Statistics Grid */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] flex flex-col gap-2.5 text-xs font-mono tabular-nums">
              <span className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider font-sans">
                Key Fundamentals
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787b86]">Market Cap</span>
                  <span className="text-white font-medium">{quote.marketCap || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787b86]">24h Volume</span>
                  <span className="text-white font-medium">{quote.volume}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787b86]">P/E Ratio</span>
                  <span className="text-white font-medium">{quote.pe || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787b86]">Div Yield</span>
                  <span className="text-white font-medium">{quote.dividend || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787b86]">24h High</span>
                  <span className="text-[#089981] font-medium">${quote.high24h.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#787b86]">24h Low</span>
                  <span className="text-[#f23645] font-medium">${quote.low24h.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Paper Trading Execution Ticket */}
            <form onSubmit={handleExecuteOrder} className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Paper Trading Order
                </span>
                <span className="text-[10px] text-[#089981] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Live Sim
                </span>
              </div>

              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39]">
                <button
                  type="button"
                  onClick={() => setOrderType('BUY')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                    orderType === 'BUY'
                      ? 'bg-[#089981] text-white shadow-sm'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('SELL')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                    orderType === 'SELL'
                      ? 'bg-[#f23645] text-white shadow-sm'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  Sell / Short
                </button>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1 text-xs">
                <label className="text-[#787b86] text-[11px]">Units / Shares</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={shares}
                  onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="px-3 py-1.5 bg-[#1e222d] border border-[#2a2e39] rounded text-white font-mono tabular-nums focus:outline-none focus:border-[#2962ff]"
                />
              </div>

              {/* Order Estimation */}
              <div className="flex items-center justify-between text-xs font-mono tabular-nums pt-1 border-t border-[#2a2e39]/60">
                <span className="text-[#787b86]">Total Value:</span>
                <span className="font-bold text-white">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {orderSuccess && (
                <div className="p-2 text-[11px] rounded bg-[#089981]/20 text-[#089981] border border-[#089981]/30">
                  {orderSuccess}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2 text-xs font-bold text-white rounded-lg transition-colors ${
                  orderType === 'BUY'
                    ? 'bg-[#089981] hover:bg-[#07806c]'
                    : 'bg-[#f23645] hover:bg-[#d82a38]'
                }`}
              >
                Place Paper {orderType} Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
