import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBudget, PASTEL_COLORS, SavingsGoal } from '../context/BudgetContext';
import { ConfirmModal } from './ConfirmModal';

interface EditSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const EditSavingsModal: React.FC<EditSavingsModalProps> = ({ isOpen, onClose, goal }) => {
  const { updateSavingsGoal, deleteSavingsGoal } = useBudget();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [icon, setIcon] = useState('savings');
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]);
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [depositDay, setDepositDay] = useState('1');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTarget(goal.target.toString());
      setCurrent(goal.current.toString());
      setIcon(goal.icon);
      setNote(goal.note || '');
      setStartDate(goal.startDate || '');
      setDurationMonths(goal.durationMonths?.toString() || '12');
      setDepositDay(goal.depositDay?.toString() || '1');
      setMonthlyAmount(goal.monthlyAmount?.toString() || '');
      
      const goalColor = PASTEL_COLORS.find(c => c.color === goal.color) || PASTEL_COLORS[0];
      setSelectedColor(goalColor);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !name || !target) return;

    updateSavingsGoal(goal.id, {
      name,
      target: parseFloat(target),
      current: parseFloat(current),
      icon,
      color: selectedColor.color,
      container: selectedColor.container,
      onContainer: selectedColor.onContainer,
      note,
      startDate,
      durationMonths: parseInt(durationMonths),
      depositDay: parseInt(depositDay),
      monthlyAmount: parseFloat(monthlyAmount) || 0
    });
    
    onClose();
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (goal) {
      deleteSavingsGoal(goal.id);
      setIsConfirmDeleteOpen(false);
      onClose();
    }
  };

  const icons = [
    { id: 'savings', label: 'כללי' },
    { id: 'flight_takeoff', label: 'טיסה' },
    { id: 'home', label: 'בית' },
    { id: 'directions_car', label: 'רכב' },
    { id: 'school', label: 'לימודים' },
    { id: 'family_restroom', label: 'משפחה' },
    { id: 'account_balance_wallet', label: 'ארנק' },
  ];

  return (
    <AnimatePresence>
      {isOpen && goal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-[2.5rem] p-8 z-[101] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-surface-container rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold">ערוך יעד חיסכון</h2>
              <button 
                onClick={handleDelete}
                className="text-error font-bold text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                מחק
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold px-1">שם היעד</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: טיול ליפן"
                  className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold px-1">סכום יעד</label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="₪0"
                    className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold px-1">סכום התחלתי</label>
                    <input
                      type="number"
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      placeholder="₪0"
                      className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-3xl space-y-4 border border-primary/10">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">event_repeat</span>
                  הפקדה חודשית אוטומטית
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">סכום חודשי</label>
                    <input
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(e.target.value)}
                      placeholder="₪0"
                      className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">יום בחודש</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={depositDay}
                      onChange={(e) => setDepositDay(e.target.value)}
                      className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">תאריך התחלה</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">משך (חודשים)</label>
                    <input
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold px-1">בחר צבע</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {PASTEL_COLORS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(item)}
                      className={`w-10 h-10 rounded-full flex-shrink-0 transition-all border-2 ${
                        selectedColor.color === item.color ? 'border-on-surface ring-2 ring-on-surface/20' : 'border-transparent'
                      } ${item.color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold px-1">בחר אייקון</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {icons.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[70px] transition-all ${
                        icon === item.id ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined">{item.id}</span>
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold px-1">הערות (אופציונלי)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="כתוב כאן הערות לגבי החיסכון..."
                  className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold bg-surface-container text-on-surface-variant active:scale-95 transition-all"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl font-bold bg-primary text-white active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  עדכן חיסכון
                </button>
              </div>
            </form>
          </motion.div>

          <ConfirmModal
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            onConfirm={confirmDelete}
            title="מחיקת יעד חיסכון"
            message={`האם אתה בטוח שברצונך למחוק את "${goal.name}"? פעולה זו תמחק גם את כל ההפקדות המשויכות ליעד זה.`}
            confirmLabel="מחק לצמיתות"
            cancelLabel="חזור"
          />
        </>
      )}
    </AnimatePresence>
  );
};
