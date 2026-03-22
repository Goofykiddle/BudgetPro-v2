import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useBudget, AccountBalance } from '../context/BudgetContext';

interface EditAccountBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: AccountBalance | null;
}

export const EditAccountBalanceModal: React.FC<EditAccountBalanceModalProps> = ({ isOpen, onClose, balance }) => {
  const { addAccountBalance, updateAccountBalance } = useBudget();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<AccountBalance['type']>('checking');

  useEffect(() => {
    if (balance) {
      setName(balance.name);
      setAmount(balance.amount.toString());
      setType(balance.type);
    } else {
      setName('');
      setAmount('');
      setType('checking');
    }
  }, [balance, isOpen]);

  const handleSave = () => {
    const data = {
      name,
      amount: parseFloat(amount) || 0,
      type,
      lastUpdated: new Date().toISOString()
    };

    if (balance) {
      updateAccountBalance(balance.id, data);
    } else {
      addAccountBalance(data);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={balance ? 'עריכת יתרה' : 'הוספת יתרה חדשה'}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">שם החשבון / קופה</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20"
              placeholder="למשל: עו״ש בנק הפועלים"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold px-1">יתרה נוכחית</label>
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
            <label className="text-xs font-bold px-1">סוג חשבון</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="checking">חשבון עו״ש</option>
              <option value="savings">חיסכון / קופת גמל</option>
              <option value="pension">פנסיה</option>
              <option value="other">אחר</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          {balance ? 'עדכן יתרה' : 'הוסף יתרה'}
        </button>
      </div>
    </Modal>
  );
};
