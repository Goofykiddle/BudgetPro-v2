import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { useBudget, TransactionType, Transaction, AccountBalance } from '../context/BudgetContext';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { EditAccountBalanceModal } from '../components/EditAccountBalanceModal';

/**
 * Settings Screen
 * User profile management and app configuration.
 */
export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    transactions, 
    deleteTransaction, 
    accountBalances, 
    deleteAccountBalance,
    logout
  } = useBudget();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<TransactionType>('fixed_income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBalance, setEditingBalance] = useState<AccountBalance | null>(null);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings.userName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fixedExpenses = transactions.filter(t => t.type === 'fixed_expense');
  const fixedIncome = transactions.filter(t => t.type === 'fixed_income');

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = (type: TransactionType) => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
          <div className="relative w-24 h-24 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            <img 
              alt="Profile" 
              className="w-full h-full object-cover" 
              src={settings.profileImage}
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={handleImageClick}
            className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div className="flex flex-col items-center">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-surface-container-low border-none rounded-lg px-3 py-1 font-bold text-center focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <button 
                onClick={() => {
                  updateSettings({ userName: tempName });
                  setIsEditingName(false);
                }}
                className="bg-primary text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">check</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight">{settings.userName}</h2>
              <button 
                onClick={() => setIsEditingName(true)}
                className="text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
          )}
          <p className="text-on-surface-variant text-sm font-medium">yonatan.i@example.com</p>
        </div>
      </section>

      {/* Monthly Cycle Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          <h3 className="text-lg font-bold">מחזור חודשי</h3>
        </div>
        <div className="bg-surface-container-low rounded-xl p-6 space-y-6">
          <div>
            <label className="text-sm font-bold text-on-surface-variant mb-4 block">יום תחילת החודש התקציבי</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 10, 15].map((day) => (
                <button 
                  key={day}
                  onClick={() => updateSettings({ cycleStartDay: day })}
                  className={cn(
                    "py-3 rounded-xl font-bold transition-all shadow-sm",
                    settings.cycleStartDay === day ? "bg-primary-container text-on-primary-container border-2 border-primary" : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold px-1">חודש התחלה</label>
              <select 
                value={settings.startMonth}
                onChange={(e) => updateSettings({ startMonth: parseInt(e.target.value) })}
                className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('he-IL', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold px-1">שנת התחלה</label>
              <select 
                value={settings.startYear}
                onChange={(e) => updateSettings({ startYear: parseInt(e.target.value) })}
                className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20"
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl">
            <div className="flex flex-col">
              <span className="font-bold">חישוב מחדש אוטומטי</span>
              <span className="text-xs text-on-surface-variant">עדכון היתרה בכל תחילת מחזור</span>
            </div>
            <button 
              onClick={() => updateSettings({ autoRecalculate: !settings.autoRecalculate })}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                settings.autoRecalculate ? "bg-primary" : "bg-slate-300"
              )}
            >
              <div className={cn(
                "absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all",
                settings.autoRecalculate ? "right-[2px]" : "right-[24px]"
              )} />
            </button>
          </div>
        </div>
      </section>

      {/* Fixed Income */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            <h3 className="text-lg font-bold">הכנסות קבועות</h3>
          </div>
          <button 
            onClick={() => openAddModal('fixed_income')}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            הוספת הכנסה
          </button>
        </div>
        <div className="space-y-3">
          {fixedIncome.map((item) => (
            <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm border-r-4 border-primary">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">work</span>
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc || 'הכנסה קבועה'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-primary text-lg">{formatCurrency(item.amount)}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingTransaction(item)}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button 
                    onClick={() => deleteTransaction(item.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fixed Expenses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">receipt_long</span>
            <h3 className="text-lg font-bold">הוצאות קבועות</h3>
          </div>
          <button 
            onClick={() => openAddModal('fixed_expense')}
            className="text-secondary font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            הוספת הוצאה
          </button>
        </div>
        
        <div className="space-y-3">
          {fixedExpenses.map((item) => (
            <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm border border-surface-container-low">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/40 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">home</span>
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] rounded-full font-bold">
                    {item.frequency === 'bi_monthly' ? 'דו-חודשי' : 
                     item.frequency === 'quarterly' ? 'רבעוני' : 
                     item.frequency === 'semi_annually' ? 'חצי שנתי' : 
                     item.frequency === 'annually' ? 'שנתי' : 'חודשי'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-extrabold text-secondary text-lg">{formatCurrency(item.amount)}</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingTransaction(item)}
                    className="text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button 
                    onClick={() => deleteTransaction(item.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account Balances */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            <h3 className="text-lg font-bold">יתרות עו״ש וחסכונות</h3>
          </div>
          <button 
            onClick={() => setIsAddBalanceModalOpen(true)}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            הוספת יתרה
          </button>
        </div>
        <div className="space-y-3">
          {accountBalances.map((item) => (
            <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm border border-surface-container-low">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">
                    {item.type === 'checking' ? 'account_balance' : 
                     item.type === 'savings' ? 'savings' : 
                     item.type === 'pension' ? 'account_balance_wallet' : 'wallet'}
                  </span>
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold">עודכן לאחרונה: {new Date(item.lastUpdated).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-on-surface text-lg">{formatCurrency(item.amount)}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingBalance(item)}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button 
                    onClick={() => deleteAccountBalance(item.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* General Settings */}
      <section className="pt-4 pb-8 space-y-4">
        <div className="bg-surface-container-low rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors text-right">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
              <span className="font-bold">תמיכה טכנית</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_left</span>
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors text-right border-t border-surface-variant/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">lock</span>
              <span className="font-bold">פרטיות ואבטחה</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_left</span>
          </button>
          <div className="p-5 flex items-center justify-between border-t border-surface-variant/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">info</span>
              <span className="font-bold">גרסת האפליקציה</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">2.4.0 (Build 82)</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full bg-error-container/10 text-error py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-error-container/20 transition-all mt-6"
        >
          <span className="material-symbols-outlined">logout</span>
          התנתקות מהמערכת
        </button>
      </section>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        initialType={addModalType}
        mode="permanent"
      />
      <EditTransactionModal 
        isOpen={!!editingTransaction} 
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        mode="permanent"
      />
      <EditAccountBalanceModal 
        isOpen={isAddBalanceModalOpen || !!editingBalance}
        onClose={() => {
          setIsAddBalanceModalOpen(false);
          setEditingBalance(null);
        }}
        balance={editingBalance}
      />
    </motion.div>
  );
};
