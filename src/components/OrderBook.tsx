import React, { useState, useEffect } from 'react';
import { Quote, OrderBookLevel, TradePrint } from '../types/market';
import { ArrowDownRight, ArrowUpRight, Radio } from 'lucide-react';

interface OrderBookProps {
  quote: Quote;
  onPriceSelect?: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({ quote, onPriceSelect }) => {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [trades, setTrades] = useState<TradePrint[]>([]);
  const [activeTab, setActiveTab] = useState<'dom' | 'trades'>('dom');

  // Generate realistic order book around quote.price
  useEffect(() => {
    const cur = quote.price;
    const tick = cur > 1000 ? 0.5 : cur > 100 ? 0.05 : 0.01;

    const newBids: OrderBookLevel[] = [];
    let bidTotal = 0;
    for (let i = 1; i <= 8; i++) {
      const p = Number((cur - i * tick).toFixed(cur < 1 ? 4 : 2));
      const s = Math.floor(Math.random() * 450 + 50);
      bidTotal += s;
      newBids.push({ price: p, size: s, total: bidTotal });
    }

    const newAsks: OrderBookLevel[] = [];
    let askTotal = 0;
    for (let i = 1; i <= 8; i++) {
      const p = Number((cur + i * tick).toFixed(cur < 1 ? 4 : 2));
      const s = Math.floor(Math.random() * 450 + 50);
      askTotal += s;
      newAsks.push({ price: p, size: s, total: askTotal });
    }

    setBids(newBids);
    setAsks(newAsks.reverse()); // Asks lowest on bottom, highest on top

    // Seed recent trades
    const seedTrades: TradePrint[] = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(now.getTime() - i * 3500);
      const isBuy = Math.random() > 0.45;
      const tPrice = isBuy
        ? Number((cur + (Math.random() * tick)).toFixed(cur < 1 ? 4 : 2))
        : Number((cur - (Math.random() * tick)).toFixed(cur < 1 ? 4 : 2));
      seedTrades.push({
        id: `tr-${i}`,
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: tPrice,
        size: Math.floor(Math.random() * 120 + 10),
        side: isBuy ? 'buy' : 'sell',
      });
    }
    setTrades(seedTrades);
  }, [quote.price, quote.symbol]);

  // Periodic micro trade stream
  useEffect(() => {
    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.48;
      const tick = quote.price > 1000 ? 0.5 : quote.price > 100 ? 0.05 : 0.01;
      const priceDelta = (Math.random() - 0.48) * tick;
      const p = Number((quote.price + priceDelta).toFixed(quote.price < 1 ? 4 : 2));
      const size = Math.floor(Math.random() * 250 + 15);
      const now = new Date();

      const newTrade: TradePrint = {
        id: `tr-${Date.now()}`,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: p,
        size,
        side: isBuy ? 'buy' : 'sell',
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 1800);

    return () => clearInterval(interval);
  }, [quote.price]);

  const maxTotal = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total),
    1
  );

  const bestAsk = asks[asks.length - 1]?.price || quote.price;
  const bestBid = bids[0]?.price || quote.price;
  const spread = Math.max(0, bestAsk - bestBid);
  const spreadPct = ((spread / quote.price) * 100) || 0.01;

  return (
    <div className="flex flex-col w-full bg-[#131722] border border-[#2a2e39] rounded-xl overflow-hidden font-mono text-xs select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2e39] bg-[#1e222d]">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#089981] animate-pulse" />
          <span className="font-sans font-bold text-xs text-white uppercase tracking-wider">
            Order Book (L2) & Tape
          </span>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded border border-[#2a2e39]">
          <button
            onClick={() => setActiveTab('dom')}
            className={`px-2 py-0.5 text-[11px] font-sans font-semibold rounded ${
              activeTab === 'dom' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            DOM
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-2 py-0.5 text-[11px] font-sans font-semibold rounded ${
              activeTab === 'trades' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            Trades
          </button>
        </div>
      </div>

      {activeTab === 'dom' ? (
        <div className="flex flex-col p-2">
          {/* Table Column Labels */}
          <div className="grid grid-cols-3 text-[10px] text-[#787b86] uppercase font-semibold py-1 px-1 border-b border-[#2a2e39]/50">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell Orders) - Red */}
          <div className="flex flex-col gap-0.5 py-1">
            {asks.slice(-5).map((a, i) => {
              const depthPct = (a.total / maxTotal) * 100;
              return (
                <div
                  key={`ask-${i}`}
                  onClick={() => onPriceSelect && onPriceSelect(a.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-[#2a2e39]/40 cursor-pointer rounded"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 rounded pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="relative text-[#f23645] font-semibold">{a.price.toFixed(a.price < 1 ? 4 : 2)}</span>
                  <span className="relative text-right text-white">{a.size}</span>
                  <span className="relative text-right text-[#787b86]">{a.total}</span>
                </div>
              );
            })}
          </div>

          {/* Spread Bar & Mark Price */}
          <div className="flex items-center justify-between py-1.5 px-2 my-1 bg-[#1e222d] border-y border-[#2a2e39] font-sans text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white">
                ${quote.price > 1000 ? quote.price.toFixed(1) : quote.price.toFixed(quote.price < 1 ? 4 : 2)}
              </span>
              <span className={`text-[11px] font-mono ${quote.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {quote.changePercent >= 0 ? '▲' : '▼'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#787b86] font-mono">
              <span>Spread: ${spread.toFixed(2)}</span>
              <span>({spreadPct.toFixed(3)}%)</span>
            </div>
          </div>

          {/* Bids (Buy Orders) - Green */}
          <div className="flex flex-col gap-0.5 py-1">
            {bids.slice(0, 5).map((b, i) => {
              const depthPct = (b.total / maxTotal) * 100;
              return (
                <div
                  key={`bid-${i}`}
                  onClick={() => onPriceSelect && onPriceSelect(b.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-[#2a2e39]/40 cursor-pointer rounded"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#089981]/15 rounded pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="relative text-[#089981] font-semibold">{b.price.toFixed(b.price < 1 ? 4 : 2)}</span>
                  <span className="relative text-right text-white">{b.size}</span>
                  <span className="relative text-right text-[#787b86]">{b.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Time & Sales Tape */
        <div className="flex flex-col p-2 max-h-64 overflow-y-auto divide-y divide-[#2a2e39]/30">
          <div className="grid grid-cols-3 text-[10px] text-[#787b86] uppercase font-semibold py-1 px-1">
            <span>Time</span>
            <span className="text-center">Price</span>
            <span className="text-right">Size</span>
          </div>
          {trades.map((t) => (
            <div key={t.id} className="grid grid-cols-3 py-1 px-1 hover:bg-[#2a2e39]/40 text-[11px]">
              <span className="text-[#787b86]">{t.time}</span>
              <span className={`text-center font-bold ${t.side === 'buy' ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                ${t.price.toFixed(t.price < 1 ? 4 : 2)}
              </span>
              <span className="text-right text-white">{t.size}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
