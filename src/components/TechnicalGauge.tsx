import React from 'react';

interface TechnicalGaugeProps {
  rating: 'Strong Sell' | 'Sell' | 'Neutral' | 'Buy' | 'Strong Buy';
  size?: number;
}

export const TechnicalGauge: React.FC<TechnicalGaugeProps> = ({ rating, size = 220 }) => {
  // Map rating to angle in semi-circle: 180 to 0 degrees (-180 to 0)
  // Strong Sell: -160, Sell: -125, Neutral: -90, Buy: -55, Strong Buy: -20
  const ratingToAngle: Record<string, number> = {
    'Strong Sell': -160,
    'Sell': -125,
    'Neutral': -90,
    'Buy': -55,
    'Strong Buy': -20,
  };

  const angle = ratingToAngle[rating] ?? -90;

  // Breakdown statistics
  const breakdown: Record<string, { oscBuy: number; oscNeutral: number; oscSell: number; maBuy: number; maNeutral: number; maSell: number }> = {
    'Strong Buy': { oscBuy: 3, oscNeutral: 8, oscSell: 0, maBuy: 14, maNeutral: 1, maSell: 0 },
    'Buy': { oscBuy: 2, oscNeutral: 9, oscSell: 1, maBuy: 10, maNeutral: 2, maSell: 3 },
    'Neutral': { oscBuy: 1, oscNeutral: 10, oscSell: 1, maBuy: 7, maNeutral: 1, maSell: 7 },
    'Sell': { oscBuy: 0, oscNeutral: 9, oscSell: 3, maBuy: 2, maNeutral: 1, maSell: 12 },
    'Strong Sell': { oscBuy: 0, oscNeutral: 8, oscSell: 4, maBuy: 0, maNeutral: 1, maSell: 14 },
  };

  const stats = breakdown[rating] || breakdown['Neutral'];

  const getRatingColor = (r: string) => {
    switch (r) {
      case 'Strong Buy': return 'text-[#089981]';
      case 'Buy': return 'text-[#089981]';
      case 'Neutral': return 'text-[#787b86]';
      case 'Sell': return 'text-[#f23645]';
      case 'Strong Sell': return 'text-[#f23645]';
      default: return 'text-slate-400';
    }
  };

  const getRatingBadgeBg = (r: string) => {
    switch (r) {
      case 'Strong Buy': return 'bg-[#089981]/15 text-[#089981] border-[#089981]/30';
      case 'Buy': return 'bg-[#089981]/10 text-[#089981] border-[#089981]/20';
      case 'Neutral': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Sell': return 'bg-[#f23645]/10 text-[#f23645] border-[#f23645]/20';
      case 'Strong Sell': return 'bg-[#f23645]/15 text-[#f23645] border-[#f23645]/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-[#1e222d] dark:bg-[#1e222d] border border-[#2a2e39] rounded-xl text-[#d1d4dc]">
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#787b86]">
          Technical Analysis Summary
        </span>
        <span className="text-[11px] text-[#787b86]">1D Timeframe</span>
      </div>

      {/* SVG Meter */}
      <div className="relative flex items-center justify-center my-2" style={{ width: size, height: size * 0.58 }}>
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          {/* Background Arc Segments */}
          {/* Strong Sell */}
          <path
            d="M 20 100 A 80 80 0 0 1 43.4 43.4"
            fill="none"
            stroke="#f23645"
            strokeWidth="10"
            strokeOpacity="0.4"
          />
          {/* Sell */}
          <path
            d="M 43.4 43.4 A 80 80 0 0 1 76.5 24.3"
            fill="none"
            stroke="#f23645"
            strokeWidth="10"
            strokeOpacity="0.8"
          />
          {/* Neutral */}
          <path
            d="M 76.5 24.3 A 80 80 0 0 1 123.5 24.3"
            fill="none"
            stroke="#787b86"
            strokeWidth="10"
            strokeOpacity="0.6"
          />
          {/* Buy */}
          <path
            d="M 123.5 24.3 A 80 80 0 0 1 156.6 43.4"
            fill="none"
            stroke="#089981"
            strokeWidth="10"
            strokeOpacity="0.8"
          />
          {/* Strong Buy */}
          <path
            d="M 156.6 43.4 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#089981"
            strokeWidth="10"
            strokeOpacity="1"
          />

          {/* Needle Center Pivot */}
          <circle cx="100" cy="100" r="6" fill="#d1d4dc" />
          <circle cx="100" cy="100" r="3" fill="#131722" />

          {/* Rotating Needle */}
          <g
            style={{
              transform: `rotate(${angle + 90}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <polygon points="98,100 102,100 100,28" fill="#d1d4dc" />
          </g>

          {/* Labels on arc */}
          <text x="14" y="112" fill="#787b86" fontSize="8" fontWeight="600">SELL</text>
          <text x="88" y="16" fill="#787b86" fontSize="8" fontWeight="600">NEUTRAL</text>
          <text x="166" y="112" fill="#787b86" fontSize="8" fontWeight="600">BUY</text>
        </svg>

        {/* Current rating title below needle */}
        <div className="absolute bottom-0 text-center">
          <span className={`text-base font-bold tracking-tight uppercase ${getRatingColor(rating)}`}>
            {rating}
          </span>
        </div>
      </div>

      {/* Breakdown grids: Oscillators & Moving Averages */}
      <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-3 border-t border-[#2a2e39] text-xs">
        {/* Oscillators */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-[#787b86] uppercase tracking-wider">
            Oscillators
          </span>
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-[#f23645]">{stats.oscSell} Sell</span>
            <span className="text-[#787b86]">{stats.oscNeutral} Neutral</span>
            <span className="text-[#089981]">{stats.oscBuy} Buy</span>
          </div>
          <div className="text-[11px] font-semibold text-center py-1 rounded border border-[#2a2e39] bg-[#131722]">
            {stats.oscBuy > stats.oscSell ? 'Buy' : stats.oscSell > stats.oscBuy ? 'Sell' : 'Neutral'}
          </div>
        </div>

        {/* Moving Averages */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-[#787b86] uppercase tracking-wider">
            Moving Averages
          </span>
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-[#f23645]">{stats.maSell} Sell</span>
            <span className="text-[#787b86]">{stats.maNeutral} Neutral</span>
            <span className="text-[#089981]">{stats.maBuy} Buy</span>
          </div>
          <div className="text-[11px] font-semibold text-center py-1 rounded border border-[#2a2e39] bg-[#131722]">
            {stats.maBuy > stats.maSell ? 'Strong Buy' : stats.maSell > stats.maBuy ? 'Strong Sell' : 'Neutral'}
          </div>
        </div>
      </div>
    </div>
  );
};
