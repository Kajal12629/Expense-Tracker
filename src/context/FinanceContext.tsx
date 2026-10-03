import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  CategoryItem,
  Budget,
  SavingsGoal,
  AppSettings,
  ToastMessage,
  ThemeMode,
  AccentColor,
  CurrencyCode,
} from '../types/finance';
import {
  loadTransactions,
  saveTransactions,
  loadCategories,
  saveCategories,
  loadBudgets,
  saveBudgets,
  loadSavingsGoals,
  saveSavingsGoals,
  loadSettings,
  saveSettings,
  exportAllData,
  importAllData,
  resetToDemoData,
  clearAllFinancialData,
} from '../utils/storage';
import { calculateFinancialTotals, FinancialTotals } from '../utils/calculations';

export type NavigationTab = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'categories' | 'settings';

interface FinanceContextType {
  // State
  transactions: Transaction[];
  categories: CategoryItem[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: AppSettings;
  totals: FinancialTotals;
  toasts: ToastMessage[];
  activeTab: NavigationTab;
  searchQuery: string;
  isCommandPaletteOpen: boolean;
  isAddTxModalOpen: boolean;
  editingTx: Transaction | null;

  // Setters
  setActiveTab: (tab: NavigationTab) => void;
  setSearchQuery: (query: string) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsAddTxModalOpen: (open: boolean) => void;
  setEditingTx: (tx: Transaction | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Categories
  addCategory: (cat: Omit<CategoryItem, 'id' | 'isCustom'>) => void;
  updateCategory: (id: string, cat: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, amount: number) => void;
  deleteBudget: (id: string) => void;

  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'> & { initialDeposit?: number }) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
  setCurrency: (currency: CurrencyCode) => void;

  // Data management
  resetDemo: () => void;
  clearAll: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const ACCENT_COLOR_MAP: Record<AccentColor, { primary: string; hover: string; lightBg: string; text: string; ring: string }> = {
  emerald: {
    primary: 'bg-emerald-600 dark:bg-emerald-500',
    hover: 'hover:bg-emerald-700 dark:hover:bg-emerald-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/30',
  },
  indigo: {
    primary: 'bg-indigo-600 dark:bg-indigo-500',
    hover: 'hover:bg-indigo-700 dark:hover:bg-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/30',
  },
  violet: {
    primary: 'bg-violet-600 dark:bg-violet-500',
    hover: 'hover:bg-violet-700 dark:hover:bg-violet-600',
    lightBg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/30',
  },
  amber: {
    primary: 'bg-amber-600 dark:bg-amber-500',
    hover: 'hover:bg-amber-700 dark:hover:bg-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/30',
  },
  rose: {
    primary: 'bg-rose-600 dark:bg-rose-500',
    hover: 'hover:bg-rose-700 dark:hover:bg-rose-600',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/30',
  },
  cyan: {
    primary: 'bg-cyan-600 dark:bg-cyan-500',
    hover: 'hover:bg-cyan-700 dark:hover:bg-cyan-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-500/30',
  },
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [categories, setCategories] = useState<CategoryItem[]>(loadCategories);
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadSavingsGoals);
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Sync theme changes with DOM documentElement
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();
    const listener = () => {
      if (settings.theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.theme]);

  // Sync data to localStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveSavingsGoals(savingsGoals);
  }, [savingsGoals]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Derived financial totals
  const totals = useMemo(() => calculateFinancialTotals(transactions), [transactions]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`${tx.type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Transaction updated successfully!', 'success');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted', 'info');
  };

  // Category Actions
  const addCategory = (cat: Omit<CategoryItem, 'id' | 'isCustom'>) => {
    const newCat: CategoryItem = {
      ...cat,
      id: `cat-${Date.now()}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${cat.name}" created!`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Category updated!', 'success');
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast(`Category "${cat?.name || ''}" removed`, 'info');
  };

  // Budget Actions
  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...b,
      id: `budget-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newBudget]);
    showToast(`Budget for ${b.category} set!`, 'success');
  };

  const updateBudget = (id: string, amount: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, amount } : b))
    );
    showToast('Budget amount updated!', 'success');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Budget removed', 'info');
  };

  // Savings Goal Actions
  const addSavingsGoal = (
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'> & { initialDeposit?: number }
  ) => {
    const deposit = goal.initialDeposit || 0;
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: deposit,
      deadline: goal.deadline,
      color: goal.color,
      icon: goal.icon,
      createdAt: Date.now(),
    };
    setSavingsGoals((prev) => [newGoal, ...prev]);
    showToast(`Savings goal "${goal.title}" created!`, 'success');

    if (deposit >= goal.targetAmount && goal.targetAmount > 0) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    showToast('Savings goal updated!', 'success');
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Savings goal deleted', 'info');
  };

  const contributeToGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newAmount = g.currentAmount + amount;
          if (newAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            showToast(`🎉 Congratulations! You reached your goal for "${g.title}"!`, 'success');
          } else {
            showToast(`Added funds to "${g.title}"!`, 'success');
          }
          return { ...g, currentAmount: newAmount };
        }
        return g;
      })
    );
  };

  const withdrawFromGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newAmount = Math.max(0, g.currentAmount - amount);
          showToast(`Withdrew funds from "${g.title}"`, 'info');
          return { ...g, currentAmount: newAmount };
        }
        return g;
      })
    );
  };

  // Settings Actions
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
    showToast('Settings saved successfully', 'success');
  };

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const setAccentColor = (accentColor: AccentColor) => {
    updateSettings({ accentColor });
  };

  const setCurrency = (currency: CurrencyCode) => {
    updateSettings({ currency });
  };

  // Data management
  const resetDemo = () => {
    resetToDemoData();
    setTransactions(loadTransactions());
    setCategories(loadCategories());
    setBudgets(loadBudgets());
    setSavingsGoals(loadSavingsGoals());
    setSettingsState(loadSettings());
    showToast('Reset to demo dataset successfully', 'success');
  };

  const clearAll = () => {
    clearAllFinancialData();
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    showToast('All transaction & budget data cleared', 'info');
  };

  const exportData = () => {
    return exportAllData();
  };

  const importData = (jsonStr: string) => {
    const success = importAllData(jsonStr);
    if (success) {
      setTransactions(loadTransactions());
      setCategories(loadCategories());
      setBudgets(loadBudgets());
      setSavingsGoals(loadSavingsGoals());
      setSettingsState(loadSettings());
      showToast('Data imported successfully!', 'success');
      return true;
    } else {
      showToast('Invalid backup file. Could not import.', 'error');
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        savingsGoals,
        settings,
        totals,
        toasts,
        activeTab,
        searchQuery,
        isCommandPaletteOpen,
        isAddTxModalOpen,
        editingTx,
        setActiveTab,
        setSearchQuery,
        setIsCommandPaletteOpen,
        setIsAddTxModalOpen,
        setEditingTx,
        showToast,
        dismissToast,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        updateSettings,
        setTheme,
        setAccentColor,
        setCurrency,
        resetDemo,
        clearAll,
        exportData,
        importData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
