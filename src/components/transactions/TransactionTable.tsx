import React, { useState } from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatFullDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useFinance } from '../../context/FinanceContext';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onClearFilters?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onClearFilters,
}) => {
  const { categories, deleteTransaction, settings, setIsAddTxModalOpen } = useFinance();
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const getCategory = (catName: string) => {
    return categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
  };

  // Filtered totals
  const filteredIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredNet = filteredIncome - filteredExpense;

  return (
    <>
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm relative">
        {/* Table summary sub-header */}
        <div className="px-5 py-3.5 glass-subtle border-b border-white/40 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
            Showing {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
          </span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              +{formatCurrency(filteredIncome, settings.currency)}
            </span>
            <span className="text-rose-500 font-bold">
              -{formatCurrency(filteredExpense, settings.currency)}
            </span>
            <span
              className={`font-bold pl-2 border-l border-neutral-300 dark:border-neutral-700 ${
                filteredNet >= 0
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              Net: {formatCurrency(filteredNet, settings.currency)}
            </span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-14 px-4">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No matching transactions found
            </p>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Try adjusting your search criteria or date filters.
            </p>
            <div className="flex items-center justify-center gap-3">
              {onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 transition-all hover:scale-105"
              >
                + Add Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/50 dark:bg-neutral-800/20 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800 text-[10px]">
                <tr>
                  <th scope="col" className="py-3 px-5">Description</th>
                  <th scope="col" className="py-3 px-4">Category</th>
                  <th scope="col" className="py-3 px-4">Method</th>
                  <th scope="col" className="py-3 px-4">Date</th>
                  <th scope="col" className="py-3 px-5 text-right">Amount</th>
                  <th scope="col" className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {transactions.map((tx) => {
                  const cat = getCategory(tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors group"
                    >
                      {/* Description & Notes */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-start gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              backgroundColor: cat?.color ? `${cat.color}15` : '#f1f5f9',
                              color: cat?.color || '#64748b',
                            }}
                          >
                            <CategoryIcon name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                              {tx.description}
                            </p>
                            {tx.notes && (
                              <p className="text-[11px] text-neutral-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                                <FileText className="w-3 h-3 shrink-0" />
                                <span>{tx.notes}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-300 font-medium">
                        {tx.category}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                        {tx.paymentMethod}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500">
                        {formatFullDate(tx.date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-neutral-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, settings.currency)}
                        </span>
                        <span className="block text-[10px] text-neutral-400 uppercase font-mono">
                          {tx.type}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        message={`Are you sure you want to permanently delete "${txToDelete?.description}"? Your account balances and category totals will update immediately.`}
        confirmText="Delete"
      />
    </>
  );
};
