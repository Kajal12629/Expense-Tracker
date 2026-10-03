import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Target,
  Settings,
  Plus,
} from 'lucide-react';
import { useFinance, NavigationTab, ACCENT_COLOR_MAP } from '../../context/FinanceContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddTxModalOpen, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const tabs: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: WalletCards },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-white/60 dark:border-white/10 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {tabs.slice(0, 2).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive
                ? accent.text
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* Center floating Add button */}
      <button
        onClick={() => setIsAddTxModalOpen(true)}
        className={`w-11 h-11 -mt-4 rounded-full text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 ${accent.primary}`}
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {tabs.slice(2).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive
                ? accent.text
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
