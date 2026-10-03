import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';
import { CurrencyCode } from '../../types/finance';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const {
    activeTab,
    setIsAddTxModalOpen,
    setIsCommandPaletteOpen,
    settings,
    setTheme,
    setCurrency,
  } = useFinance();

  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Financial Command Center', subtitle: 'Real-time overview of your net worth, expenses & budgets' },
    transactions: { title: 'Transactions Ledger', subtitle: 'Search, filter, edit and track every movement' },
    budgets: { title: 'Monthly Budgets', subtitle: 'Spending caps and category allocation limits' },
    goals: { title: 'Savings Goals', subtitle: 'Milestones, progress bars and target allocations' },
    categories: { title: 'Custom Categories', subtitle: 'Personalized expense & income classification' },
    settings: { title: 'Preferences & System', subtitle: 'Theme, currency, backup export and personal settings' },
  };

  const currentMeta = pageTitles[activeTab] || { title: 'SpendWise', subtitle: '' };

  const handleNextTheme = () => {
    if (settings.theme === 'light') setTheme('dark');
    else if (settings.theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const currencies: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP'];

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-white/60 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Zone 1: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-white/10 border border-transparent hover:border-white/40 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="hidden sm:inline">SpendWise</span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">/</span>
            <span className="capitalize">{activeTab}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate tracking-tight">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Zone 3: Search Trigger, Currency Picker, Theme Toggle & Add CTA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search / Command Palette shortcut button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-subtle text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-white/80 dark:hover:border-white/20 shadow-sm transition-all"
          title="Search transactions (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden md:inline font-medium">Quick Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white/70 dark:bg-neutral-800/80 border border-white/60 dark:border-white/10 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Currency Selector Pill */}
        <div className="relative">
          <select
            value={settings.currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="appearance-none glass-subtle hover:border-white/80 dark:hover:border-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all shadow-sm"
            aria-label="Select currency"
          >
            {currencies.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                {CURRENCY_SYMBOLS[c]} {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* Theme mode toggle */}
        <button
          onClick={handleNextTheme}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-white/10 glass-subtle hover:border-white/80 dark:hover:border-white/20 transition-all shadow-sm"
          title={`Theme: ${settings.theme} (click to switch)`}
          aria-label="Toggle theme"
        >
          {settings.theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          {settings.theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
          {settings.theme === 'system' && <Laptop className="w-4 h-4 text-neutral-500" />}
        </button>

        {/* Primary Add Transaction Button */}
        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>
    </header>
  );
};
