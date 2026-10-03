import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';
import { Budget } from '../../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  editingBudget,
}) => {
  const { categories, budgets, addBudget, updateBudget, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Expense categories
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  // Categories already budgeted (exclude editing one)
  const budgetedCategories = new Set(
    budgets
      .filter((b) => !editingBudget || b.id !== editingBudget.id)
      .map((b) => b.category.toLowerCase())
  );

  const availableCategories = expenseCategories.filter(
    (c) => !budgetedCategories.has(c.name.toLowerCase())
  );

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setAmount(editingBudget.amount.toString());
      setError('');
    } else {
      setCategory(availableCategories[0]?.name || '');
      setAmount('');
      setError('');
    }
  }, [editingBudget, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);

    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid monthly budget limit greater than 0');
      return;
    }

    if (!category) {
      setError('Please select a category for this budget');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, parsed);
    } else {
      addBudget({
        category,
        amount: parsed,
        period: 'monthly',
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBudget ? 'Edit Monthly Budget' : 'Set Category Budget'}
      subtitle="Define your monthly spending limit to prevent overspending"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Category
          </label>
          {editingBudget ? (
            <div className="px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {editingBudget.category}
            </div>
          ) : (
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-8 cursor-pointer"
              >
                {availableCategories.length === 0 ? (
                  <option value="">All expense categories already have budgets</option>
                ) : (
                  availableCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Monthly Budget Cap ({CURRENCY_SYMBOLS[settings.currency]})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-base">
              {CURRENCY_SYMBOLS[settings.currency]}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 5000"
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono text-base font-bold placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all"
            />
          </div>
          {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 pt-1">
          {[3000, 5000, 10000, 20000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              className="flex-1 py-1 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              {CURRENCY_SYMBOLS[settings.currency]}{preset.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!category}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 ${accent.primary}`}
          >
            {editingBudget ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
