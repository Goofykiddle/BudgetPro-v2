import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency, parseDateLocal } from '../lib/utils';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { useBudget } from '../context/BudgetContext';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

/**
 * Home Screen
 * Displays budget overview, salary countdown, and recent activity.
 */
export const Home: React.FC = () => {
  const { settings, transactions, savingsGoals, getFilteredTransactions, getCycleDates } = useBudget();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'months'>('categories');
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setIsChartReady(true));
    return () => {
      window.cancelAnimationFrame(id);
      setIsChartReady(false);
    };
  }, []);

  const currentCycleTransactions = getFilteredTransactions('all');
  const recentActivity = currentCycleTransactions.slice(0, 4);

  // Prepare data for Monthly Bar Chart (last 5 cycles)
  const monthlyData = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const { start } = getCycleDates(date);
    const cycleTransactions = getFilteredTransactions('all', date);
    const expenses = cycleTransactions
      .filter(t => t.type.includes('expense'))
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      name: start.toLocaleDateString('he-IL', { month: 'short' }),
      value: expenses,
      fullDate: start
    };
  }).reverse();

  const averageExpenses = monthlyData.reduce((acc, curr) => acc + curr.value, 0) / monthlyData.length;

  // Calculate days until next salary based on cycleStartDay
  const today = new Date();
  let nextSalary = new Date(today.getFullYear(), today.getMonth(), settings.cycleStartDay);
  if (today >= nextSalary) {
    nextSalary.setMonth(nextSalary.getMonth() + 1);
  }
  const daysUntilSalary = Math.ceil((nextSalary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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

  const totalIncome = currentCycleTransactions.filter(t => t.type.includes('income')).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = currentCycleTransactions.filter(t => t.type.includes('expense')).reduce((acc, t) => acc + t.amount, 0);
  const totalSavings = currentCycleTransactions.filter(t => t.type === 'savings_deposit').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense - totalSavings;

  const fixedExpenses = currentCycleTransactions.filter(t => t.type === 'fixed_expense');

  // Prepare data for Pie Chart
  const expenseCategories = currentCycleTransactions
    .filter(t => t.type.includes('expense'))
    .reduce((acc: any, t) => {
      const category = t.desc || 'אחר';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expenseCategories).map(name => ({
    name,
    value: expenseCategories[name]
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#A142F4', '#24C1E0', '#F43F5E'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'מזון': return 'shopping_cart';
      case 'פנאי': return 'sports_esports';
      case 'תחבורה': return 'directions_car';
      case 'בריאות': return 'medical_services';
      case 'קניות': return 'local_mall';
      case 'מגורים': return 'home';
      default: return 'category';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Hero Section: Budget Breakdown */}
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest mb-1">פנוי לבזבוז החודש</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-extrabold text-on-surface tracking-tighter">{formatCurrency(balance, false)}</h2>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
                <div className="h-full bg-secondary" style={{ width: `${totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0}%` }} />
                <div className="h-full bg-primary border-x border-white/20" style={{ width: `${totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0}%` }} />
                <div className="h-full bg-blue-100" style={{ width: `${totalIncome > 0 ? (balance / totalIncome) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold px-1 uppercase tracking-tighter opacity-60">
                <span>הוצאות</span>
                <span>חיסכון</span>
                <span>פנוי</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-surface-container-low/30 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                <div className="flex flex-col items-center flex-1 border-l border-surface-container-high">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">הכנסות</span>
                  <span className="text-sm font-bold text-tertiary">{formatCurrency(totalIncome, true)}</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-0.5">הוצאות</span>
                  <span className="text-sm font-bold text-secondary">{formatCurrency(-totalExpense, true)}</span>
                </div>
              </div>
              
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex flex-col items-center">
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest mb-0.5">חיסכון</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(-totalSavings, true)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Carousel */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xl font-bold tracking-tight">החסכונות שלי</h3>
          <span 
            onClick={() => navigate('/savings')}
            className="text-primary font-bold text-sm cursor-pointer hover:underline"
          >
            נהל הכל
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
          {savingsGoals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div 
                key={goal.id}
                onClick={() => navigate('/savings')}
                className="min-w-[280px] bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-sm space-y-4 flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", goal.container, goal.onContainer)}>
                    <span className="material-symbols-outlined text-xl material-symbols-fill">{goal.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm truncate">{goal.name}</h4>
                    <p className="text-[10px] text-on-surface-variant font-bold">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</p>
                  </div>
                  <span className="text-xs font-black">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn("h-full rounded-full", goal.color)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fixed Expenses Carousel */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-xl font-bold tracking-tight">הוצאות קבועות החודש</h3>
          <span 
            onClick={() => navigate('/transactions?filter=expense')}
            className="text-primary font-bold text-sm cursor-pointer hover:underline"
          >
            נהל הכל
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
          {fixedExpenses.map((expense) => (
            <div 
              key={expense.id}
              onClick={() => setEditingTransaction(expense)}
              className="min-w-[200px] bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-low shadow-sm flex flex-col gap-3 flex-shrink-0 cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">{getIcon(expense.type)}</span>
                </div>
                <h4 className="font-bold text-xs truncate flex-1">{expense.name}</h4>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-black text-secondary">{formatCurrency(-expense.amount, true)}</span>
                <span className="text-[10px] text-on-surface-variant font-bold">{parseDateLocal(expense.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          ))}
          {fixedExpenses.length === 0 && (
            <div className="w-full text-center py-4 text-on-surface-variant text-sm italic">אין הוצאות קבועות החודש</div>
          )}
        </div>
      </section>

      {/* Expense Summary Chart (Max Style) - Ultra Compact */}
      <section className="space-y-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low shadow-sm overflow-hidden">
          {/* Header Tabs - Ultra Compact */}
          <div className="flex border-b border-surface-container-low">
            <div 
              onClick={() => setActiveTab('months')}
              className={cn(
                "flex-1 p-2 flex flex-col items-center gap-0.5 cursor-pointer transition-all",
                activeTab === 'months' ? "bg-surface-container-low/10" : "opacity-30"
              )}
            >
              <span className={cn("material-symbols-outlined text-base", activeTab === 'months' && "text-primary material-symbols-fill")}>bar_chart</span>
              <div className="flex items-center gap-0.5">
                <span className={cn("text-[9px] font-bold", activeTab === 'months' && "text-primary")}>גרף חודשים</span>
                {activeTab === 'months' && <span className="material-symbols-outlined text-[9px] text-primary">expand_less</span>}
              </div>
            </div>
            <div 
              onClick={() => setActiveTab('categories')}
              className={cn(
                "flex-1 p-2 flex flex-col items-center gap-0.5 border-l border-surface-container-low cursor-pointer transition-all",
                activeTab === 'categories' ? "bg-surface-container-low/10" : "opacity-30"
              )}
            >
              <span className={cn("material-symbols-outlined text-base", activeTab === 'categories' && "text-primary material-symbols-fill")}>donut_large</span>
              <div className="flex items-center gap-0.5">
                <span className={cn("text-[9px] font-bold", activeTab === 'categories' && "text-primary")}>גרף קטגוריות</span>
                {activeTab === 'categories' && <span className="material-symbols-outlined text-[9px] text-primary">expand_less</span>}
              </div>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'categories' ? (
              <div className="flex items-center justify-between gap-4">
                {/* Legend Section - Left Side */}
                <div className="flex-1 space-y-3">
                  {pieData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-end gap-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-on-surface leading-none mb-0.5">{formatCurrency(entry.value)}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant leading-none">{entry.name}</span>
                      </div>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-surface-container-low shrink-0">
                        <span className="material-symbols-outlined text-sm" style={{ color: COLORS[index % COLORS.length] }}>
                          {getCategoryIcon(entry.name)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {pieData.length > 4 && (
                    <div className="flex items-center justify-end gap-2 text-right opacity-60">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-on-surface leading-none mb-0.5">
                          {formatCurrency(pieData.slice(4).reduce((acc, curr) => acc + curr.value, 0))}
                        </span>
                        <span className="text-[10px] font-bold text-on-surface-variant leading-none">קטגוריות נוספות</span>
                      </div>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-surface-container-low shrink-0">
                        <span className="material-symbols-outlined text-sm">more_horiz</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Section - Right Side */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-32 h-32 min-w-[128px] min-h-[128px]">
                    {isChartReady ? (
                      <PieChart width={128} height={128}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    ) : (
                      <div className="h-full w-full rounded-full bg-surface-container-low" />
                    )}
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-bold text-on-surface-variant leading-tight">עסקאות</span>
                      <span className="text-[8px] font-bold text-on-surface-variant leading-tight">החודש</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/transactions')}
                    className="text-primary font-black text-[10px] flex items-center gap-0.5 hover:underline mt-1 self-end"
                  >
                    לכל הקטגוריות
                    <span className="material-symbols-outlined text-xs">chevron_left</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                {/* Info Section - Left Side */}
                <div className="flex-1 space-y-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant mb-1">ממוצע חודשי</p>
                    <p className="text-xs font-black text-on-surface">{formatCurrency(averageExpenses)}</p>
                  </div>
                  <div className="space-y-2">
                    {monthlyData.slice(-2).reverse().map((month) => (
                      <div key={month.name} className="flex flex-col items-end text-right">
                        <span className="text-xs font-black text-on-surface leading-none mb-0.5">{formatCurrency(month.value)}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant leading-none">{month.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Section - Right Side */}
                <div className="flex-1 h-32 min-w-0 min-h-[128px]">
                  {isChartReady ? (
                    <BarChart width={220} height={128} data={monthlyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-surface-container-highest p-2 rounded-lg shadow-lg border border-surface-container-low">
                                <p className="text-[10px] font-bold text-on-surface">{payload[0].payload.name}</p>
                                <p className="text-[10px] font-black text-primary">{formatCurrency(payload[0].value as number)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={12}>
                        {monthlyData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === monthlyData.length - 1 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-primary-container)'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <div className="h-full w-full rounded-xl bg-surface-container-low" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Salary Countdown */}
      <section className="bg-secondary-container p-8 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-secondary/10 to-transparent" />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-5xl text-on-secondary-container mb-2 material-symbols-fill">event_repeat</span>
          <h3 className="text-xl font-bold text-on-secondary-container">ספירה לאחור למשכורת</h3>
          <div className="flex gap-3 items-center justify-center mt-4">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-on-secondary-container">{daysUntilSalary.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-secondary-container/60">ימים</span>
            </div>
            <span className="text-2xl font-light text-on-secondary-container/60">:</span>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-on-secondary-container">14</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-secondary-container/60">שעות</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/forecast')}
            className="mt-8 bg-on-secondary-container text-white px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            צפה בתחזית
          </button>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-2xl font-extrabold tracking-tight">עסקאות אחרונות</h3>
          <span 
            onClick={() => navigate('/transactions')}
            className="text-primary font-bold text-sm cursor-pointer hover:underline"
          >
            פירוט מלא
          </span>
        </div>
        <div className="bg-surface-container-low rounded-[2rem] overflow-hidden p-2 space-y-1">
          {recentActivity.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setEditingTransaction(item)}
              className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl cursor-pointer hover:bg-white transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant")}>
                  <span className="material-symbols-outlined">{getIcon(item.type)}</span>
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{parseDateLocal(item.date).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "font-extrabold whitespace-nowrap", 
                  item.type.includes('income') ? "text-tertiary" : 
                  item.type.includes('expense') ? "text-secondary" : 
                  "text-primary"
                )}>
                  {formatCurrency(item.type.includes('income') ? item.amount : -item.amount, true)}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">chevron_left</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Insights */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold px-2">תובנות חכמות</h3>
        <div className="bg-tertiary-container/30 backdrop-blur-md border border-white p-6 rounded-[2rem] relative overflow-hidden">
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-tertiary/10 rounded-full blur-xl" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="bg-white/60 w-fit p-2 rounded-xl">
                <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              </div>
              <p className="text-on-tertiary-container font-medium leading-relaxed">
                נראה שהוצאות ה"בילויים" שלך גדלו ב-15% החודש לעומת חודש שעבר. כדי לעמוד ביעד, מומלץ לצמצם הוצאות אלו ב-{formatCurrency(200)} בשבוע הקרוב.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-tertiary/10">
              <div className="flex items-center gap-3 text-sm font-bold text-tertiary">
                <span className="material-symbols-outlined">lightbulb</span>
                <span>טיפ: נסה לקנות מותגי בית</span>
              </div>
            </div>
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
