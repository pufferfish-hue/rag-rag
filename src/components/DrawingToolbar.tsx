import React from 'react';
import { DrawingToolType } from '../types/market';
import {
  MousePointer2,
  TrendingUp,
  Minus,
  Binary,
  Layers,
  Ruler,
  Trash2,
} from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: DrawingToolType;
  onSelectTool: (tool: DrawingToolType) => void;
  onClearDrawings: () => void;
  drawingsCount: number;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  onSelectTool,
  onClearDrawings,
  drawingsCount,
}) => {
  const tools = [
    { id: 'cursor' as DrawingToolType, icon: MousePointer2, label: 'Crosshair / Pointer (V)' },
    { id: 'trendline' as DrawingToolType, icon: TrendingUp, label: 'Trendline Tool (Alt+T)' },
    { id: 'horizontal' as DrawingToolType, icon: Minus, label: 'Horizontal Ray / Level (Alt+H)' },
    { id: 'fibonacci' as DrawingToolType, icon: Binary, label: 'Fibonacci Retracement (Alt+F)' },
    { id: 'position' as DrawingToolType, icon: Layers, label: 'Long/Short Risk-Reward Box' },
    { id: 'measure' as DrawingToolType, icon: Ruler, label: 'Measure Date & Price Range' },
  ];

  return (
    <div className="flex flex-col items-center py-2 px-1 bg-[#1e222d] border-r border-[#2a2e39] gap-2 select-none shrink-0 z-10">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTool(t.id)}
            title={t.label}
            className={`p-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}

      {/* Clear Drawings Button */}
      {drawingsCount > 0 && (
        <button
          onClick={onClearDrawings}
          title={`Clear ${drawingsCount} drawings (Del)`}
          className="mt-auto p-2 text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
