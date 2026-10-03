import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowUpRight, ArrowDownLeft, Plus, WalletCards, Target, Sliders } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    transactions,
    categories,
    settings,
    setActiveTab,
    setIsAddTxModalOpen,
    setEditingTx,
  } = useFinance();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  // Global keydown listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  const filteredTransactions = query.trim()
    ? transactions.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      })
    : [];

  const handleSelectTransaction = (tx: (typeof transactions)[0]) => {
    setIsCommandPaletteOpen(false);
    setEditingTx(tx);
    setIsAddTxModalOpen(true);
  };

  const quickNav = [
    { label: 'Add New Transaction', icon: Plus, action: () => { setIsCommandPaletteOpen(false); setIsAddTxModalOpen(true); } },
    { label: 'View Budgets', icon: WalletCards, action: () => { setIsCommandPaletteOpen(false); setActiveTab('budgets'); } },
    { label: 'View Savings Goals', icon: Target, action: () => { setIsCommandPaletteOpen(false); setActiveTab('goals'); } },
    { label: 'Open Settings', icon: Sliders, action: () => { setIsCommandPaletteOpen(false); setActiveTab('settings'); } },
  ];

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommandPaletteOpen(false)}
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-md"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl glass-modal rounded-3xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/60 dark:border-white/10 gap-3">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions by description, category, or payment method..."
                className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results / Navigation Content */}
            <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
              {query.trim() ? (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Transactions ({filteredTransactions.length})
                  </div>
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-neutral-400">
                      No transactions matching &quot;{query}&quot;
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredTransactions.map((tx) => {
                        const isIncome = tx.type === 'income';
                        const cat = categories.find((c) => c.name.toLowerCase() === tx.category.toLowerCase());
                        return (
                          <button
                            key={tx.id}
                            onClick={() => handleSelectTransaction(tx)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: cat?.color ? `${cat.color}20` : '#f1f5f9',
                                  color: cat?.color || '#64748b',
                                }}
                              >
                                <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                  {tx.description}
                                </p>
                                <p className="text-[11px] text-neutral-400">
                                  {tx.category} · {tx.paymentMethod} · {formatDate(tx.date)}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`font-mono text-xs font-bold tabular-nums shrink-0 ${
                                isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(tx.amount, settings.currency)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Quick Commands
                  </div>
                  {quickNav.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={idx}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{cmd.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Press <kbd className="font-mono bg-white dark:bg-neutral-700 px-1 rounded border border-neutral-200 dark:border-neutral-600">Esc</kbd> to close</span>
              <span>Search across all transaction records</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
