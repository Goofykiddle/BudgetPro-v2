import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatDateLocal, parseDateLocal } from '../lib/utils';

export type TransactionType = 'fixed_income' | 'variable_income' | 'fixed_expense' | 'variable_expense' | 'savings_deposit';
export type Frequency = 'monthly' | 'bi_monthly' | 'quarterly' | 'semi_annually' | 'annually';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  category?: string;
  desc?: string;
  isRecurring?: boolean;
  frequency?: Frequency;
  alert?: boolean;
  goalId?: string; // Reference to a savings goal
  cycleDate?: string; // Month/Year identifier for auto-generated transactions
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  color: string;
  container: string;
  onContainer: string;
  note?: string;
  startDate?: string;
  durationMonths?: number;
  depositDay?: number;
  monthlyAmount?: number;
}

export const PASTEL_COLORS = [
  { name: 'כחול', color: 'bg-blue-400', container: 'bg-blue-50', onContainer: 'text-blue-900' },
  { name: 'ירוק', color: 'bg-emerald-400', container: 'bg-emerald-50', onContainer: 'text-emerald-900' },
  { name: 'אדום', color: 'bg-rose-400', container: 'bg-rose-50', onContainer: 'text-rose-900' },
  { name: 'סגול', color: 'bg-purple-400', container: 'bg-purple-50', onContainer: 'text-purple-900' },
  { name: 'ורוד', color: 'bg-pink-400', container: 'bg-pink-50', onContainer: 'text-pink-900' },
  { name: 'כתום', color: 'bg-orange-400', container: 'bg-orange-50', onContainer: 'text-orange-900' },
  { name: 'צהוב', color: 'bg-amber-400', container: 'bg-amber-50', onContainer: 'text-amber-900' },
  { name: 'תכלת', color: 'bg-cyan-400', container: 'bg-cyan-50', onContainer: 'text-cyan-900' },
  { name: 'אינדיגו', color: 'bg-indigo-400', container: 'bg-indigo-50', onContainer: 'text-indigo-900' },
  { name: 'ליים', color: 'bg-lime-400', container: 'bg-lime-50', onContainer: 'text-lime-900' },
];

interface BudgetSettings {
  userName: string;
  cycleStartDay: number;
  startMonth: number;
  startYear: number;
  autoRecalculate: boolean;
  profileImage: string;
  scriptUrl?: string;
  secretKey?: string;
}

export interface AccountBalance {
  id: string;
  name: string;
  amount: number;
  type: 'checking' | 'savings' | 'pension' | 'other';
  lastUpdated: string;
}

