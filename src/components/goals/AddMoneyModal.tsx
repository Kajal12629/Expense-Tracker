import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { CURRENCY_SYMBOLS, formatCurrency } from '../../utils/formatters';

interface AddMoneyModalProps {
  goalId: string | null;
  onClose: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ goalId, onClose }) => {
  const { savingsGoals, contributeToGoal, withdrawFromGoal, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const targetGoal = savingsGoals.find((g) => g.id === goalId);

  useEffect(() => {
    setAmount('');
    setError('');
    setMode('deposit');
  }, [goalId]);

  if (!targetGoal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (mode === 'withdraw' && val > targetGoal.currentAmount) {
      setError(`Cannot withdraw more than current savings (${formatCurrency(targetGoal.currentAmount, settings.currency)})`);
      return;
    }

    if (mode === 'deposit') {
      contributeToGoal(targetGoal.id, val);
    } else {
      withdrawFromGoal(targetGoal.id, val);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={!!goalId}
      onClose={onClose}
      title={`${mode === 'deposit' ? 'Contribute to' : 'Withdraw from'} ${targetGoal.title}`}
      subtitle={`Current savings: ${formatCurrency(targetGoal.currentAmount, settings.currency)} of ${formatCurrency(
        targetGoal.targetAmount,
        settings.currency
      )}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Deposit vs Withdraw */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              mode === 'deposit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Deposit (+)
          </button>
          <button
            type="button"
            onClick={() => setMode('withdraw')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              mode === 'withdraw'
                ? 'bg-neutral-800 dark:bg-neutral-700 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Withdraw (-)
          </button>
        </div>

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
                if (error) setError('');
              }}
              placeholder="0.00"
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono text-base font-bold placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all"
            />
          </div>
          {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>

        {/* Quick select amount buttons */}
        <div className="flex items-center gap-2 pt-1">
          {[500, 1000, 5000, 10000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              className="flex-1 py-1.5 text-xs font-mono font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              +{preset}
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
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${
              mode === 'deposit' ? accent.primary : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900'
            }`}
          >
            {mode === 'deposit' ? 'Add to Goal' : 'Withdraw Funds'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
