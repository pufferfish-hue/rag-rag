import React, { useState } from 'react';
import { Quote } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { TechnicalGauge } from './TechnicalGauge';
import { OrderBook } from './OrderBook';
import {
  X,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface ChartModalProps {
  quote: Quote | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onPlaceOrder: (
    symbol: string,
    name: string,
    type: 'BUY' | 'SELL',
    shares: number,
    price: number,
    leverage?: number,
    tp?: number,
    sl?: number
  ) => void;
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
  const [leverage, setLeverage] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(quote.price);
  const [takeProfit, setTakeProfit] = useState<string>(
    (quote.price * (orderType === 'BUY' ? 1.05 : 0.95)).toFixed(2)
  );
  const [stopLoss, setStopLoss] = useState<string>(
    (quote.price * (orderType === 'BUY' ? 0.97 : 1.03)).toFixed(2)
  );
  const [sideTab, setSideTab] = useState<'trade' | 'dom' | 'technicals'>('trade');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const isUp = quote.changePercent >= 0;
  const nominalCost = shares * quote.price;
  const marginRequired = nominalCost / leverage;

  // Calculate Risk / Reward ratio
  const tpVal = parseFloat(takeProfit) || quote.price;
  const slVal = parseFloat(stopLoss) || quote.price;
  const profitPotential = Math.abs(tpVal - quote.price) * shares;
  const lossRisk = Math.abs(quote.price - slVal) * shares || 1;
  const riskRewardRatio = (profitPotential / lossRisk).toFixed(2);

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0) return;
    onPlaceOrder(
      quote.symbol,
      quote.name,
      orderType,
      shares,
      quote.price,
      leverage,
      parseFloat(takeProfit) || undefined,
      parseFloat(stopLoss) || undefined
    );
    setOrderSuccess(
      `Filled ${orderType} ${shares}x ${quote.symbol} @ $${quote.price.toFixed(2)} (${leverage}x Lev)`
    );
    setTimeout(() => setOrderSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-[#2a2e39] bg-[#131722]">
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
                <h2 className="text-xl font-extrabold text-white tracking-tight">{quote.symbol}</h2>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[#2962ff]">
                  PRO TERMINAL
                </span>
                <span className="text-xs text-[#787b86] hidden sm:inline">{quote.name}</span>
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

        {/* Modal Main Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col lg:flex-row gap-3.5">
          {/* Main Chart Area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <InteractiveChart quote={quote} height={440} />

            {/* Fundamentals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 rounded-xl bg-[#131722] border border-[#2a2e39] text-xs font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-[#787b86] block font-sans">Market Cap</span>
                <span className="text-white font-semibold">{quote.marketCap || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] block font-sans">24h Volume</span>
                <span className="text-white font-semibold">{quote.volume}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] block font-sans">P/E Ratio</span>
                <span className="text-white font-semibold">{quote.pe || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] block font-sans">Dividend</span>
                <span className="text-white font-semibold">{quote.dividend || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] block font-sans">24h High</span>
                <span className="text-[#089981] font-semibold">${quote.high24h.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] block font-sans">24h Low</span>
                <span className="text-[#f23645] font-semibold">${quote.low24h.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right Console Rail: Order Execution, DOM, Technical Gauge */}
          <div className="w-full lg:w-88 flex flex-col gap-3 shrink-0">
            {/* Rail Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39]">
              <button
                onClick={() => setSideTab('trade')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  sideTab === 'trade' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Trade Ticket
              </button>
              <button
                onClick={() => setSideTab('dom')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  sideTab === 'dom' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Order Book (L2)
              </button>
              <button
                onClick={() => setSideTab('technicals')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  sideTab === 'technicals' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Technicals
              </button>
            </div>

            {/* TAB 1: Professional Paper Trading Console */}
            {sideTab === 'trade' && (
              <form onSubmit={handleExecuteOrder} className="p-4 rounded-xl bg-[#131722] border border-[#2a2e39] flex flex-col gap-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Institutional Order Ticket
                  </span>
                  <span className="text-[10px] text-[#089981] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Execution
                  </span>
                </div>

                {/* Buy / Sell */}
                <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39]">
                  <button
                    type="button"
                    onClick={() => setOrderType('BUY')}
                    className={`py-2 text-xs font-bold rounded transition-colors ${
                      orderType === 'BUY' ? 'bg-[#089981] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    Buy / Long
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('SELL')}
                    className={`py-2 text-xs font-bold rounded transition-colors ${
                      orderType === 'SELL' ? 'bg-[#f23645] text-white shadow-sm' : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    Sell / Short
                  </button>
                </div>

                {/* Leverage Slider */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#787b86] text-[11px]">Simulated Leverage:</span>
                    <span className="font-mono font-bold text-[#2962ff]">{leverage}x Margin</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 5, 10, 20].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLeverage(l)}
                        className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                          leverage === l ? 'bg-[#2962ff] text-white border-[#2962ff]' : 'border-[#2a2e39] text-[#787b86] hover:text-white'
                        }`}
                      >
                        {l}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shares / Quantity */}
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[#787b86] text-[11px]">Units / Position Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={shares}
                    onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                    className="px-3 py-1.5 bg-[#1e222d] border border-[#2a2e39] rounded text-white font-mono tabular-nums focus:outline-none focus:border-[#2962ff]"
                  />
                </div>

                {/* Bracket Orders: Take Profit & Stop Loss */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#089981] text-[10px] font-bold">Take Profit ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="px-2.5 py-1 bg-[#1e222d] border border-[#2a2e39] rounded text-white font-mono tabular-nums focus:outline-none focus:border-[#089981]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#f23645] text-[10px] font-bold">Stop Loss ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="px-2.5 py-1 bg-[#1e222d] border border-[#2a2e39] rounded text-white font-mono tabular-nums focus:outline-none focus:border-[#f23645]"
                    />
                  </div>
                </div>

                {/* Risk / Reward & Margin Breakdown */}
                <div className="flex flex-col gap-1 pt-2 border-t border-[#2a2e39]/60 font-mono tabular-nums text-xs">
                  <div className="flex items-center justify-between text-[#787b86]">
                    <span>Risk / Reward:</span>
                    <span className="font-bold text-[#089981]">1 : {riskRewardRatio}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#787b86]">
                    <span>Margin Required:</span>
                    <span className="font-bold text-white">${marginRequired.toFixed(2)}</span>
                  </div>
                </div>

                {orderSuccess && (
                  <div className="p-2 text-[11px] rounded bg-[#089981]/20 text-[#089981] border border-[#089981]/30">
                    {orderSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 text-xs font-bold text-white rounded-lg transition-colors ${
                    orderType === 'BUY' ? 'bg-[#089981] hover:bg-[#07806c]' : 'bg-[#f23645] hover:bg-[#d82a38]'
                  }`}
                >
                  Execute {orderType} ({leverage}x)
                </button>
              </form>
            )}

            {/* TAB 2: Order Book DOM */}
            {sideTab === 'dom' && (
              <OrderBook quote={quote} onPriceSelect={(p) => setCustomPrice(p)} />
            )}

            {/* TAB 3: Technical Gauge */}
            {sideTab === 'technicals' && (
              <TechnicalGauge rating={quote.rating} size={200} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
