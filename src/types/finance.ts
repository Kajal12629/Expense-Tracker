export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
  createdAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'emerald' | 'indigo' | 'violet' | 'amber' | 'rose' | 'cyan';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface AppSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  currency: CurrencyCode;
  userName: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