interface BudgetContextType {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  accountBalances: AccountBalance[];
  totalBalance: number;
  settings: BudgetSettings;
  categories: string[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addAccountBalance: (balance: Omit<AccountBalance, 'id'>) => void;
  updateAccountBalance: (id: string, updates: Partial<AccountBalance>) => void;
  deleteAccountBalance: (id: string) => void;
  updateSettings: (updates: Partial<BudgetSettings>) => void;
  addCategory: (category: string) => void;
  getFilteredTransactions: (filterType: string, date?: Date) => Transaction[];
  getCurrentCycleDates: () => { start: Date; end: Date };
  getCycleDates: (date?: Date) => { start: Date; end: Date };
  logout: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', name: 'משכורת 1', amount: 12500, type: 'fixed_income', date: '2026-03-01', desc: 'העברה בנקאית', isRecurring: true },
    { id: '2', name: 'משכורת 2', amount: 4200, type: 'fixed_income', date: '2026-03-05', desc: 'הפקדה חודשית', isRecurring: true },
    { id: '3', name: 'שכר דירה', amount: 5200, type: 'fixed_expense', date: '2026-03-01', desc: 'העברה בנקאית', isRecurring: true },
    { id: '4', name: 'חשבון מים', amount: 245.80, type: 'fixed_expense', date: '2026-03-15', desc: 'מקורות', isRecurring: true },
    { id: '5', name: 'סופר-מרקט', amount: 842.15, type: 'variable_expense', date: '2026-03-20', desc: 'שופרסל', isRecurring: false },
    { id: '6', name: 'חשמל', amount: 412.00, type: 'fixed_expense', date: '2026-03-21', desc: 'חברת החשמל', alert: true, isRecurring: true },
    { id: '7', name: 'נטפליקס', amount: 54.90, type: 'fixed_expense', date: '2026-03-10', desc: 'מנוי חודשי', isRecurring: true },
  ]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { 
      id: '1', 
      name: 'טיול לחו״ל', 
      target: 15000, 
      current: 9750, 
      icon: 'flight_takeoff', 
      color: 'bg-blue-400', 
      container: 'bg-blue-50', 
      onContainer: 'text-blue-900', 
      note: 'חיסכון לטיול בקיץ',
      startDate: '2026-03-01',
      durationMonths: 12,
      depositDay: 10,
      monthlyAmount: 1250
    },
    { 
      id: '2', 
      name: 'חיסכון לילדים', 
      target: 100000, 
      current: 42000, 
      icon: 'family_restroom', 
      color: 'bg-purple-400', 
      container: 'bg-purple-50', 
      onContainer: 'text-purple-900',
      startDate: '2026-01-01',
      durationMonths: 120,
      depositDay: 1,
      monthlyAmount: 833
    },
    { 
      id: '3', 
      name: 'קופת גמל', 
      target: 250000, 
      current: 205000, 
      icon: 'account_balance_wallet', 
      color: 'bg-orange-400', 
      container: 'bg-orange-50', 
      onContainer: 'text-orange-900',
      startDate: '2025-01-01',
      durationMonths: 180,
      depositDay: 1,
      monthlyAmount: 1388
    },
  ]);

  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([
    { id: '1', name: 'חשבון עו״ש עיקרי', amount: 12450, type: 'checking', lastUpdated: new Date().toISOString() },
    { id: '2', name: 'קופת גמל להשקעה', amount: 45000, type: 'savings', lastUpdated: new Date().toISOString() },
  ]);

  const [settings, setSettings] = useState<BudgetSettings>(() => {
    const saved = localStorage.getItem('budget_settings');
    if (saved) return JSON.parse(saved);
    return {
      userName: 'יונתן',
      cycleStartDay: 1,
      startMonth: 3,
      startYear: 2026,
      autoRecalculate: true,
      profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8tz1rrtsBZ2k9ahQ2gh5R7J9VY1PCZwgQw-WPcE9dbFnPneV3zSgVGp9svoETdhHPP44ajJ2uTs1aQaH3RWmA6TK-ByEWnrlbmi6am1TaFnnwakExMp95akuzKjlavEQkTWWesTNyR8OwEK3GjJ3U9b3IofMqtGYkFtviWx6G34ZOeG5np-vl1kNcCr4QykXSoIakaC1nIJeAsy_jxpTUywU6iQMDzJcGKVy8_SopP-gAQHotii8iMcbjCRyIUbnh9UMBxtYtwwo',
    };
  });

  useEffect(() => {
    localStorage.setItem('budget_settings', JSON.stringify(settings));
  }, [settings]);

  const [categories, setCategories] = useState<string[]>(['מזון', 'פנאי', 'תחבורה', 'בריאות', 'קניות', 'מגורים', 'אחר']);

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    // If it's an auto-savings transaction, we "materialize" it by adding it to the real transactions
    if (id.startsWith('auto-savings-')) {
      // Find the virtual transaction to get its base data
      // We parse the ID to get the goalId and cycleDate to be more robust
      const parts = id.split('-');
      const cycleDate = parts[parts.length - 1];
      const goalId = parts.slice(2, -1).join('-');
      
      const goal = savingsGoals.find(g => g.id === goalId);
      if (goal) {
        const depositDate = new Date(cycleDate);
        depositDate.setDate(goal.depositDay || 1);

        addTransaction({
          name: `הפקדה: ${goal.name}`,
          amount: goal.monthlyAmount || 0,
          type: 'savings_deposit',
          date: formatDateLocal(depositDate),
          category: 'savings',
          ...updates,
          goalId: goal.id,
          cycleDate: cycleDate
        });
      }
      return;
    }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    // If it's an auto-savings transaction, we "materialize" it with 0 amount to effectively hide it
    if (id.startsWith('auto-savings-')) {
      const parts = id.split('-');
      const cycleDate = parts[parts.length - 1];
      const goalId = parts.slice(2, -1).join('-');
      
      const goal = savingsGoals.find(g => g.id === goalId);
      if (goal) {
        const depositDate = new Date(cycleDate);
        depositDate.setDate(goal.depositDay || 1);

        addTransaction({
          name: `הפקדה: ${goal.name}`,
          amount: 0, // Tombstone
          type: 'savings_deposit',
          date: formatDateLocal(depositDate),
          category: 'savings',
          goalId: goal.id,
          cycleDate: cycleDate
        });
      }
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9) };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const addAccountBalance = (balance: Omit<AccountBalance, 'id'>) => {
    const newBalance = { ...balance, id: Math.random().toString(36).substr(2, 9) };
    setAccountBalances(prev => [...prev, newBalance]);
  };

  const updateAccountBalance = (id: string, updates: Partial<AccountBalance>) => {
    setAccountBalances(prev => prev.map(b => b.id === id ? { ...b, ...updates, lastUpdated: new Date().toISOString() } : b));
  };

  const deleteAccountBalance = (id: string) => {
    setAccountBalances(prev => prev.filter(b => b.id !== id));
  };

  const updateSettings = (updates: Partial<BudgetSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const logout = () => {
    setSettings(prev => {
      const { scriptUrl, secretKey, ...rest } = prev;
      return rest as BudgetSettings;
    });
    localStorage.removeItem('budget_settings');
    // Clear other data if needed
  };

  const getCycleDates = (date: Date = new Date()) => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    
    let cycleStart = new Date(currentYear, currentMonth, settings.cycleStartDay);
    if (date < cycleStart) {
      cycleStart.setMonth(cycleStart.getMonth() - 1);
    }
    
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    
    return { start: cycleStart, end: cycleEnd };
  };

  const getCurrentCycleDates = () => getCycleDates(new Date());

  const getFilteredTransactions = (filterType: string, date: Date = new Date()) => {
    const { start, end } = getCycleDates(date);

    // Base transactions
    let baseFiltered = transactions.filter(t => {
      const tDate = parseDateLocal(t.date);
      // Filter out 0-amount savings overrides (tombstones for deleted auto-savings)
      if (t.type === 'savings_deposit' && t.amount === 0 && t.goalId) return false;
      return tDate >= start && tDate < end;
    });

    // Add automatic savings deposits from goals
    const autoSavings: Transaction[] = [];
    savingsGoals.forEach(goal => {
      if (goal.startDate && goal.monthlyAmount && goal.depositDay) {
        const goalStart = new Date(goal.startDate);
        const cycleMonthStart = new Date(start);
        const cycleDateKey = cycleMonthStart.toISOString();
        
        // Check if a real transaction already exists for this goal and cycle
        const exists = transactions.some(t => t.goalId === goal.id && t.cycleDate === cycleDateKey);
        if (exists) return;

        // Calculate months difference
        const monthsDiff = (cycleMonthStart.getFullYear() - goalStart.getFullYear()) * 12 + (cycleMonthStart.getMonth() - goalStart.getMonth());
        
        if (monthsDiff >= 0 && (!goal.durationMonths || monthsDiff < goal.durationMonths)) {
          // Create a transaction for this goal in the current cycle
          const depositDate = new Date(cycleMonthStart.getFullYear(), cycleMonthStart.getMonth(), goal.depositDay);
          
          // Ensure the deposit date is within the cycle
          if (depositDate >= start && depositDate < end) {
            autoSavings.push({
              id: `auto-savings-${goal.id}-${cycleDateKey}`,
              name: `הפקדה: ${goal.name}`,
              amount: goal.monthlyAmount,
              type: 'savings_deposit',
              date: formatDateLocal(depositDate),
              isRecurring: true,
              desc: 'הפקדה אוטומטית לחיסכון',
              goalId: goal.id,
              cycleDate: cycleDateKey
            });
          }
        }
      }
    });

    let allTransactions = [...baseFiltered, ...autoSavings];

    if (filterType === 'income') {
      allTransactions = allTransactions.filter(t => t.type === 'fixed_income' || t.type === 'variable_income');
    } else if (filterType === 'expense') {
      allTransactions = allTransactions.filter(t => t.type === 'fixed_expense' || t.type === 'variable_expense');
    } else if (filterType === 'fixed') {
      allTransactions = allTransactions.filter(t => t.type === 'fixed_income' || t.type === 'fixed_expense');
    } else if (filterType === 'variable') {
      allTransactions = allTransactions.filter(t => t.type === 'variable_income' || t.type === 'variable_expense');
    } else if (filterType === 'savings') {
      allTransactions = allTransactions.filter(t => t.type === 'savings_deposit');
    }

    return allTransactions;
  };

  const totalBalance = accountBalances.reduce((sum, acc) => sum + acc.amount, 0);

  return (
    <BudgetContext.Provider value={{ 
      transactions, 
      savingsGoals,
      accountBalances,
      totalBalance,
      settings, 
      categories,
      addTransaction, 
      updateTransaction, 
      deleteTransaction, 
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addAccountBalance,
      updateAccountBalance,
      deleteAccountBalance,
      updateSettings, 
      addCategory,
      getFilteredTransactions,
      getCurrentCycleDates,
      getCycleDates,
      logout,
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
