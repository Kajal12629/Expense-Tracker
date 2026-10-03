import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Target,
  Tags,
  Settings,
  Plus,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { useFinance, NavigationTab, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, setIsAddTxModalOpen, totals, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: WalletCards },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: NavigationTab) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-neutral-950/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 glass-panel border-r border-white/60 dark:border-white/10 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/40 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center font-black text-base shadow-sm ring-1 ring-white/20">
              <Coins className="w-4 h-4 text-emerald-400 dark:text-emerald-600 drop-shadow-sm" />
            </div>
            <span className="font-extrabold text-lg text-neutral-900 dark:text-white tracking-tight">
              SpendWise
            </span>
          </div>
        </div>

        {/* Quick Add CTA Button */}
        <div className="px-4 pt-5 pb-3">
          <button
            onClick={() => {
              setIsAddTxModalOpen(true);
              if (onClose) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg shadow-emerald-500/15 dark:shadow-emerald-500/10 transition-all hover:opacity-95 active:scale-[0.98] ${accent.primary}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-white/80 dark:bg-white/10 text-neutral-900 dark:text-white font-semibold shadow-sm border border-white/80 dark:border-white/10 backdrop-blur-md'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? accent.text : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mini Balance Summary Card in Sidebar */}
        <div className="p-4 mx-3 mb-4 rounded-xl glass-subtle border border-white/60 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Net Balance</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatCurrency(totals.totalBalance, settings.currency)}
          </div>
          <div className="mt-2 pt-2 border-t border-white/40 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Savings Rate</span>
            <span className="font-mono tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">
              {Math.round(totals.savingsRate)}%
            </span>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/40 dark:border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-500/30 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300 shadow-sm">
            {settings.userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
              {settings.userName}
            </p>
            <p className="text-xs text-neutral-500 truncate">Personal Workspace</p>
          </div>
        </div>
      </aside>
    </>
  );
};
