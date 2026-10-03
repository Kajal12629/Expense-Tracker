import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../../types/finance';
import { CategoryIcon } from '../common/CategoryIcon';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';

export const TransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    editingTx,
    setEditingTx,
    categories,
    addTransaction,
    updateTransaction,
    settings,
  } = useFinance();

  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories by selected transaction type
  const availableCategories = categories.filter(
    (c) => c.type === 'both' || c.type === type
  );

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setAmount(editingTx.amount.toString());
      setDescription(editingTx.description);
      setCategory(editingTx.category);
      setDate(editingTx.date);
      setPaymentMethod(editingTx.paymentMethod);
      setNotes(editingTx.notes || '');
      setErrors({});
    } else {
      // Default new transaction values
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
      setErrors({});
      // Select first category default
      const defaultCat = categories.find((c) => c.type === 'expense' || c.type === 'both');
      if (defaultCat) setCategory(defaultCat.name);
    }
  }, [editingTx, isAddTxModalOpen, categories]);

  // Keep category in sync if switching type and category no longer matches
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCats = categories.filter((c) => c.type === 'both' || c.type === newType);
    if (!validCats.some((c) => c.name === category)) {
      setCategory(validCats[0]?.name || '');
    }
  };

  const handleClose = () => {
    setIsAddTxModalOpen(false);
    setEditingTx(null);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Description cannot be empty';
    }

    if (!category) {
      newErrors.category = 'Please choose a category';
    }

    if (!date) {
      newErrors.date = 'Please pick a valid date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingTx) {
      updateTransaction(editingTx.id, {
        type,
        amount: parsedAmount,
        description: description.trim(),
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        type,
        amount: parsedAmount,
        description: description.trim(),
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }

    handleClose();
  };

  const paymentMethods: PaymentMethod[] = ['UPI', 'Card', 'Cash', 'Bank Transfer', 'Other'];

  return (
    <Modal
      isOpen={isAddTxModalOpen}
      onClose={handleClose}
      title={editingTx ? 'Edit Transaction' : 'Record New Transaction'}
      subtitle={
        editingTx
          ? 'Modify details and update financial reports instantly'
          : 'Log income or an expense into your ledger'
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Income vs Expense */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Amount ({CURRENCY_SYMBOLS[settings.currency]})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-base">
              {CURRENCY_SYMBOLS[settings.currency]}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              placeholder="0.00"
              className={`w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border ${
                errors.amount
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-neutral-900 dark:focus:ring-neutral-400'
              } rounded-xl text-neutral-900 dark:text-white font-mono text-base font-bold placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all`}
              autoFocus={!editingTx}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="e.g. Grocery store, Client invoice, Electricity..."
            className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border ${
              errors.description
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-neutral-200 dark:border-neutral-700 focus:ring-neutral-900 dark:focus:ring-neutral-400'
            } rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all`}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                }}
                className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border ${
                  errors.category
                    ? 'border-rose-500'
                    : 'border-neutral-200 dark:border-neutral-700'
                } rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-8 cursor-pointer`}
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                <span className="text-[10px]">▼</span>
              </div>
            </div>
            {errors.category && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all appearance-none pr-8 cursor-pointer"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
            }}
            className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border ${
              errors.date
                ? 'border-rose-500'
                : 'border-neutral-200 dark:border-neutral-700'
            } rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer`}
          />
          {errors.date && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date}</p>
          )}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Optional Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add invoice reference, location, or tag..."
            className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
          >
            {editingTx ? 'Save Changes' : 'Confirm Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
