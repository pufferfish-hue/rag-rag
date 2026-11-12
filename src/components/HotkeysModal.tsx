import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Navigation & Search', keys: '⌘K or /', desc: 'Open Symbol Finder & Search' },
    { category: 'Navigation & Search', keys: 'Spacebar', desc: 'Advance to next ticker in Watchlist' },
    { category: 'Navigation & Search', keys: 'ESC', desc: 'Dismiss modal or return to pointer cursor' },
    { category: 'Chart Pro Tools', keys: 'Alt + T', desc: 'Activate Trendline drawing tool' },
    { category: 'Chart Pro Tools', keys: 'Alt + H', desc: 'Activate Horizontal price level ray' },
    { category: 'Chart Pro Tools', keys: 'Alt + F', desc: 'Toggle Fullscreen chart mode' },
    { category: 'Multi-Chart Layouts', keys: '1 / 2 / 4', desc: 'Switch 1x1, 2x1 split, or 2x2 quad grid' },
    { category: 'Trading & Execution', keys: 'B', desc: 'Quick Long / Buy order ticket' },
    { category: 'Trading & Execution', keys: 'S', desc: 'Quick Short / Sell order ticket' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-[#1e222d] border border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] bg-[#131722]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#2962ff]" />
            <h3 className="font-extrabold text-white text-sm">TradingView PRO Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 flex flex-col gap-2.5 max-h-96 overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-[#131722] border border-[#2a2e39]/60 text-xs"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-white">{sc.desc}</span>
                <span className="text-[10px] text-[#787b86]">{sc.category}</span>
              </div>
              <kbd className="px-2 py-1 text-[11px] font-mono font-bold bg-[#1e222d] text-[#2962ff] rounded border border-[#2a2e39] shadow-sm">
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-t border-[#2a2e39] bg-[#131722] text-[11px] text-[#787b86] flex justify-between">
          <span>Speed up your technical workflow with pro hotkeys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
