import React, { useState, useMemo } from 'react';
import { Plus, WalletCards, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../context/FinanceContext';
import { calculateBudgetStatuses } from '../utils/calculations';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { EmptyState } from '../components/common/EmptyState';
import { Budget } from '../types/finance';

export const BudgetsPage: React.FC = () => {
  const { budgets, transactions, categories, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const budgetStatuses = useMemo(
    () => calculateBudgetStatuses(budgets, transactions, categories),
    [budgets, transactions, categories]
  );

  // Aggregated budget statistics
  const summary = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let exceededCount = 0;
    let warningCount = 0;

    budgetStatuses.forEach((b) => {
      totalBudget += b.budget.amount;
      totalSpent += b.spent;
      if (b.status === 'exceeded') exceededCount++;
      else if (b.status === 'warning') warningCount++;
    });

    const totalRemaining = Math.max(0, totalBudget - totalSpent);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage,
      exceededCount,
      warningCount,
    };
  }, [budgetStatuses]);

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Set and monitor category spending thresholds for the current calendar month.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Budget</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      {budgets.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Overall Budget Health
              </span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                {formatCurrency(summary.totalSpent, settings.currency)}{' '}
                <span className="text-sm font-normal text-neutral-400">
                  of {formatCurrency(summary.totalBudget, settings.currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {summary.exceededCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {summary.exceededCount} Exceeded
                </span>
              )}
              {summary.warningCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {summary.warningCount} Near Cap
                </span>
              )}
              {summary.exceededCount === 0 && summary.warningCount === 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Within Limits
                </span>
              )}
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.overallPercentage >= 100
                  ? 'bg-rose-500'
                  : summary.overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <span>
              {formatCurrency(summary.totalRemaining, settings.currency)} aggregate available
            </span>
            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
              {formatPercentage(summary.overallPercentage)} utilized
            </span>
          </div>
        </div>
      )}

      {/* Grid of Budgets or Empty State */}
      {budgets.length === 0 ? (
        <EmptyState
          icon="WalletCards"
          title="No budgets configured"
          description="Create a budget to start controlling your spending."
          actionText="Create Budget"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetStatuses.map((status) => (
            <BudgetCard
              key={status.budget.id}
              status={status}
              onEdit={() => handleEdit(status.budget)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        editingBudget={editingBudget}
      />
    </div>
  );
};
