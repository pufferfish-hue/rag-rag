import React from 'react';
import { Quote } from '../types/market';
import { MarketHeatmap } from '../components/MarketHeatmap';

interface HeatmapScreenProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const HeatmapScreen: React.FC<HeatmapScreenProps> = ({ quotes, onSelectQuote }) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none">
      {/* Heatmap Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Market Treemap Heatmap</h1>
        <p className="text-xs text-[#787b86]">Visual overview of market capitalization weighting and daily performance across sectors</p>
      </div>

      {/* Main Heatmap */}
      <MarketHeatmap quotes={quotes} onSelectQuote={onSelectQuote} />
    </div>
  );
};
