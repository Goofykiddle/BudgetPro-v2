import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { cn, formatCurrency, parseDateLocal } from '../lib/utils';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { useBudget } from '../context/BudgetContext';

/**
 * Transactions Screen
 * Lists income and expenses with filtering capabilities.
 */
export const Transactions: React.FC = () => {
  const { settings, getFilteredTransactions, getCurrentCycleDates } = useBudget();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filter, setFilter] = useState(initialFilter);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const transactions = getFilteredTransactions(filter).filter(t => 
    !selectedCategory || (t.category === selectedCategory || t.desc === selectedCategory)
  );
  
  // Calculate balance for current cycle (Remaining to spend)
  const currentCycleTransactions = getFilteredTransactions('all');
  
  // Calculate category totals for the current cycle
  const categoryTotals = currentCycleTransactions
    .filter(t => t.type.includes('expense'))
    .reduce((acc: any, t) => {
      const cat = t.category || t.desc || 'אחר';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {});

  const categories = Object.keys(categoryTotals).map(name => ({
    name,
    total: categoryTotals[name]
  })).sort((a, b) => b.total - a.total);

  const totalIncome = currentCycleTransactions.filter(t => t.type.includes('income')).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = currentCycleTransactions.filter(t => t.type.includes('expense')).reduce((acc, t) => acc + t.amount, 0);
  const totalSavings = currentCycleTransactions.filter(t => t.type === 'savings_deposit').reduce((acc, t) => acc + t.amount, 0);
  const remainingToSpend = totalIncome - totalExpense - totalSavings;

  const filters = [
    { id: 'all', label: 'הכל' },
    { id: 'fixed', label: 'קבועות' },
    { id: 'variable', label: 'משתנות' },
    { id: 'income', label: 'הכנסות' },
    { id: 'expense', label: 'הוצאות' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'fixed_income': return 'work';
      case 'variable_income': return 'add_card';
      case 'fixed_expense': return 'home';
      case 'variable_expense': return 'shopping_basket';
      case 'savings_deposit': return 'savings';
      default: return 'payments';
    }
  };

  const getColor = (type: string) => {
    if (type.includes('income')) return 'bg-tertiary-container text-tertiary';
    if (type.includes('expense')) return 'bg-secondary-container text-secondary';
    return 'bg-primary-container text-primary';
  };

  const { start, end } = getCurrentCycleDates();
  const monthName = start.toLocaleString('he-IL', { month: 'long' });
  const year = start.getFullYear();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-10"
    >
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">עסקאות</h1>
          <span className="text-sm text-on-surface-variant font-medium">{monthName} {year}</span>
        </div>

        {/* Balance Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group border border-surface-container-low shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10">
            <p className="text-on-surface-variant font-semibold mb-1">נותר לבזבוז החודש</p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-extrabold text-primary tracking-tighter">
                {formatCurrency(remainingToSpend, false)}
              </h2>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-sm font-bold text-on-surface">
                {formatCurrency(totalIncome, false)} הכנסות
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-sm font-bold text-on-surface">
                {formatCurrency(-totalExpense, true)} הוצאות
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-bold text-on-surface">
                {formatCurrency(-totalSavings, true)} חיסכון
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="px-2">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">פעולות במחזור החודשי</h2>
        </div>

        {/* Category Filter Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-bold text-on-surface-variant">חלוקה לקטגוריות</h3>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-primary text-xs font-bold hover:underline"
              >
                נקה סינון
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
            {categories.map((cat) => (
              <div 
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={cn(
                  "min-w-[140px] p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2",
                  selectedCategory === cat.name 
                    ? "bg-primary text-white border-primary shadow-md scale-105" 
                    : "bg-surface-container-lowest border-surface-container-low text-on-surface hover:border-primary/30"
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase tracking-wider opacity-70", selectedCategory === cat.name && "text-white/80")}>
                  {cat.name}
                </span>
                <span className="text-lg font-black leading-none">
                  {formatCurrency(-cat.total, true)}
                </span>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="w-full text-center py-4 text-on-surface-variant text-sm italic">אין הוצאות מקוטלגות החודש</div>
            )}
          </div>
        </div>

        {/* Filter Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
          {filters.map(f => (
            <button 
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                setSearchParams({ filter: f.id });
              }}
              className={cn(
                "px-6 py-3 rounded-full font-bold whitespace-nowrap active:scale-95 transition-all",
                filter === f.id ? "bg-primary-container text-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {f.label}
            </button>
          ))}
        </nav>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-bold">
              {selectedCategory ? `עסקאות ב-${selectedCategory}` : 'כל התנועות'}
            </h3>
          </div>
          <div className="space-y-3">
            {transactions.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setEditingTransaction(item)}
                className={cn(
                  "bg-surface-container-lowest p-5 rounded-[1.5rem] flex justify-between items-center group hover:bg-white transition-all shadow-sm cursor-pointer",
                  item.alert && "border-r-4 border-primary/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", getColor(item.type))}>
                    <span className="material-symbols-outlined">{getIcon(item.type)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {parseDateLocal(item.date).toLocaleDateString('he-IL')} • {item.desc || (item.type.includes('income') ? 'הכנסה' : 'הוצאה')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className={cn(
                      "font-extrabold text-base leading-none whitespace-nowrap", 
                      item.alert ? "text-secondary" : 
                      item.type.includes('income') ? "text-tertiary" :
                      item.type.includes('expense') ? "text-secondary" :
                      "text-primary"
                    )}>
                      {formatCurrency(item.type.includes('income') ? item.amount : -item.amount, false)}
                    </p>
                    <p className={cn("text-[10px] text-left mt-1", item.alert ? "text-primary font-bold underline" : "text-on-surface-variant")}>
                      {item.alert ? 'נדרש עדכון' : (item.isRecurring ? 'קבוע' : 'משתנה')}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">chevron_left</span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-10 text-on-surface-variant">
                אין פעולות להצגה בטווח התאריכים הנבחר
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-28 left-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-xl hover:bg-primary/90 transition-all active:scale-90 flex items-center justify-center z-[60]"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        mode="one-time"
      />
      <EditTransactionModal 
        isOpen={!!editingTransaction} 
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        mode="one-time"
      />
    </motion.div>
  );
};
