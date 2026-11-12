import React from 'react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD'];

// Matrix values (% change against row currency)
const MATRIX_DATA: Record<string, Record<string, number>> = {
  USD: { USD: 0, EUR: 0.30, GBP: -0.14, JPY: 0.55, CHF: 0.24, AUD: 0.34, CAD: 0.18 },
  EUR: { USD: -0.30, EUR: 0, GBP: -0.44, JPY: 0.25, CHF: -0.06, AUD: 0.04, CAD: -0.12 },
  GBP: { USD: 0.14, EUR: 0.44, GBP: 0, JPY: 0.69, CHF: 0.38, AUD: 0.48, CAD: 0.32 },
  JPY: { USD: -0.55, EUR: -0.25, GBP: -0.69, JPY: 0, CHF: -0.31, AUD: -0.21, CAD: -0.37 },
  CHF: { USD: -0.24, EUR: 0.06, GBP: -0.38, JPY: 0.31, CHF: 0, AUD: 0.10, CAD: -0.06 },
  AUD: { USD: -0.34, EUR: -0.04, GBP: -0.48, JPY: 0.21, CHF: -0.10, AUD: 0, CAD: -0.16 },
  CAD: { USD: -0.18, EUR: 0.12, GBP: -0.32, JPY: 0.37, CHF: 0.06, AUD: 0.16, CAD: 0 },
};

export const ForexMatrix: React.FC = () => {
  const getCellColor = (val: number, isSelf: boolean) => {
    if (isSelf) return 'bg-[#131722] text-[#787b86]';
    if (val >= 0.4) return 'bg-[#089981] text-white font-semibold';
    if (val > 0.05) return 'bg-[#089981]/50 text-white font-medium';
    if (val >= -0.05) return 'bg-[#2a2e39] text-[#787b86]';
    if (val > -0.4) return 'bg-[#f23645]/50 text-white font-medium';
    return 'bg-[#f23645] text-white font-semibold';
  };

  return (
    <div className="flex flex-col w-full bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">Forex Currency Strength Heatmap</h3>
          <p className="text-xs text-[#787b86]">Relative daily percentage changes between major currency pairs</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-semibold text-[#787b86] bg-[#131722]/60">Base</th>
              {CURRENCIES.map((c) => (
                <th key={c} className="p-2 text-xs font-bold text-white bg-[#131722]/60 border-l border-[#2a2e39]/50">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 text-xs font-mono tabular-nums">
            {CURRENCIES.map((row) => (
              <tr key={row}>
                <td className="p-2 font-bold text-white bg-[#131722]/40 text-left pl-3">{row}</td>
                {CURRENCIES.map((col) => {
                  const isSelf = row === col;
                  const val = MATRIX_DATA[row]?.[col] ?? 0;
                  return (
                    <td
                      key={col}
                      className={`p-2 border-l border-[#2a2e39]/50 transition-colors ${getCellColor(val, isSelf)}`}
                    >
                      {isSelf ? '—' : `${val > 0 ? '+' : ''}${val.toFixed(2)}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
