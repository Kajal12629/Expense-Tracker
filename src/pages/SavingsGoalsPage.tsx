import React, { useState, useMemo } from 'react';
import { Plus, Target, Trophy, PiggyBank } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../context/FinanceContext';
import { SavingsGoalCard } from '../components/goals/SavingsGoalCard';
import { SavingsGoalModal } from '../components/goals/SavingsGoalModal';
import { AddMoneyModal } from '../components/goals/AddMoneyModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { SavingsGoal } from '../types/finance';

export const SavingsGoalsPage: React.FC = () => {
  const { savingsGoals, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [addFundsGoalId, setAddFundsGoalId] = useState<string | null>(null);

  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;

    savingsGoals.forEach((g) => {
      totalTarget += g.targetAmount;
      totalSaved += g.currentAmount;
      if (g.currentAmount >= g.targetAmount && g.targetAmount > 0) {
        completedCount++;
      }
    });

    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      overallProgress,
      completedCount,
    };
  }, [savingsGoals]);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleCreate = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Track milestones, purchases, and emergency reserve funds.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      {savingsGoals.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Savings Accumulated
              </span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                {formatCurrency(summary.totalSaved, settings.currency)}{' '}
                <span className="text-sm font-normal text-neutral-400">
                  of {formatCurrency(summary.totalTarget, settings.currency)} target
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {summary.completedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {summary.completedCount} Reached!
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <PiggyBank className="w-3.5 h-3.5" />
                {savingsGoals.length} Active Goals
              </span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: `${Math.min(100, summary.overallProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <span>
              {formatCurrency(summary.totalRemaining, settings.currency)} remaining to full financial freedom
            </span>
            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
              {formatPercentage(summary.overallProgress)} completed
            </span>
          </div>
        </div>
      )}

      {/* Grid of Goals or Empty State */}
      {savingsGoals.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No savings goals created"
          description="Set your first savings goal and track your progress."
          actionText="Create Goal"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEdit(goal)}
              onAddFunds={() => setAddFundsGoalId(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        editingGoal={editingGoal}
      />

      {/* Add / Withdraw Funds Modal */}
      <AddMoneyModal
        goalId={addFundsGoalId}
        onClose={() => setAddFundsGoalId(null)}
      />
    </div>
  );
};
