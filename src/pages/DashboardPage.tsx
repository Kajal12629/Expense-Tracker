import React, { useState } from 'react';
import { Plus, Download, WalletCards, Target } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../context/FinanceContext';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SpendingBarChart } from '../components/dashboard/SpendingBarChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { BudgetQuickView } from '../components/dashboard/BudgetQuickView';
import { SavingsQuickView } from '../components/dashboard/SavingsQuickView';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AddMoneyModal } from '../components/goals/AddMoneyModal';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { SavingsGoalModal } from '../components/goals/SavingsGoalModal';

export const DashboardPage: React.FC = () => {
  const { settings, setIsAddTxModalOpen, setActiveTab, exportData, showToast } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [activeGoalIdForDeposit, setActiveGoalIdForDeposit] = useState<string | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDownloadBackup = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Financial snapshot exported to JSON', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {getGreeting()}, {settings.userName}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Here is your financial command center and cashflow breakdown.
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl glass-card hover:border-white/80 dark:hover:border-white/20 text-neutral-700 dark:text-neutral-300 shadow-sm transition-all"
            title="Export snapshot"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl glass-card hover:border-white/80 dark:hover:border-white/20 text-neutral-700 dark:text-neutral-300 shadow-sm transition-all"
          >
            <WalletCards className="w-3.5 h-3.5" />
            <span>Set Budget</span>
          </button>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl glass-card hover:border-white/80 dark:hover:border-white/20 text-neutral-700 dark:text-neutral-300 shadow-sm transition-all"
          >
            <Target className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <SummaryCards />

      {/* Spending Overview Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <SpendingBarChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Budgets & Savings Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BudgetQuickView />
        <SavingsQuickView
          onAddMoneyClick={(goalId) => setActiveGoalIdForDeposit(goalId)}
        />
      </div>

      {/* Recent Transactions Feed */}
      <RecentTransactions />

      {/* Deposit modal */}
      <AddMoneyModal
        goalId={activeGoalIdForDeposit}
        onClose={() => setActiveGoalIdForDeposit(null)}
      />

      {/* Budget & Goal Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        editingBudget={null}
      />
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={null}
      />
    </div>
  );
};
