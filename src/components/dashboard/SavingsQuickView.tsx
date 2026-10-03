import React from 'react';
import { ChevronRight, Plus, Target, CheckCircle2 } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface SavingsQuickViewProps {
  onAddMoneyClick: (goalId: string) => void;
}

export const SavingsQuickView: React.FC<SavingsQuickViewProps> = ({ onAddMoneyClick }) => {
  const { savingsGoals, settings, setActiveTab } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const topGoals = savingsGoals.slice(0, 3);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs text-neutral-500">Progress toward financial milestones</p>
        </div>
        <button
          onClick={() => setActiveTab('goals')}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg glass-subtle hover:border-white/80 dark:hover:border-white/20 transition-all ${accent.text}`}
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {topGoals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-neutral-500 mb-3">
            Set your first savings goal and track your progress.
          </p>
          <button
            onClick={() => setActiveTab('goals')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-xl shadow-md ${accent.primary}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Goal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {topGoals.map((goal) => {
            const percentage =
              goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isCompleted = percentage >= 100;

            return (
              <div
                key={goal.id}
                className="p-3 rounded-xl glass-subtle border border-white/50 dark:border-white/5 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                      style={{
                        backgroundColor: `${goal.color}25`,
                        color: goal.color,
                      }}
                    >
                      <CategoryIcon name={goal.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {goal.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddMoneyClick(goal.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg glass-card hover:border-white/80 dark:hover:border-white/20 text-neutral-800 dark:text-neutral-200 shadow-sm transition-all"
                      >
                        + Add Funds
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar with glass track */}
                <div className="w-full h-2 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-mono tabular-nums">
                    {formatCurrency(goal.currentAmount, settings.currency)} of{' '}
                    {formatCurrency(goal.targetAmount, settings.currency)}
                  </span>
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    {formatPercentage(percentage)}
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
