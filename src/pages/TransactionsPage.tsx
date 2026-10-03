import React, { useState, useMemo } from 'react';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../context/FinanceContext';
import { TransactionFilters, FilterState } from '../components/transactions/TransactionFilters';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { Transaction } from '../types/finance';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    settings,
    setIsAddTxModalOpen,
    setEditingTx,
    showToast,
  } = useFinance();

  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const initialFilters: FilterState = {
    search: '',
    type: 'all',
    category: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'date_desc',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.paymentMethod !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sortBy !== 'date_desc') count++;
    return count;
  }, [filters]);

  // Apply filtering and sorting
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((t) => {
        // Search text
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const match =
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.paymentMethod.toLowerCase().includes(q) ||
            (t.notes && t.notes.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Type
        if (filters.type !== 'all' && t.type !== filters.type) {
          return false;
        }

        // Category
        if (filters.category !== 'all' && t.category !== filters.category) {
          return false;
        }

        // Payment Method
        if (filters.paymentMethod !== 'all' && t.paymentMethod !== filters.paymentMethod) {
          return false;
        }

        // Date range
        if (filters.dateRange !== 'all') {
          const tDate = new Date(t.date + 'T00:00:00');
          if (filters.dateRange === '7d') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            if (tDate < sevenDaysAgo) return false;
          } else if (filters.dateRange === '30d') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            if (tDate < thirtyDaysAgo) return false;
          } else if (filters.dateRange === 'this_month') {
            if (tDate.getFullYear() !== currentYear || tDate.getMonth() !== currentMonth) {
              return false;
            }
          } else if (filters.dateRange === 'this_year') {
            if (tDate.getFullYear() !== currentYear) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (filters.sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (filters.sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (filters.sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, filters]);

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['ID', 'Type', 'Amount', 'Description', 'Category', 'Date', 'PaymentMethod', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.date}"`,
      `"${t.paymentMethod}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredTransactions.length} transactions to CSV`, 'success');
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsAddTxModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Transactions Ledger
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Complete transaction record with live search, filters, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
            title="Download CSV file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingTx(null);
              setIsAddTxModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Transactions Data Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onClearFilters={activeFilterCount > 0 ? handleResetFilters : undefined}
      />
    </div>
  );
};
