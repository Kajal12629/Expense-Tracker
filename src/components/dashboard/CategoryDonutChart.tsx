import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { calculateCategoryExpenses } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Plus } from 'lucide-react';

export const CategoryDonutChart: React.FC = () => {
  const { transactions, categories, settings, setIsAddTxModalOpen } = useFinance();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const categoryExpenses = useMemo(
    () => calculateCategoryExpenses(transactions, categories),
    [transactions, categories]
  );

  const totalExpense = useMemo(
    () => categoryExpenses.reduce((sum, item) => sum + item.amount, 0),
    [categoryExpenses]
  );

  // SVG Donut calculation
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = categoryExpenses.map((item, idx) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  const activeCategory = hoveredIdx !== null ? categoryExpenses[hoveredIdx] : null;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            Expense by Category
          </h2>
          <p className="text-xs text-neutral-500">Distribution across active budget categories</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300 glass-subtle px-2.5 py-1 rounded-lg border border-white/60 dark:border-white/10 shadow-sm">
          {categoryExpenses.length} {categoryExpenses.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {totalExpense === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl glass-subtle flex items-center justify-center text-neutral-400 mb-3 shadow-inner">
            <CategoryIcon name="PieChart" className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No expenses recorded
          </p>
          <p className="text-xs text-neutral-400 max-w-xs mt-1 mb-4">
            Add your first expense transaction to visualize category spending.
          </p>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
          {/* Donut graphic */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform drop-shadow-sm">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-neutral-200/40 dark:text-neutral-800/40"
              />
              {slices.map((slice) => {
                const isHovered = hoveredIdx === slice.idx;
                return (
                  <circle
                    key={slice.categoryId}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer hover:opacity-95"
                    onMouseEnter={() => setHoveredIdx(slice.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </svg>

            {/* Frosted Center metric inside donut */}
            <div className="absolute inset-5 rounded-full glass-subtle flex flex-col items-center justify-center text-center pointer-events-none px-3 border border-white/60 dark:border-white/10 shadow-inner">
              <span className="text-[11px] font-semibold text-neutral-500 truncate max-w-[100px]">
                {activeCategory ? activeCategory.categoryName : 'Total Spent'}
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-0.5">
                {formatCurrency(
                  activeCategory ? activeCategory.amount : totalExpense,
                  settings.currency
                )}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {activeCategory
                  ? `${formatPercentage(activeCategory.percentage)} of total`
                  : `${categoryExpenses.reduce((c, i) => c + i.count, 0)} logs`}
              </span>
            </div>
          </div>

          {/* Interactive Legend with glass micro bars */}
          <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {categoryExpenses.map((cat, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={cat.categoryId}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    isHovered
                      ? 'glass-card border-white/90 dark:border-white/20'
                      : 'hover:bg-white/40 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {cat.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(cat.amount, settings.currency)}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400 w-8 text-right font-medium">
                        {formatPercentage(cat.percentage)}
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
