import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { CounterNumber } from '../common/CounterNumber';

export const SummaryCards: React.FC = () => {
  const { totals, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const cards = [
    {
      title: 'Net Balance',
      amount: totals.totalBalance,
      icon: Wallet,
      subtitle: `${totals.incomeCount + totals.expenseCount} total transactions`,
      accentText: totals.totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      badge: totals.totalBalance >= 0 ? 'Positive flow' : 'Negative balance',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      glow: 'from-emerald-500/5 to-transparent',
    },
    {
      title: 'Total Income',
      amount: totals.totalIncome,
      icon: ArrowUpRight,
      subtitle: `${totals.incomeCount} credits logged`,
      accentText: 'text-emerald-600 dark:text-emerald-400',
      badge: '+ Credits',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      glow: 'from-emerald-500/5 to-transparent',
    },
    {
      title: 'Total Expenses',
      amount: totals.totalExpenses,
      icon: ArrowDownLeft,
      subtitle: `${totals.expenseCount} debits logged`,
      accentText: 'text-rose-600 dark:text-rose-400',
      badge: '- Debits',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      glow: 'from-rose-500/5 to-transparent',
    },
    {
      title: 'Net Savings',
      amount: totals.savings,
      icon: PiggyBank,
      subtitle: `${Math.round(totals.savingsRate)}% of income saved`,
      accentText: accent.text,
      badge: `${Math.round(totals.savingsRate)}% rate`,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      glow: 'from-indigo-500/5 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="glass-card relative overflow-hidden rounded-2xl p-5 group cursor-default"
          >
            {/* Ambient Internal Glow Accent */}
            <div
              className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-gradient-to-br ${card.glow} blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white mb-2 relative z-10">
              <CounterNumber value={card.amount} currency={settings.currency} />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2.5 border-t border-white/50 dark:border-white/5 relative z-10">
              <span className="truncate max-w-[140px]">{card.subtitle}</span>
              <span className={`font-mono text-[11px] font-semibold shrink-0 ${card.accentText}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
