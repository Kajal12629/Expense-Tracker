import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Calendar, CheckCircle2, Trophy } from 'lucide-react';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: () => void;
  onAddFunds: () => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onEdit,
  onAddFunds,
}) => {
  const { deleteSavingsGoal, settings } = useFinance();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const percentage =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isCompleted = percentage >= 100;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <>
      <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group relative overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: `${goal.color}20`,
                  color: goal.color,
                }}
              >
                <CategoryIcon name={goal.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate">
                  {goal.title}
                </h3>
                {goal.deadline ? (
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    <span>Target: {formatDate(goal.deadline)}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-neutral-400">Open-ended goal</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Edit goal"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete goal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metric Figures */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">Saved</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {formatCurrency(goal.currentAmount, settings.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block font-medium">Target</span>
              <span className="text-sm font-semibold font-mono text-neutral-500">
                {formatCurrency(goal.targetAmount, settings.currency)}
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, percentage)}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Target Reached! (100%)</span>
            </div>
          ) : (
            <div className="text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {formatCurrency(remaining, settings.currency)}
              </span>{' '}
              to go
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {formatPercentage(percentage)}
            </span>
            <button
              onClick={onAddFunds}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm transition-all hover:opacity-95 ${accent.primary} text-white`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Funds</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteSavingsGoal(goal.id)}
        title="Delete Savings Goal?"
        message={`Are you sure you want to remove the goal "${goal.title}"? Your accumulated funds calculation will be removed.`}
        confirmText="Remove Goal"
      />
    </>
  );
};
