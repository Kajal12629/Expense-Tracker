import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useFinance, ACCENT_COLOR_MAP } from '../../context/FinanceContext';
import { AVAILABLE_ICONS, AVAILABLE_COLORS, CategoryIcon } from '../common/CategoryIcon';
import { CategoryItem } from '../../types/finance';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: CategoryItem | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
}) => {
  const { addCategory, updateCategory, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'both'>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10B981');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setType(editingCategory.type);
      setIcon(editingCategory.icon);
      setColor(editingCategory.color);
      setError('');
    } else {
      setName('');
      setType('expense');
      setIcon('Tag');
      setColor('#10B981');
      setError('');
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        icon,
        color,
      });
    } else {
      addCategory({
        name: name.trim(),
        type,
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
      title={editingCategory ? 'Edit Category' : 'Create Custom Category'}
      subtitle="Organize your expenses and income into personalized buckets"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Subscriptions, Freelance, Gym..."
            autoFocus
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all"
          />
          {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        </div>

        {/* Type selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Applies To
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {(['expense', 'income', 'both'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Icon & Color */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-36 overflow-y-auto custom-scrollbar">
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
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Select Color
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
            {editingCategory ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
