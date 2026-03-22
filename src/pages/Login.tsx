import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useBudget } from '../context/BudgetContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { updateSettings } = useBudget();
  const navigate = useNavigate();
  const [scriptUrl, setScriptUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptUrl || !secretKey) {
      setError('יש להזין את כל הפרטים');
      return;
    }
    
    // Basic validation for script URL
    if (!scriptUrl.startsWith('https://script.google.com/')) {
      setError('כתובת ה-App Script אינה תקינה');
      return;
    }

    updateSettings({ scriptUrl, secretKey });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-xl border border-surface-container-low space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="material-symbols-outlined text-primary text-4xl material-symbols-fill">account_balance_wallet</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">BudgetPro</h1>
          <p className="text-on-surface-variant font-medium">התחברות למערכת</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold px-1 text-on-surface-variant">כתובת App Script URL</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">link</span>
              <input 
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pr-12 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold px-1 text-on-surface-variant">קוד סודי (Secret Key)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
              <input 
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="הזן את הקוד הסודי שלך"
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pr-12 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                dir="rtl"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-error text-xs font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            התחברות
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            הנתונים שלך נשמרים מקומית בלבד
          </p>
        </div>
      </motion.div>
    </div>
  );
};
