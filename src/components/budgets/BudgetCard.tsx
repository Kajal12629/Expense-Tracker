import React, { useState } from 'react';
import { Edit2, Trash2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BudgetStatus } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useFinance } from '../../context/FinanceContext';

interface BudgetCardProps {
  status: BudgetStatus;
  onEdit: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ status, onEdit }) => {
  const { deleteBudget, settings } = useFinance();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { budget, spent, remaining, percentage, categoryColor, categoryIcon } = status;
  const isExceeded = status.status === 'exceeded';
  const isWarning = status.status === 'warning';

  return (
    <>
      <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group relative overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                }}
              >
                <CategoryIcon name={categoryIcon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {budget.category}
                </h3>
                <span className="text-[11px] text-neutral-500 capitalize">
                  Monthly Cap
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Edit budget"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete budget"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[11px] text-neutral-400 block">Spent This Month</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {formatCurrency(spent, settings.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block">Limit</span>
              <span className="text-sm font-semibold font-mono text-neutral-500 dark:text-neutral-400">
                {formatCurrency(budget.amount, settings.currency)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExceeded
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Footer info pill */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          {isExceeded ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Over by {formatCurrency(spent - budget.amount, settings.currency)}</span>
            </span>
          ) : isWarning ? (
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formatCurrency(remaining, settings.currency)} left (Near cap)</span>
            </span>
          ) : (
            <span className="text-neutral-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{formatCurrency(remaining, settings.currency)} available</span>
            </span>
          )}

          <span
            className={`font-mono font-bold text-xs ${
              isExceeded
                ? 'text-rose-600 dark:text-rose-400'
                : isWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {formatPercentage(percentage)}
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteBudget(budget.id)}
        title="Delete Budget?"
        message={`Are you sure you want to remove the monthly budget for "${budget.category}"? Your recorded transactions will not be deleted.`}
        confirmText="Remove Budget"
      />
    </>
  );
};
