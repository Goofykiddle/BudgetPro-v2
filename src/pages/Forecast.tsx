import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

import { useBudget } from '../context/BudgetContext';

/**
 * Forecast Screen
 * Visualizes future financial trends and insights.
 */
export const Forecast: React.FC = () => {
  const { transactions, savingsGoals, accountBalances, totalBalance, getCycleDates } = useBudget();
  const [showAllYear, setShowAllYear] = useState(false);
  const [filter, setFilter] = useState('all');

  const generateForecast = () => {
    const data = [];
    let currentChecking = accountBalances.filter(a => a.type === 'checking').reduce((s, a) => s + a.amount, 0);
    let currentSavings = accountBalances.filter(a => a.type !== 'checking').reduce((s, a) => s + a.amount, 0);
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      
      // Get fixed transactions
      const fixedIncome = transactions
        .filter(t => t.type === 'fixed_income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const fixedExpenses = transactions
        .filter(t => t.type === 'fixed_expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      // Get savings deposits
      const savingsDeposit = savingsGoals.reduce((sum, goal) => {
        return sum + goal.monthlyAmount;
      }, 0);
      
      const monthlyNet = fixedIncome - fixedExpenses - savingsDeposit;
      currentChecking += monthlyNet;
      currentSavings += savingsDeposit;
      
      data.push({
        month: forecastDate.toLocaleString('he-IL', { month: 'short' }),
        fullMonth: forecastDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' }),
        income: fixedIncome,
        expense: fixedExpenses,
        saving: savingsDeposit,
        checking: currentChecking,
        savings: currentSavings,
        total: currentChecking + currentSavings
      });
    }
    return data;
  };

  const monthlyForecastData = generateForecast();
  // Reverse for RTL display in LTR chart container
  const chartData = [...monthlyForecastData].reverse();

  const displayedMonths = (showAllYear ? monthlyForecastData : monthlyForecastData.slice(0, 5)).filter(item => {
    if (filter === 'income') return item.income > 0;
    if (filter === 'expense') return item.expense > 0;
    return true;
  });

  const yearEndTotalBalance = monthlyForecastData[11].total;
  const yearEndCheckingBalance = monthlyForecastData[11].checking;
  const growthPercent = ((yearEndTotalBalance - totalBalance) / totalBalance * 100).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">תחזית</h1>
          <p className="text-on-surface-variant">ניתוח מעמיק של מסלול הצמיחה הפיננסי שלך ל-12 החודשים הקרובים.</p>
        </div>
        
        {/* Summary Card */}
        <div className="bg-primary-container p-6 rounded-xl shadow-sm flex flex-col gap-1 min-w-[240px]">
          <span className="text-on-primary-container font-semibold text-sm">צפי הון בעוד שנה (עו״ש + חסכונות)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-primary-container">{formatCurrency(yearEndTotalBalance, true)}</span>
            <span className={cn(
              "font-bold text-sm px-2 py-0.5 rounded-full",
              parseFloat(growthPercent) >= 0 ? "bg-white/30 text-on-primary-container" : "bg-error/20 text-error"
            )}>
              {parseFloat(growthPercent) >= 0 ? '+' : ''}{growthPercent}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-on-primary-container/10">
            <span className="text-xs text-on-primary-container/70 font-bold block">מתוכו יתרת עו״ש:</span>
            <span className="text-lg font-extrabold text-on-primary-container">{formatCurrency(yearEndCheckingBalance, true)}</span>
          </div>
        </div>
      </div>

      {/* Growth Chart Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 px-2">מגמת צמיחה משוערת</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-surface-container-low">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-surface-container-high)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ fill: 'var(--md-sys-color-surface-container-low)', opacity: 0.4 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface-container-highest p-3 rounded-xl shadow-xl border border-surface-container-low text-right">
                            <p className="text-xs font-bold text-on-surface mb-2">{data.fullMonth}</p>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold flex justify-between gap-4" style={{ color: '#FFB74D' }}>
                                <span>{formatCurrency(data.checking)}</span>
                                <span>נכסים:</span>
                              </p>
                              <p className="text-[10px] font-bold flex justify-between gap-4" style={{ color: '#64B5F6' }}>
                                <span>{formatCurrency(data.savings)}</span>
                                <span>חיסכון:</span>
                              </p>
                              <div className="pt-1 mt-1 border-t border-on-surface/10">
                                <p className="text-xs font-black text-on-surface flex justify-between gap-4">
                                  <span>{formatCurrency(data.total)}</span>
                                  <span>סה״כ:</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
                    formatter={(value) => <span className="text-on-surface-variant">{value === 'checking' ? 'נכסים' : 'חיסכון'}</span>}
                  />
                  <Bar dataKey="checking" stackId="a" fill="#FFB74D" radius={[0, 0, 0, 0]} barSize={24} />
                  <Bar dataKey="savings" stackId="a" fill="#64B5F6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-tertiary-container p-8 rounded-xl flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-tertiary text-4xl mb-4">auto_awesome</span>
              <h3 className="text-2xl font-bold text-on-tertiary-container mb-4">תובנה חכמה</h3>
              <p className="text-on-tertiary-container/80 leading-relaxed mb-6">
                בהתבסס על קצב החיסכון הנוכחי שלך, תוכל להגיע ליעד "דירה ראשונה" כ-4 חודשים מוקדם מהצפוי.
              </p>
            </div>
            <button className="relative z-10 bg-surface-container-lowest text-tertiary font-bold py-3 px-6 rounded-full w-full hover:shadow-md transition-all active:scale-95">
              צפה בתוכנית המלאה
            </button>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Monthly Forecast List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8 px-2">
          <h3 className="text-2xl font-bold">פירוט חודשי צפוי</h3>
          <div className="flex gap-2">
            {['all', 'income', 'expense'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-sm transition-all",
                  filter === f ? "bg-primary text-white shadow-md" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {f === 'all' ? 'הכל' : f === 'income' ? 'הכנסות' : 'הוצאות'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          {displayedMonths.map((item, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-low hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold">{item.fullMonth}</h4>
                    <p className="text-on-surface-variant text-sm font-medium">הכנסה: <span className="text-tertiary font-bold">{formatCurrency(item.income, true)}</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 md:max-w-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">הוצאה משוערת</span>
                    <span className="text-lg font-bold text-secondary">{formatCurrency(-item.expense, true)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">הפרשה לחיסכון</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(-item.saving, true)}</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-r border-surface-container-low pt-4 md:pt-0 md:pr-8">
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider block">יתרת עו״ש סופית</span>
                      <span className="text-xl font-extrabold text-primary">{formatCurrency(item.checking, true)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider block">עו״ש + חסכונות</span>
                      <span className="text-sm font-bold text-on-surface-variant">{formatCurrency(item.total, true)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => setShowAllYear(!showAllYear)}
            className="flex items-center gap-2 bg-surface-container-low text-on-surface-variant font-bold py-3 px-8 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 group"
          >
            {showAllYear ? 'הצג פחות' : 'הצג את כל השנה'}
            <span className={cn("material-symbols-outlined transition-transform", showAllYear ? "rotate-180" : "group-hover:translate-y-0.5")}>
              expand_more
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
