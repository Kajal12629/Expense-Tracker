import React from 'react';
import { ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { calculateBudgetStatuses } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const BudgetQuickView: React.FC = () => {
  const { budgets, transactions, categories, settings, setActiveTab } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const budgetStatuses = calculateBudgetStatuses(budgets, transactions, categories);
  const displayBudgets = budgetStatuses.slice(0, 4);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-xs text-neutral-500">Current month spending limits</p>
        </div>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg glass-subtle hover:border-white/80 dark:hover:border-white/20 transition-all ${accent.text}`}
        >
          <span>Manage</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {displayBudgets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-neutral-500 mb-3">
            Create a budget to start controlling your spending.
          </p>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-xl shadow-md ${accent.primary}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Budget</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {displayBudgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.budget.id}
                className="p-3 rounded-xl glass-subtle border border-white/50 dark:border-white/5 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                      style={{
                        backgroundColor: `${b.categoryColor}25`,
                        color: b.categoryColor,
                      }}
                    >
                      <CategoryIcon name={b.categoryIcon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {b.budget.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(b.spent, settings.currency)}
                    </span>
                    <span className="text-neutral-400">/</span>
                    <span className="text-neutral-500">
                      {formatCurrency(b.budget.amount, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar with glass track */}
                <div className="w-full h-2 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                      isExceeded
                        ? 'bg-gradient-to-r from-rose-600 to-pink-500 shadow-rose-500/30'
                        : isWarning
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-amber-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/30'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={
                      isExceeded
                        ? 'text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1'
                        : isWarning
                        ? 'text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1'
                        : 'text-neutral-500'
                    }
                  >
                    {(isExceeded || isWarning) && <AlertCircle className="w-3 h-3" />}
                    {isExceeded
                      ? `Exceeded by ${formatCurrency(b.spent - b.budget.amount, settings.currency)}`
                      : `${formatCurrency(b.remaining, settings.currency)} remaining`}
                  </span>
                  <span className="font-mono font-bold text-neutral-600 dark:text-neutral-400">
                    {formatPercentage(b.percentage)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
