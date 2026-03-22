import React, { useState } from 'react';
import { Modal } from './Modal';
import { cn, formatDateLocal } from '../lib/utils';
import { useBudget, TransactionType, Frequency } from '../context/BudgetContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  mode?: 'one-time' | 'permanent';
}

/**
 * Modal for adding new transactions
 */
export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, initialType, mode = 'one-time' }) => {
  const { addTransaction, categories, addCategory } = useBudget();
  const [type, setType] = useState<TransactionType>(initialType || 'variable_expense');

  React.useEffect(() => {
    if (initialType) {
      setType(initialType);
    }
  }, [initialType, isOpen]);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('אחר');
  const [date, setDate] = useState(formatDateLocal(new Date()));
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const frequencies = [
    { id: 'monthly', label: 'חודשי' },
    { id: 'bi_monthly', label: 'דו-חודשי' },
    { id: 'quarterly', label: 'רבעוני' },
    { id: 'semi_annually', label: 'חצי שנתי' },
    { id: 'annually', label: 'שנתי' },
  ];

  const handleAdd = () => {
    if (!name || !amount) return;
    
    let finalCategory = category;
    if (isAddingCategory && newCategoryName) {
      addCategory(newCategoryName);
      finalCategory = newCategoryName;
    }

    addTransaction({
      name,
      amount: parseFloat(amount),
      type,
      date,
      category: finalCategory,
      desc: finalCategory,
      isRecurring: type === 'fixed_income' || type === 'fixed_expense',
      frequency: (type === 'fixed_income' || type === 'fixed_expense') ? frequency : undefined,
    });
    onClose();
    setName('');
    setAmount('');
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const isRecurring = type === 'fixed_income' || type === 'fixed_expense';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הוספת עסקה חדשה">
      <div className="space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-3">
          {/* Right Column (Income & Savings) */}
          <div className="space-y-3">
            {[
              { id: 'fixed_income', label: 'הכנסה קבועה', icon: 'work', color: 'bg-tertiary-container text-tertiary' },
              { id: 'variable_income', label: 'הכנסה משתנה', icon: 'add_card', color: 'bg-tertiary-container text-tertiary' },
              { id: 'savings_deposit', label: 'הפקדה לחסכון', icon: 'savings', color: 'bg-primary-container text-primary' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id as TransactionType)}
                className={cn(
                  "w-full flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                  type === t.id ? "border-primary bg-primary/5" : "border-surface-container-low hover:border-primary/30"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", t.color)}>
                  <span className="material-symbols-outlined">{t.icon}</span>
                </div>
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Left Column (Expenses) */}
          <div className="space-y-3">
            {[
              { id: 'fixed_expense', label: 'הוצאה קבועה', icon: 'home', color: 'bg-secondary-container text-secondary' },
              { id: 'variable_expense', label: 'הוצאה משתנה', icon: 'shopping_cart', color: 'bg-secondary-container text-secondary' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id as TransactionType)}
                className={cn(
                  "w-full flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                  type === t.id ? "border-primary bg-primary/5" : "border-surface-container-low hover:border-primary/30"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", t.color)}>
                  <span className="material-symbols-outlined">{t.icon}</span>
                </div>
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">שם הפעולה</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20"
              placeholder="לדוג׳: קניות בסופר"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">סכום</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₪</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20"
                placeholder="₪0"
              />
            </div>
          </div>

          {isRecurring && (
            <div className="space-y-1">
              <label className="text-xs font-bold px-1">תדירות</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                {frequencies.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold">קטגוריה</label>
              <button 
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                {isAddingCategory ? 'ביטול' : '+ קטגוריה חדשה'}
              </button>
            </div>
            {isAddingCategory ? (
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20"
                placeholder="שם הקטגוריה החדשה"
                autoFocus
              />
            ) : (
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">תאריך</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <button 
          onClick={handleAdd}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          הוסף פעולה
        </button>
      </div>
    </Modal>
  );
};
