import { Transaction, CategoryItem, Budget, SavingsGoal, AppSettings } from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGETS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_SETTINGS,
  generateSeedTransactions,
} from './initialData';

const KEYS = {
  TRANSACTIONS: 'spendwise_transactions_v1',
  CATEGORIES: 'spendwise_categories_v1',
  BUDGETS: 'spendwise_budgets_v1',
  GOALS: 'spendwise_goals_v1',
  SETTINGS: 'spendwise_settings_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export function loadTransactions(): Transaction[] {
  const existing = safeGet<Transaction[] | null>(KEYS.TRANSACTIONS, null);
  if (!existing || existing.length === 0) {
    const seed = generateSeedTransactions();
    safeSet(KEYS.TRANSACTIONS, seed);
    return seed;
  }
  return existing;
}

export function saveTransactions(txs: Transaction[]): void {
  safeSet(KEYS.TRANSACTIONS, txs);
}

export function loadCategories(): CategoryItem[] {
  const existing = safeGet<CategoryItem[] | null>(KEYS.CATEGORIES, null);
  if (!existing || existing.length === 0) {
    safeSet(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return existing;
}

export function saveCategories(categories: CategoryItem[]): void {
  safeSet(KEYS.CATEGORIES, categories);
}

export function loadBudgets(): Budget[] {
  const existing = safeGet<Budget[] | null>(KEYS.BUDGETS, null);
  if (!existing || existing.length === 0) {
    safeSet(KEYS.BUDGETS, DEFAULT_BUDGETS);
    return DEFAULT_BUDGETS;
  }
  return existing;
}

export function saveBudgets(budgets: Budget[]): void {
  safeSet(KEYS.BUDGETS, budgets);
}

export function loadSavingsGoals(): SavingsGoal[] {
  const existing = safeGet<SavingsGoal[] | null>(KEYS.GOALS, null);
  if (!existing || existing.length === 0) {
    safeSet(KEYS.GOALS, DEFAULT_SAVINGS_GOALS);
    return DEFAULT_SAVINGS_GOALS;
  }
  return existing;
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  safeSet(KEYS.GOALS, goals);
}

export function loadSettings(): AppSettings {
  const existing = safeGet<AppSettings | null>(KEYS.SETTINGS, null);
  if (!existing) {
    safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  const merged = { ...DEFAULT_SETTINGS, ...existing };
  if (merged.userName === 'Rohit') {
    merged.userName = 'Kajal';
    safeSet(KEYS.SETTINGS, merged);
  }
  return merged;
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

export function exportAllData(): string {
  const payload = {
    transactions: loadTransactions(),
    categories: loadCategories(),
    budgets: loadBudgets(),
    goals: loadSavingsGoals(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.transactions)) saveTransactions(data.transactions);
    if (Array.isArray(data.categories)) saveCategories(data.categories);
    if (Array.isArray(data.budgets)) saveBudgets(data.budgets);
    if (Array.isArray(data.goals)) saveSavingsGoals(data.goals);
    if (data.settings && typeof data.settings === 'object') saveSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Failed to import backup data:', err);
    return false;
  }
}

export function resetToDemoData(): void {
  safeSet(KEYS.TRANSACTIONS, generateSeedTransactions());
  safeSet(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  safeSet(KEYS.BUDGETS, DEFAULT_BUDGETS);
  safeSet(KEYS.GOALS, DEFAULT_SAVINGS_GOALS);
  safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function clearAllFinancialData(): void {
  safeSet(KEYS.TRANSACTIONS, []);
  safeSet(KEYS.BUDGETS, []);
  safeSet(KEYS.GOALS, []);
}
