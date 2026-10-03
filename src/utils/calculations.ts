import { Transaction, CategoryItem, Budget } from '../types/finance';

export interface FinancialTotals {
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  savings: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
}

export function calculateFinancialTotals(transactions: Transaction[]): FinancialTotals {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeCount++;
    } else {
      totalExpenses += tx.amount;
      expenseCount++;
    }
  }

  const totalBalance = totalIncome - totalExpenses;
  const savings = totalBalance;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, (savings / totalIncome) * 100)) : 0;

  return {
    totalIncome,
    totalExpenses,
    totalBalance,
    savings,
    savingsRate,
    incomeCount,
    expenseCount,
  };
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}

export function calculateCategoryExpenses(
  transactions: Transaction[],
  categories: CategoryItem[]
): CategorySpending[] {
  const expenseMap = new Map<string, { amount: number; count: number }>();
  let totalExpense = 0;

  // Filter to expenses only
  const expenses = transactions.filter((t) => t.type === 'expense');
  for (const t of expenses) {
    totalExpense += t.amount;
    const current = expenseMap.get(t.category) || { amount: 0, count: 0 };
    expenseMap.set(t.category, {
      amount: current.amount + t.amount,
      count: current.count + 1,
    });
  }

  const results: CategorySpending[] = [];
  const categoryLookup = new Map<string, CategoryItem>();
  categories.forEach((c) => {
    categoryLookup.set(c.name.toLowerCase(), c);
  });

  expenseMap.forEach((val, catName) => {
    const matchedCategory = categoryLookup.get(catName.toLowerCase());
    const color = matchedCategory?.color || '#94A3B8';
    const icon = matchedCategory?.icon || 'Tag';
    const categoryId = matchedCategory?.id || `cat-${catName.toLowerCase().replace(/\s+/g, '-')}`;

    results.push({
      categoryId,
      categoryName: catName,
      amount: val.amount,
      percentage: totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0,
      color,
      icon,
      count: val.count,
    });
  });

  // Sort descending by amount
  results.sort((a, b) => b.amount - a.amount);
  return results;
}

export interface SpendingDataPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export function calculateSpendingTrends(
  transactions: Transaction[],
  range: '7d' | 'this_month' | '3m' | 'this_year'
): SpendingDataPoint[] {
  const now = new Date();

  if (range === '7d') {
    // 7 distinct days leading up to today
    const points: SpendingDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        if (t.date === dateStr) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      }
      points.push({ label, income, expense, net: income - expense });
    }
    return points;
  }

  if (range === 'this_month') {
    // Current month grouped into 4 weeks
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: { start: number; end: number; label: string }[] = [
      { start: 1, end: 7, label: 'Week 1' },
      { start: 8, end: 14, label: 'Week 2' },
      { start: 15, end: 21, label: 'Week 3' },
      { start: 22, end: daysInMonth, label: 'Week 4+' },
    ];

    return weeks.map((w) => {
      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const tDate = new Date(t.date + 'T00:00:00');
        if (tDate.getFullYear() === year && tDate.getMonth() === month) {
          const day = tDate.getDate();
          if (day >= w.start && day <= w.end) {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
          }
        }
      }
      return { label: w.label, income, expense, net: income - expense };
    });
  }

  if (range === '3m') {
    // Past 3 months
    const points: SpendingDataPoint[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const tDate = new Date(t.date + 'T00:00:00');
        if (tDate.getFullYear() === y && tDate.getMonth() === m) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      }
      points.push({ label, income, expense, net: income - expense });
    }
    return points;
  }

  // this_year: all 12 months of current year
  const year = now.getFullYear();
  const months: SpendingDataPoint[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });

    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      const tDate = new Date(t.date + 'T00:00:00');
      if (tDate.getFullYear() === year && tDate.getMonth() === m) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    }
    months.push({ label, income, expense, net: income - expense });
  }
  return months;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
  categoryColor: string;
  categoryIcon: string;
}

export function calculateBudgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
  categories: CategoryItem[]
): BudgetStatus[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Find all expenses in current month
  const currentMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const catSpendingMap = new Map<string, number>();
  for (const t of currentMonthExpenses) {
    const prev = catSpendingMap.get(t.category.toLowerCase()) || 0;
    catSpendingMap.set(t.category.toLowerCase(), prev + t.amount);
  }

  const categoryLookup = new Map<string, CategoryItem>();
  categories.forEach((c) => {
    categoryLookup.set(c.name.toLowerCase(), c);
  });

  return budgets.map((b) => {
    const spent = catSpendingMap.get(b.category.toLowerCase()) || 0;
    const remaining = Math.max(0, b.amount - spent);
    const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    let status: 'safe' | 'warning' | 'exceeded' = 'safe';
    if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    const catObj = categoryLookup.get(b.category.toLowerCase());

    return {
      budget: b,
      spent,
      remaining,
      percentage,
      status,
      categoryColor: catObj?.color || '#3B82F6',
      categoryIcon: catObj?.icon || 'Tag',
    };
  });
}
