import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tags, Shield } from 'lucide-react';
import { useFinance, ACCENT_COLOR_MAP } from '../context/FinanceContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { CategoryModal } from '../components/categories/CategoryModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CategoryItem } from '../types/finance';

export const CategoriesPage: React.FC = () => {
  const { categories, transactions, deleteCategory, settings } = useFinance();
  const accent = ACCENT_COLOR_MAP[settings.accentColor];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Count transactions per category
  const txCountMap = new Map<string, number>();
  transactions.forEach((t) => {
    const k = t.category.toLowerCase();
    txCountMap.set(k, (txCountMap.get(k) || 0) + 1);
  });

  const handleEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Categories Directory
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Manage spending and income categories with custom colors and icons.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-95 active:scale-95 ${accent.primary}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = txCountMap.get(cat.name.toLowerCase()) || 0;

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl glass-card shadow-sm flex items-center justify-between group relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 capitalize">
                    <span>{cat.type}</span>
                    <span>·</span>
                    <span>{count} {count === 1 ? 'transaction' : 'transactions'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {cat.isCustom && (
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete custom category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {!cat.isCustom && (
                  <div className="p-1.5 text-neutral-300 dark:text-neutral-600" title="Core category">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) deleteCategory(categoryToDelete.id);
        }}
        title="Delete Custom Category?"
        message={`Are you sure you want to remove the category "${categoryToDelete?.name}"? Existing transactions with this category will remain recorded in your ledger.`}
        confirmText="Remove Category"
      />
    </div>
  );
};
