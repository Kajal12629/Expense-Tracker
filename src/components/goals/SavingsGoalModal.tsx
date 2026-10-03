import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { AVAILABLE_ICONS, AVAILABLE_COLORS, CategoryIcon } from '../common/CategoryIcon';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';
import { SavingsGoal } from '../../types/finance';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal: SavingsGoal | null;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  editingGoal,
}) => {
  const { addSavingsGoal, updateSavingsGoal, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState('#3B82F6');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmount(editingGoal.targetAmount.toString());
      setInitialDeposit('');
      setDeadline(editingGoal.deadline || '');
      setIcon(editingGoal.icon);
      setColor(editingGoal.color);
      setErrors({});
    } else {
      setTitle('');
      setTargetAmount('');
      setInitialDeposit('');
      setDeadline('');
      setIcon('Target');
      setColor('#3B82F6');
      setErrors({});
    }
  }, [editingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter a goal title';
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    const deposit = initialDeposit ? parseFloat(initialDeposit) : 0;
    if (deposit < 0) {
      newErrors.initialDeposit = 'Deposit cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: target,
        deadline: deadline || undefined,
        icon,
        color,
      });
    } else {
      addSavingsGoal({
        title: title.trim(),
        targetAmount: target,
        initialDeposit: deposit,
        deadline: deadline || undefined,
        icon,
        color,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle="Set target amounts and track progress toward purchases or funds"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Goal Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. New Laptop, Vacation Fund, Emergency Savings..."
            autoFocus
            className={`w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border ${
              errors.title
                ? 'border-rose-500'
                : 'border-neutral-200 dark:border-neutral-700'
            } rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all`}
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>}
        </div>

        {/* Target Amount & Initial Deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Target Amount ({CURRENCY_SYMBOLS[settings.currency]})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-sm">
                {CURRENCY_SYMBOLS[settings.currency]}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value);
                  if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: '' }));
                }}
                placeholder="70000"
                className={`w-full pl-8 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border ${
                  errors.targetAmount
                    ? 'border-rose-500'
                    : 'border-neutral-200 dark:border-neutral-700'
                } rounded-xl text-sm font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all`}
              />
            </div>
            {errors.targetAmount && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.targetAmount}</p>
            )}
          </div>

          {!editingGoal && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Initial Saved ({CURRENCY_SYMBOLS[settings.currency]})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-sm">
                  {CURRENCY_SYMBOLS[settings.currency]}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all"
                />
              </div>
            </div>
          )}

          {editingGoal && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
              />
            </div>
          )}
        </div>

        {!editingGoal && (
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
            />
          </div>
        )}

        {/* Icon & Color Pickers */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-36 overflow-y-auto custom-scrollbar">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setIcon(ic.name)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    icon === ic.name
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 scale-105 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                  title={ic.label}
                >
                  <CategoryIcon name={ic.name} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Select Accent Theme
            </label>
            <div className="flex flex-wrap gap-2.5 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c.hex
                      ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
          >
            {editingGoal ? 'Save Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
