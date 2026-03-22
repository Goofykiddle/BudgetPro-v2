import React, { useState } from 'react';
import { Modal } from './Modal';
import { ConfirmModal } from './ConfirmModal';
import { cn } from '../lib/utils';
import { useBudget, Transaction, Frequency } from '../context/BudgetContext';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  mode?: 'one-time' | 'permanent';
}

/**
 * Modal for editing a specific transaction instance
 */
export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, mode = 'one-time' }) => {
  const { updateTransaction, deleteTransaction, categories, addCategory } = useBudget();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [name, setName] = useState(transaction?.name || '');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [date, setDate] = useState(transaction?.date || '');
  const [desc, setDesc] = useState(transaction?.desc || '');
  const [frequency, setFrequency] = useState<Frequency>(transaction?.frequency || 'monthly');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const frequencies = [
    { id: 'monthly', label: 'חודשי' },
    { id: 'bi_monthly', label: 'דו-חודשי' },
    { id: 'quarterly', label: 'רבעוני' },
    { id: 'semi_annually', label: 'חצי שנתי' },
    { id: 'annually', label: 'שנתי' },
  ];

  React.useEffect(() => {
    if (transaction) {
      setName(transaction.name);
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setDesc(transaction.desc || '');
      setFrequency(transaction.frequency || 'monthly');
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = () => {
    let finalCategory = desc;
    if (isAddingCategory && newCategoryName) {
      addCategory(newCategoryName);
      finalCategory = newCategoryName;
    }

    updateTransaction(transaction.id, {
      name,
      amount: parseFloat(amount),
      date,
      desc: finalCategory,
      category: finalCategory,
      frequency: transaction.isRecurring ? frequency : undefined,
    });
    
    if (mode === 'permanent') {
      // In a real app we might trigger a toast here
      console.log('Permanent change saved. Affects future cycles.');
    }
    
    onClose();
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`עריכת ${transaction.name}`}>
      <div className="space-y-6">
        {/* Warning for recurring transactions */}
        {transaction.isRecurring && (
          <div className={cn(
            "p-3 rounded-xl flex items-center gap-3 border",
            mode === 'permanent' 
              ? "bg-primary/5 border-primary/20 text-primary" 
              : "bg-amber-50 border-amber-200 text-amber-800"
          )}>
            <span className="material-symbols-outlined shrink-0">
              {mode === 'permanent' ? 'settings_suggest' : 'info'}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold leading-tight">
                {mode === 'permanent' ? 'עדכון הגדרה קבועה' : 'עדכון חד-פעמי'}
              </span>
              <p className="text-[10px] leading-tight opacity-90 font-medium">
                {mode === 'permanent' 
                  ? 'השינוי יחול על כל מחזורי התקציב העתידיים וישפיע על התחזית.' 
                  : 'השינוי יחול רק על המחזור הנוכחי ולא ישפיע על הגדרות הקבע.'}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">שם הפעולה</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">סכום (לשינוי חד פעמי)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₪</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20"
              />
            </div>
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

          {transaction.isRecurring && (
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
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            שמור שינויים
          </button>
          <button 
            onClick={handleDelete}
            className="px-6 bg-error-container/10 text-error py-4 rounded-2xl font-bold active:scale-95 transition-all"
          >
            מחק
          </button>
        </div>
      </div>
    </Modal>

    <ConfirmModal
      isOpen={isConfirmDeleteOpen}
      onClose={() => setIsConfirmDeleteOpen(false)}
      onConfirm={confirmDelete}
      title="מחיקת פעולה"
      message={`האם אתה בטוח שברצונך למחוק את "${transaction.name}"? פעולה זו אינה ניתנת לביטול.`}
      confirmLabel="מחק לצמיתות"
      cancelLabel="חזור"
    />
  </>
);
};
