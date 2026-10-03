import React, { useState, useMemo } from 'react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { calculateSpendingTrends, SpendingDataPoint } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

type RangeOption = '7d' | 'this_month' | '3m' | 'this_year';

export const SpendingBarChart: React.FC = () => {
  const { transactions, settings } = useFinance();
  const [range, setRange] = useState<RangeOption>('this_month');
  const [hoveredPoint, setHoveredPoint] = useState<SpendingDataPoint | null>(null);

  const dataPoints = useMemo(
    () => calculateSpendingTrends(transactions, range),
    [transactions, range]
  );

  const rangeTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    dataPoints.forEach((p) => {
      income += p.income;
      expense += p.expense;
    });
    return { income, expense, net: income - expense };
  }, [dataPoints]);

  const maxVal = useMemo(() => {
    let max = 1000;
    dataPoints.forEach((p) => {
      if (p.income > max) max = p.income;
      if (p.expense > max) max = p.expense;
    });
    return max * 1.15; // 15% headroom
  }, [dataPoints]);

  const rangeButtons: { id: RangeOption; label: string }[] = [
    { id: '7d', label: 'Last 7 days' },
    { id: 'this_month', label: 'This month' },
    { id: '3m', label: 'Last 3 months' },
    { id: 'this_year', label: 'This year' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      {/* Header and Filter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            Spending & Cashflow
          </h2>
          <p className="text-xs text-neutral-500">Income vs. Expense over selected timeframe</p>
        </div>

        {/* Range Segmented Control */}
        <div className="flex items-center gap-1 p-1 glass-subtle rounded-xl self-start sm:self-auto overflow-x-auto max-w-full shadow-inner">
          {rangeButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setRange(btn.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                range === btn.id
                  ? 'bg-white dark:bg-white/15 text-neutral-900 dark:text-white shadow-sm border border-white/80 dark:border-white/10'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Range Summary Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 mb-4 rounded-xl glass-subtle border border-white/50 dark:border-white/5 text-center shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
            Range Income
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(rangeTotals.income, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
            Range Spent
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-rose-500 dark:text-rose-400">
            {formatCurrency(rangeTotals.expense, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
            Net Flow
          </span>
          <span
            className={`text-xs sm:text-sm font-bold font-mono ${
              rangeTotals.net >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(rangeTotals.net, settings.currency)}
          </span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="flex-1 flex flex-col justify-end pt-4 min-h-[175px]">
        {/* Tooltip display */}
        <div className="h-6 text-center text-xs mb-2">
          {hoveredPoint ? (
            <span className="inline-flex items-center gap-3 glass-panel px-3 py-1 rounded-lg shadow-lg font-mono text-[11px] border border-white/80 dark:border-white/20">
              <span className="font-sans font-semibold text-neutral-800 dark:text-neutral-200">
                {hoveredPoint.label}:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                +{formatCurrency(hoveredPoint.income, settings.currency)}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">·</span>
              <span className="text-rose-500 dark:text-rose-400 font-bold">
                -{formatCurrency(hoveredPoint.expense, settings.currency)}
              </span>
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              Hover over columns for granular breakdown
            </span>
          )}
        </div>

        {/* The Bars */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-44 pt-4 border-b border-white/40 dark:border-white/5">
          {dataPoints.map((point, idx) => {
            const incomeHeight = maxVal > 0 ? (point.income / maxVal) * 100 : 0;
            const expenseHeight = maxVal > 0 ? (point.expense / maxVal) * 100 : 0;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1.5 h-full">
                  {/* Income bar with luminous gradient */}
                  <div
                    style={{ height: `${Math.max(4, incomeHeight)}%` }}
                    className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                      point.income > 0
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm shadow-emerald-500/20 group-hover:brightness-110'
                        : 'bg-neutral-200/40 dark:bg-neutral-800/40'
                    }`}
                  />
                  {/* Expense bar with luminous gradient */}
                  <div
                    style={{ height: `${Math.max(4, expenseHeight)}%` }}
                    className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                      point.expense > 0
                        ? 'bg-gradient-to-t from-rose-600 to-pink-400 shadow-sm shadow-rose-500/20 group-hover:brightness-110'
                        : 'bg-neutral-200/40 dark:bg-neutral-800/40'
                    }`}
                  />
                </div>

                {/* X-axis label */}
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mt-2 truncate max-w-full text-center group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  {point.label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-sm" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-rose-600 to-pink-400 shadow-sm" />
            <span>Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
