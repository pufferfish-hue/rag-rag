import React, { useState } from 'react';
import { Quote, MultiChartLayout } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { LayoutGrid, SplitSquareVertical, Square, ChevronDown } from 'lucide-react';

interface MultiChartGridProps {
  quotes: Quote[];
  onSelectQuoteForModal: (quote: Quote) => void;
}

export const MultiChartGrid: React.FC<MultiChartGridProps> = ({ quotes, onSelectQuoteForModal }) => {
  const [layout, setLayout] = useState<MultiChartLayout>('2x1');

  // Selected symbols for the 4 slots
  const [slot1, setSlot1] = useState<string>('SPX');
  const [slot2, setSlot2] = useState<string>('BTCUSD');
  const [slot3, setSlot3] = useState<string>('NVDA');
  const [slot4, setSlot4] = useState<string>('EURUSD');

  const getQuote = (sym: string): Quote => {
    return quotes.find(q => q.symbol === sym) || quotes[0];
  };

  const renderSlotHeader = (slotSymbol: string, setSlot: (sym: string) => void) => {
    const q = getQuote(slotSymbol);
    const isUp = q.changePercent >= 0;

    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e222d] border-b border-[#2a2e39] text-xs">
        <div className="flex items-center gap-2">
          {/* Symbol Selector Dropdown */}
          <select
            value={slotSymbol}
            onChange={(e) => setSlot(e.target.value)}
            className="font-bold text-white bg-[#131722] border border-[#2a2e39] rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#2962ff]"
          >
            {quotes.map((item) => (
              <option key={item.symbol} value={item.symbol}>
                {item.symbol} ({item.name})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-[#787b86] hidden sm:inline">{q.exchange || 'INDEX'}</span>
        </div>

        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span className="font-bold text-white">${q.price.toFixed(q.price < 1 ? 4 : 2)}</span>
          <span className={`text-[11px] font-semibold ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
          </span>
          <button
            onClick={() => onSelectQuoteForModal(q)}
            className="text-[10px] text-[#2962ff] hover:underline ml-1"
          >
            Expand
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-[#131722] border border-[#2a2e39] rounded-xl p-3">
      {/* Multi-Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2962ff]"></span>
            Multi-Chart Pro Grid
          </span>
          <span className="text-[11px] text-[#787b86]">Synchronized multi-asset institutional monitoring</span>
        </div>

        {/* Layout Buttons (1x1, 2x1, 2x2) */}
        <div className="flex items-center gap-1 p-0.5 bg-[#1e222d] border border-[#2a2e39] rounded-lg">
          <button
            onClick={() => setLayout('1x1')}
            title="Single Chart (1x1)"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              layout === '1x1' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1x1</span>
          </button>
          <button
            onClick={() => setLayout('2x1')}
            title="Dual Split View (2x1)"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              layout === '2x1' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>2x1 Split</span>
          </button>
          <button
            onClick={() => setLayout('2x2')}
            title="Quad Grid (2x2)"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              layout === '2x2' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2x2 Quad</span>
          </button>
        </div>
      </div>

      {/* Grid Containers */}
      {layout === '1x1' && (
        <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
          {renderSlotHeader(slot1, setSlot1)}
          <InteractiveChart quote={getQuote(slot1)} height={480} />
        </div>
      )}

      {layout === '2x1' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
            {renderSlotHeader(slot1, setSlot1)}
            <InteractiveChart quote={getQuote(slot1)} height={380} isCompact />
          </div>
          <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
            {renderSlotHeader(slot2, setSlot2)}
            <InteractiveChart quote={getQuote(slot2)} height={380} isCompact />
          </div>
        </div>
      )}

      {layout === '2x2' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
            {renderSlotHeader(slot1, setSlot1)}
            <InteractiveChart quote={getQuote(slot1)} height={320} isCompact />
          </div>
          <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
            {renderSlotHeader(slot2, setSlot2)}
            <InteractiveChart quote={getQuote(slot2)} height={320} isCompact />
          </div>
          <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
            {renderSlotHeader(slot3, setSlot3)}
            <InteractiveChart quote={getQuote(slot3)} height={320} isCompact />
          </div>
          <div className="flex flex-col border border-[#2a2e39] rounded-lg overflow-hidden">
            {renderSlotHeader(slot4, setSlot4)}
            <InteractiveChart quote={getQuote(slot4)} height={320} isCompact />
          </div>
        </div>
      )}
    </div>
  );
};
