import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '../lib/utils';
import { useBudget, SavingsGoal as SavingsGoalType } from '../context/BudgetContext';
import { AddSavingsModal } from '../components/AddSavingsModal';
import { EditSavingsModal } from '../components/EditSavingsModal';

/**
 * Savings Screen
 * Displays savings goals and progress.
 */
export const Savings: React.FC = () => {
  const { savingsGoals, getFilteredTransactions } = useBudget();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalType | null>(null);

  const totalTarget = savingsGoals.reduce((acc, goal) => acc + goal.target, 0);
  const totalCurrent = savingsGoals.reduce((acc, goal) => acc + goal.current, 0);
  const totalRemaining = totalTarget - totalCurrent;

  // Calculate savings allocated this month
  const currentCycleTransactions = getFilteredTransactions('all');
  const monthlySavings = currentCycleTransactions
    .filter(t => t.type === 'savings_deposit')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Summary Section - Unified Card */}
      <section className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container-low shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        
        <div className="relative z-10 text-center space-y-2">
          <span className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">סה״כ נחסך</span>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(totalCurrent, false)}</h2>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-xs bg-primary-container px-3 py-1 rounded-full shadow-sm">
                {totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0}% מהיעד הכולל
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-0 pt-6 border-t border-surface-container">
          <div className="flex flex-col items-center border-l border-surface-container">
            <p className="text-primary font-bold text-[10px] uppercase tracking-widest mb-1 opacity-70">הוקצה החודש</p>
            <h3 className="text-2xl font-extrabold text-primary tracking-tighter">{formatCurrency(monthlySavings, false)}</h3>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest mb-1 opacity-70">נותר ליעד</p>
            <h3 className="text-2xl font-extrabold text-on-surface tracking-tighter">{formatCurrency(totalRemaining, false)}</h3>
          </div>
        </div>
      </section>

      {/* Savings Goals List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-extrabold tracking-tight">יעדי חיסכון</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>הוסף חיסכון</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {savingsGoals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            
            // Time progress calculations
            const startDate = goal.startDate ? new Date(goal.startDate) : new Date();
            const duration = goal.durationMonths || 12;
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + duration);
            
            const now = new Date();
            const currentMonthStr = now.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
            const totalMonths = duration;
            const elapsedMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
            const timeProgress = Math.min(100, Math.max(0, (elapsedMonths / totalMonths) * 100));

            const formatDate = (date: Date) => {
              return date.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
            };

            return (
              <div 
                key={goal.id} 
                onClick={() => setEditingGoal(goal)}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-low shadow-sm space-y-6 group hover:border-primary/20 transition-colors relative overflow-hidden cursor-pointer"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", goal.container, goal.onContainer)}>
                      <span className="material-symbols-outlined text-3xl material-symbols-fill">{goal.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg">{goal.name}</h4>
                      <p className="text-xs text-on-surface-variant font-bold">{formatCurrency(goal.current)} מתוך {formatCurrency(goal.target)}</p>
                      {goal.monthlyAmount && (
                        <p className={cn("text-[10px] font-black mt-0.5", goal.color.replace('bg-', 'text-'))}>
                          הפקדה חודשית: {formatCurrency(goal.monthlyAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={cn("text-xs font-black px-3 py-1 rounded-full shadow-sm", goal.container, goal.onContainer)}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <div className="relative pt-4">
                    {/* Progress Bar Background */}
                    <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                      {/* Actual Savings Progress */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-full relative z-10 shadow-inner", goal.color)}
                      />
                    </div>

                    {/* Time Progress Indicator (Marker) */}
                    <div 
                      className="absolute top-0 h-8 w-px bg-on-surface/30 z-20 flex flex-col items-center"
                      style={{ right: `${timeProgress}%` }}
                    >
                      <div className={cn("w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm -mt-1", goal.color)} />
                      <div className={cn("mt-4 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md whitespace-nowrap flex flex-col items-center gap-0.5", goal.color)}>
                        <span>{currentMonthStr}</span>
                        <span className="text-[7px] opacity-80">{formatCurrency(goal.current)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter px-1 pt-2">
                    <div className="flex flex-col items-start">
                      <span className="opacity-50 mb-0.5">התחלה</span>
                      <span className="text-on-surface">{formatDate(startDate)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="opacity-50 mb-0.5">סיום משוער</span>
                      <span className="text-on-surface">{formatDate(endDate)}</span>
                    </div>
                  </div>

                  {goal.note && (
                    <div className="flex items-center gap-2 bg-surface-container-low/50 p-3 rounded-xl border border-surface-container-low">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">notes</span>
                      <p className="text-[10px] text-on-surface-variant font-medium leading-tight">
                        {goal.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Projection Teaser */}
      <section className="bg-tertiary-container p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-tertiary/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-tertiary/20 transition-colors" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-white/40 rounded-3xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-4xl text-on-tertiary-container material-symbols-fill">trending_up</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-on-tertiary-container">תחזית צמיחה</h3>
            <p className="text-sm text-on-tertiary-container/70 font-medium leading-relaxed max-w-[240px]">
              בקצב הנוכחי, תגיע ליעד "טיול לחו״ל" בעוד 4 חודשים. רוצה לראות את התמונה המלאה?
            </p>
          </div>
          <button 
            onClick={() => navigate('/forecast')}
            className="bg-on-tertiary-container text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95"
          >
            צפה בתחזית המלאה
          </button>
        </div>
      </section>

      <AddSavingsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <EditSavingsModal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        goal={editingGoal}
      />
    </motion.div>
  );
};
