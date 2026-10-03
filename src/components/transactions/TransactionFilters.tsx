import React from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  paymentMethod: string;
  dateRange: 'all' | '7d' | '30d' | 'this_month' | 'this_year';
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFilterCount,
}) => {
  const { categories, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const paymentMethods = ['UPI', 'Card', 'Cash', 'Bank Transfer', 'Other'];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Top Search bar & Type Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search description, category, or payment method..."
            className="w-full pl-9 pr-9 py-2 glass-subtle rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all shadow-inner"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 glass-subtle rounded-xl shrink-0 shadow-inner">
          {(['all', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onFilterChange({ type: t })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filters.type === t
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Filters row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-7 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="relative">
          <select
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange({ paymentMethod: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-7 cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            {paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* Date Range */}
        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as FilterState['dateRange'] })}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-7 cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* Sort Order */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-7 cursor-pointer font-medium"
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: Highest First</option>
            <option value="amount_asc">Amount: Lowest First</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <span className="text-[10px]">▼</span>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators & Reset */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Filter className="w-3.5 h-3.5" />
            <span>{activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}</span>
          </div>
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
