import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { CommandPalette } from './components/search/CommandPalette';
import { TransactionModal } from './components/transactions/TransactionModal';

import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, toasts, dismissToast } = useFinance();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-50/80 dark:bg-[#0B0F19] text-neutral-900 dark:text-neutral-100 flex transition-colors selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      {/* Ambient Glassmorphism Luminous Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-right soft emerald glow */}
        <div className="absolute -top-40 -right-40 w-96 sm:w-[540px] h-96 sm:h-[540px] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-transparent dark:from-emerald-500/10 dark:via-teal-500/8 dark:to-transparent blur-3xl" />
        {/* Center-left soft indigo / blue glow */}
        <div className="absolute top-1/3 -left-40 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-blue-300/10 to-transparent dark:from-indigo-600/12 dark:via-blue-500/8 dark:to-transparent blur-3xl" />
        {/* Bottom-right soft purple / violet glow */}
        <div className="absolute -bottom-40 right-1/4 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-gradient-to-tl from-violet-400/15 via-purple-300/10 to-transparent dark:from-violet-600/10 dark:via-purple-500/6 dark:to-transparent blur-3xl" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'budgets' && <BudgetsPage />}
          {activeTab === 'goals' && <SavingsGoalsPage />}
          {activeTab === 'categories' && <CategoriesPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Modals & Notifications */}
      <TransactionModal />
      <CommandPalette />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
