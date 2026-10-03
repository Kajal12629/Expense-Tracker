import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Transaction } from '../../types/finance';

export const RecentTransactions: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    setActiveTab,
    setIsAddTxModalOpen,
    setEditingTx,
    deleteTransaction,
  } = useFinance();

  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const recentTxs = transactions.slice(0, 6);

  const getCategoryDetails = (catName: string) => {
    return categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
  };

  return (
    <>
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              Recent Transactions
            </h2>
            <p className="text-xs text-neutral-500">Latest debits and credits recorded</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg glass-subtle hover:border-white/80 dark:hover:border-white/20 text-neutral-700 dark:text-neutral-300 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg glass-subtle hover:border-white/80 dark:hover:border-white/20 transition-all ${accent.text}`}
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentTxs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              No transactions yet. Start by adding your first transaction.
            </p>
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className={`mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-xl shadow-sm ${accent.primary}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentTxs.map((tx) => {
              const cat = getCategoryDetails(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 px-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cat?.color ? `${cat.color}15` : '#f1f5f9',
                        color: cat?.color || '#64748b',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold font-mono tabular-nums ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, settings.currency)}
                      </p>
                      <span className="text-[10px] text-neutral-400 capitalize">
                        {tx.type}
                      </span>
                    </div>

                    {/* Hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTx(tx);
                          setIsAddTxModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTxToDelete(tx)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) deleteTransaction(txToDelete.id);
        }}
        title="Delete Transaction?"
        message={`Are you sure you want to remove "${txToDelete?.description}" (${formatCurrency(
          txToDelete?.amount || 0,
          settings.currency
        )})? This will immediately recalculate your balance.`}
        confirmText="Delete Transaction"
      />
    </>
  );
};
