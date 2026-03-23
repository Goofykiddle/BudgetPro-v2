/**
 * BudgetPro - Vanilla JS Application
 * Replicating React functionality for Google Apps Script deployment
 */

// --- State Management ---
const state = {
    transactions: [
        { id: '1', name: 'משכורת 1', amount: 12500, type: 'fixed_income', date: '2026-03-01', desc: 'העברה בנקאית', isRecurring: true },
        { id: '2', name: 'משכורת 2', amount: 4200, type: 'fixed_income', date: '2026-03-05', desc: 'הפקדה חודשית', isRecurring: true },
        { id: '3', name: 'שכר דירה', amount: 5200, type: 'fixed_expense', date: '2026-03-01', desc: 'העברה בנקאית', isRecurring: true },
        { id: '4', name: 'חשבון מים', amount: 245.80, type: 'fixed_expense', date: '2026-03-15', desc: 'מקורות', isRecurring: true },
        { id: '5', name: 'סופר-מרקט', amount: 842.15, type: 'variable_expense', date: '2026-03-20', desc: 'שופרסל', isRecurring: false },
        { id: '6', name: 'חשמל', amount: 412.00, type: 'fixed_expense', date: '2026-03-21', desc: 'חברת החשמל', alert: true, isRecurring: true },
        { id: '7', name: 'נטפליקס', amount: 54.90, type: 'fixed_expense', date: '2026-03-10', desc: 'מנוי חודשי', isRecurring: true },
    ],
    savingsGoals: [
        { 
            id: '1', 
            name: 'טיול לחו״ל', 
            target: 15000, 
            current: 9750, 
            icon: 'flight_takeoff', 
            color: 'bg-blue-400', 
            container: 'bg-blue-50', 
            onContainer: 'text-blue-900', 
            note: 'חיסכון לטיול בקיץ',
            startDate: '2026-03-01',
            durationMonths: 12,
            depositDay: 10,
            monthlyAmount: 1250
        },
        { 
            id: '2', 
            name: 'חיסכון לילדים', 
            target: 100000, 
            current: 42000, 
            icon: 'family_restroom', 
            color: 'bg-purple-400', 
            container: 'bg-purple-50', 
            onContainer: 'text-purple-900',
            startDate: '2026-01-01',
            durationMonths: 120,
            depositDay: 1,
            monthlyAmount: 833
        },
        { 
            id: '3', 
            name: 'קופת גמל', 
            target: 250000, 
            current: 205000, 
            icon: 'account_balance_wallet', 
            color: 'bg-orange-400', 
            container: 'bg-orange-50', 
            onContainer: 'text-orange-900',
            startDate: '2025-01-01',
            durationMonths: 180,
            depositDay: 1,
            monthlyAmount: 1388
        },
    ],
    accountBalances: [
        { id: '1', name: 'חשבון עו״ש עיקרי', amount: 12450, type: 'checking', lastUpdated: new Date().toISOString() },
        { id: '2', name: 'קופת גמל להשקעה', amount: 45000, type: 'savings', lastUpdated: new Date().toISOString() },
    ],
    settings: {
        userName: 'יונתן',
        cycleStartDay: 1,
        startMonth: 3,
        startYear: 2026,
        autoRecalculate: true,
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8tz1rrtsBZ2k9ahQ2gh5R7J9VY1PCZwgQw-WPcE9dbFnPneV3zSgVGp9svoETdhHPP44ajJ2uTs1aQaH3RWmA6TK-ByEWnrlbmi6am1TaFnnwakExMp95akuzKjlavEQkTWWesTNyR8OwEK3GjJ3U9b3IofMqtGYkFtviWx6G34ZOeG5np-vl1kNcCr4QykXSoIakaC1nIJeAsy_jxpTUywU6iQMDzJcGKVy8_SopP-gAQHotii8iMcbjCRyIUbnh9UMBxtYtwwo',
        scriptUrl: '',
        secretKey: ''
    },
    categories: ['מזון', 'פנאי', 'תחבורה', 'בריאות', 'קניות', 'מגורים', 'אחר'],
    currentPath: window.location.hash.replace('#', '') || '/',
    isLoading: false,
    error: null
};

// --- Constants ---
const PASTEL_COLORS = [
    { name: 'כחול', color: 'bg-blue-400', container: 'bg-blue-50', onContainer: 'text-blue-900' },
    { name: 'ירוק', color: 'bg-emerald-400', container: 'bg-emerald-50', onContainer: 'text-emerald-900' },
    { name: 'אדום', color: 'bg-rose-400', container: 'bg-rose-50', onContainer: 'text-rose-900' },
    { name: 'סגול', color: 'bg-purple-400', container: 'bg-purple-50', onContainer: 'text-purple-900' },
    { name: 'ורוד', color: 'bg-pink-400', container: 'bg-pink-50', onContainer: 'text-pink-900' },
    { name: 'כתום', color: 'bg-orange-400', container: 'bg-orange-50', onContainer: 'text-orange-900' },
    { name: 'צהוב', color: 'bg-amber-400', container: 'bg-amber-50', onContainer: 'text-amber-900' },
    { name: 'תכלת', color: 'bg-cyan-400', container: 'bg-cyan-50', onContainer: 'text-cyan-900' },
    { name: 'אינדיגו', color: 'bg-indigo-400', container: 'bg-indigo-50', onContainer: 'text-indigo-900' },
    { name: 'ליים', color: 'bg-lime-400', container: 'bg-lime-50', onContainer: 'text-lime-900' },
];

const TRANSACTION_TYPES = {
    fixed_income: { label: 'הכנסה קבועה', icon: 'payments', color: 'text-emerald-600' },
    variable_income: { label: 'הכנסה משתנה', icon: 'add_card', color: 'text-emerald-600' },
    fixed_expense: { label: 'הוצאה קבועה', icon: 'account_balance_wallet', color: 'text-rose-600' },
    variable_expense: { label: 'הוצאה משתנה', icon: 'shopping_cart', color: 'text-rose-600' },
    savings_deposit: { label: 'הפקדה לחיסכון', icon: 'savings', color: 'text-blue-600' }
};

// --- Utility Functions ---
function formatCurrency(amount, showSymbol = true) {
    const formatted = new Intl.NumberFormat('he-IL', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'ILS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
    return formatted;
}

function formatDateLocal(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateLocal(dateStr) {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getCycleDates(date = new Date()) {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    
    let cycleStart = new Date(currentYear, currentMonth, state.settings.cycleStartDay);
    if (date < cycleStart) {
        cycleStart.setMonth(cycleStart.getMonth() - 1);
    }
    
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    
    return { start: cycleStart, end: cycleEnd };
}

function getFilteredTransactions(filterType, date = new Date()) {
    const { start, end } = getCycleDates(date);

    // Base transactions
    let baseFiltered = state.transactions.filter(t => {
        const tDate = parseDateLocal(t.date);
        if (t.type === 'savings_deposit' && t.amount === 0 && t.goalId) return false;
        return tDate >= start && tDate < end;
    });

    // Add automatic savings deposits
    const autoSavings = [];
    state.savingsGoals.forEach(goal => {
        if (goal.startDate && goal.monthlyAmount && goal.depositDay) {
            const goalStart = new Date(goal.startDate);
            const cycleMonthStart = new Date(start);
            const cycleDateKey = cycleMonthStart.toISOString();
            
            const exists = state.transactions.some(t => t.goalId === goal.id && t.cycleDate === cycleDateKey);
            if (exists) return;

            const monthsDiff = (cycleMonthStart.getFullYear() - goalStart.getFullYear()) * 12 + (cycleMonthStart.getMonth() - goalStart.getMonth());
            
            if (monthsDiff >= 0 && (!goal.durationMonths || monthsDiff < goal.durationMonths)) {
                const depositDate = new Date(cycleMonthStart.getFullYear(), cycleMonthStart.getMonth(), goal.depositDay);
                if (depositDate >= start && depositDate < end) {
                    autoSavings.push({
                        id: `auto-savings-${goal.id}-${cycleDateKey}`,
                        name: `הפקדה: ${goal.name}`,
                        amount: goal.monthlyAmount,
                        type: 'savings_deposit',
                        date: formatDateLocal(depositDate),
                        isRecurring: true,
                        desc: 'הפקדה אוטומטית לחיסכון',
                        goalId: goal.id,
                        cycleDate: cycleDateKey
                    });
                }
            }
        }
    });

    let allTransactions = [...baseFiltered, ...autoSavings];

    if (filterType === 'income') {
        allTransactions = allTransactions.filter(t => t.type === 'fixed_income' || t.type === 'variable_income');
    } else if (filterType === 'expense') {
        allTransactions = allTransactions.filter(t => t.type === 'fixed_expense' || t.type === 'variable_expense');
    } else if (filterType === 'fixed') {
        allTransactions = allTransactions.filter(t => t.type === 'fixed_income' || t.type === 'fixed_expense');
    } else if (filterType === 'variable') {
        allTransactions = allTransactions.filter(t => t.type === 'variable_income' || t.type === 'variable_expense');
    } else if (filterType === 'savings') {
        allTransactions = allTransactions.filter(t => t.type === 'savings_deposit');
    }

    return allTransactions;
}

// --- Navigation & Routing ---
function navigate(path) {
    window.location.hash = path;
}

window.addEventListener('hashchange', () => {
    state.currentPath = window.location.hash.replace('#', '') || '/';
    render();
});

// --- Rendering Engine ---
function render() {
    const app = document.getElementById('app');
    
    // Check authentication
    const isAuthenticated = !!(state.settings.scriptUrl && state.settings.secretKey);
    
    if (!isAuthenticated && state.currentPath !== '/login') {
        navigate('/login');
        return;
    }

    if (isAuthenticated && state.currentPath === '/login') {
        navigate('/');
        return;
    }

    if (state.currentPath === '/login') {
        app.innerHTML = renderLogin();
        return;
    }

    const title = getPageTitle(state.currentPath);
    
    app.innerHTML = `
        <div class="min-h-screen bg-background text-on-surface">
            ${renderTopAppBar(title)}
            <main id="main-content" class="max-w-2xl mx-auto px-4 pt-24 pb-32">
                ${renderPage(state.currentPath)}
            </main>
            ${renderBottomNavBar()}
        </div>
    `;

    // Re-attach event listeners and initialize charts if needed
    attachEventListeners();
    initCharts();
}

function getPageTitle(path) {
    switch (path) {
        case '/settings': return 'הגדרות';
        case '/savings': return 'חסכונות';
        case '/forecast': return 'תחזית';
        case '/transactions': return 'עסקאות';
        default: return '';
    }
}

function renderTopAppBar(title) {
    return `
        <header class="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md z-40 border-b border-surface-variant/30 px-4">
            <div class="max-w-2xl mx-auto h-full flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                        <img src="${state.settings.profileImage}" alt="Profile" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-primary leading-tight">BudgetPro</h1>
                        <p class="text-xs text-on-surface-variant">שלום, ${state.settings.userName}</p>
                    </div>
                </div>
                ${title ? `<h2 class="text-lg font-semibold absolute left-1/2 -translate-x-1/2">${title}</h2>` : ''}
                <div class="flex items-center gap-2">
                    <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors">
                        <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
                    </button>
                    <button onclick="navigate('/settings')" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors">
                        <span class="material-symbols-outlined text-on-surface-variant">settings</span>
                    </button>
                </div>
            </div>
        </header>
    `;
}

function renderBottomNavBar() {
    const items = [
        { path: '/', icon: 'home', label: 'בית' },
        { path: '/transactions', icon: 'list_alt', label: 'עסקאות' },
        { path: '/savings', icon: 'savings', label: 'חסכונות' },
        { path: '/forecast', icon: 'trending_up', label: 'תחזית' },
    ];

    return `
        <nav class="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-surface-variant/30 z-40 safe-area-bottom">
            <div class="max-w-2xl mx-auto flex justify-around items-center h-16">
                ${items.map(item => {
                    const isActive = state.currentPath === item.path;
                    return `
                        <button onclick="navigate('${item.path}')" class="flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${isActive ? 'text-primary' : 'text-on-surface-variant'}">
                            <div class="relative">
                                <span class="material-symbols-outlined text-[24px] ${isActive ? 'font-fill' : ''}">${item.icon}</span>
                                ${isActive ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>' : ''}
                            </div>
                            <span class="text-[10px] font-medium">${item.label}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        </nav>
    `;
}

function renderPage(path) {
    switch (path) {
        case '/': return renderHome();
        case '/transactions': return renderTransactions();
        case '/savings': return renderSavings();
        case '/forecast': return renderForecast();
        case '/settings': return renderSettings();
        default: return renderHome();
    }
}

// --- Page Renderers ---

function renderHome() {
    const { start, end } = getCycleDates();
    const currentTransactions = getFilteredTransactions('all');
    
    const income = currentTransactions
        .filter(t => t.type === 'fixed_income' || t.type === 'variable_income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const expenses = currentTransactions
        .filter(t => t.type === 'fixed_expense' || t.type === 'variable_expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const savings = currentTransactions
        .filter(t => t.type === 'savings_deposit')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = income - expenses - savings;
    const totalBalance = state.accountBalances.reduce((sum, acc) => sum + acc.amount, 0);

    return `
        <div class="space-y-6">
            <!-- Balance Card -->
            <div class="bg-primary rounded-3xl p-6 text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div class="relative z-10">
                    <p class="text-sm opacity-80 mb-1">יתרה כוללת בנכסים</p>
                    <h2 class="text-3xl font-bold mb-6">${formatCurrency(totalBalance)}</h2>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                            <p class="text-[10px] opacity-80 uppercase tracking-wider mb-1">הכנסות החודש</p>
                            <p class="text-lg font-bold">${formatCurrency(income)}</p>
                        </div>
                        <div class="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                            <p class="text-[10px] opacity-80 uppercase tracking-wider mb-1">הוצאות החודש</p>
                            <p class="text-lg font-bold">${formatCurrency(expenses + savings)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-4 gap-2">
                <button onclick="renderTransactionModal({ type: 'variable_income' })" class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <span class="material-symbols-outlined">add</span>
                    </div>
                    <span class="text-[10px] font-medium">הכנסה</span>
                </button>
                <button onclick="renderTransactionModal({ type: 'variable_expense' })" class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors">
                    <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                        <span class="material-symbols-outlined">remove</span>
                    </div>
                    <span class="text-[10px] font-medium">הוצאה</span>
                </button>
                <button onclick="renderSavingsModal()" class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors">
                    <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        <span class="material-symbols-outlined">savings</span>
                    </div>
                    <span class="text-[10px] font-medium">חיסכון</span>
                </button>
                <button onclick="renderAccountModal()" class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors">
                    <div class="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                        <span class="material-symbols-outlined">account_balance</span>
                    </div>
                    <span class="text-[10px] font-medium">חשבון</span>
                </button>
            </div>

            <!-- Savings Goals -->
            <section>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold">החסכונות שלי</h3>
                    <button onclick="navigate('/savings')" class="text-sm text-primary font-medium">נהל הכל</button>
                </div>
                <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                    ${state.savingsGoals.map(goal => `
                        <div class="min-w-[200px] ${goal.container} rounded-3xl p-4 flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <div class="w-10 h-10 rounded-2xl ${goal.color} flex items-center justify-center text-white shadow-sm">
                                    <span class="material-symbols-outlined">${goal.icon}</span>
                                </div>
                                <span class="text-[10px] font-bold ${goal.onContainer} opacity-60">${Math.round((goal.current / goal.target) * 100)}%</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm ${goal.onContainer}">${goal.name}</h4>
                                <p class="text-xs ${goal.onContainer} opacity-70">${formatCurrency(goal.current)} מתוך ${formatCurrency(goal.target)}</p>
                            </div>
                            <div class="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                                <div class="h-full ${goal.color}" style="width: ${(goal.current / goal.target) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Fixed Expenses -->
            <section>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold">הוצאות קבועות החודש</h3>
                    <button onclick="navigate('/transactions?filter=fixed')" class="text-sm text-primary font-bold hover:underline">נהל הכל</button>
                </div>
                <div class="bg-white rounded-3xl p-6 border border-surface-variant/30 shadow-sm">
                    <div class="space-y-4">
                        ${currentTransactions.filter(t => t.type === 'fixed_expense').slice(0, 4).map(t => `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                                        <span class="material-symbols-outlined text-sm">${TRANSACTION_TYPES[t.type].icon}</span>
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold">${t.name}</p>
                                        <p class="text-[10px] text-on-surface-variant">${t.date}</p>
                                    </div>
                                </div>
                                <p class="font-bold text-rose-600">${formatCurrency(t.amount)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        </div>
    `;
}

function renderTransactions() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const filterType = urlParams.get('filter') || 'all';
    const selectedCategory = urlParams.get('category') || 'all';
    
    const transactions = getFilteredTransactions(filterType);
    const categoryFiltered = selectedCategory === 'all' ? transactions : transactions.filter(t => t.category === selectedCategory);
    
    const income = transactions.filter(t => t.type.includes('income')).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type.includes('expense') || t.type === 'savings_deposit').reduce((sum, t) => sum + t.amount, 0);
    const remaining = income - expenses;

    return `
        <div class="space-y-8 pb-10">
            <!-- Remaining to Spend -->
            <div class="bg-surface-variant/20 p-8 rounded-[40px] text-center border border-surface-variant/30">
                <p class="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">נותר לבזבז החודש</p>
                <h2 class="text-5xl font-black text-primary tracking-tighter">${formatCurrency(remaining)}</h2>
            </div>

            <!-- Actions Title -->
            <div class="px-2">
                <h3 class="text-2xl font-bold mb-1">פעולות במחזור החודשי</h3>
                <p class="text-on-surface-variant text-sm">ניהול ומעקב אחר כל התנועות הכספיות שלך.</p>
            </div>

            <!-- Categories -->
            <div class="space-y-4">
                <h4 class="text-lg font-bold px-2">חלוקה לקטגוריות</h4>
                <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
                    <button onclick="updateTransactionFilter('category', 'all')" class="px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-white text-on-surface border border-surface-variant/30'}">הכל</button>
                    ${state.categories.map(cat => `
                        <button onclick="updateTransactionFilter('category', '${cat}')" class="px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-on-surface border border-surface-variant/30'}">${cat}</button>
                    `).join('')}
                </div>
            </div>

            <!-- Filter Navigation -->
            <div class="flex bg-surface-variant/20 p-1.5 rounded-2xl">
                ${['all', 'fixed', 'variable', 'income', 'expense'].map(f => `
                    <button onclick="updateTransactionFilter('filter', '${f}')" class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${filterType === f ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}">
                        ${f === 'all' ? 'הכל' : f === 'fixed' ? 'קבועות' : f === 'variable' ? 'משתנות' : f === 'income' ? 'הכנסות' : 'הוצאות'}
                    </button>
                `).join('')}
            </div>

            <!-- Transaction List -->
            <div class="space-y-4">
                ${categoryFiltered.length > 0 ? categoryFiltered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => `
                    <div onclick="renderTransactionModal(${JSON.stringify(t).replace(/"/g, '&quot;')})" class="bg-white p-5 rounded-3xl flex items-center justify-between shadow-sm border border-surface-variant/10 active:scale-[0.98] transition-all cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl ${TRANSACTION_TYPES[t.type].color.replace('text', 'bg')}/10 flex items-center justify-center ${TRANSACTION_TYPES[t.type].color}">
                                <span class="material-symbols-outlined text-2xl">${TRANSACTION_TYPES[t.type].icon}</span>
                            </div>
                            <div>
                                <p class="font-extrabold text-on-surface">${t.name}</p>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-bold text-on-surface-variant uppercase opacity-60">${t.category || 'כללי'}</span>
                                    <span class="w-1 h-1 bg-surface-variant rounded-full"></span>
                                    <span class="text-[10px] font-bold text-on-surface-variant opacity-60">${t.date}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-left">
                            <p class="font-black text-lg ${t.type.includes('income') ? 'text-emerald-600' : 'text-rose-600'}">
                                ${t.type.includes('income') ? '+' : '-'}${formatCurrency(t.amount)}
                            </p>
                            ${t.isRecurring ? '<span class="text-[8px] font-bold bg-surface-variant/30 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">קבוע</span>' : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center py-20 opacity-40">
                        <span class="material-symbols-outlined text-6xl mb-4">history</span>
                        <p class="font-bold">אין תנועות להצגה</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function updateTransactionFilter(key, value) {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    urlParams.set(key, value);
    if (key === 'filter') urlParams.set('category', 'all'); // Reset category when changing main filter
    navigate(`/transactions?${urlParams.toString()}`);
}

function renderSavings() {
    const totalTarget = state.savingsGoals.reduce((acc, goal) => acc + goal.target, 0);
    const totalCurrent = state.savingsGoals.reduce((acc, goal) => acc + goal.current, 0);
    const totalRemaining = totalTarget - totalCurrent;

    const currentCycleTransactions = getFilteredTransactions('all');
    const monthlySavings = currentCycleTransactions
        .filter(t => t.type === 'savings_deposit')
        .reduce((acc, t) => acc + t.amount, 0);

    return `
        <div class="space-y-8 pb-10">
            <!-- Summary Section -->
            <section class="bg-white p-8 rounded-3xl border border-surface-variant/30 shadow-sm space-y-8 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                
                <div class="relative z-10 text-center space-y-2">
                    <span class="text-on-surface-variant font-bold text-xs uppercase tracking-widest">סה״כ נחסך</span>
                    <div class="flex flex-col items-center gap-2">
                        <h2 class="text-4xl font-black text-primary tracking-tighter">${formatCurrency(totalCurrent, false)}</h2>
                        <div class="flex items-center gap-2">
                            <span class="text-primary font-bold text-xs bg-primary-container px-3 py-1 rounded-full shadow-sm">
                                ${totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0}% מהיעד הכולל
                            </span>
                        </div>
                    </div>
                </div>

                <div class="relative z-10 grid grid-cols-2 gap-0 pt-6 border-t border-surface-variant/30">
                    <div class="flex flex-col items-center border-l border-surface-variant/30">
                        <p class="text-primary font-bold text-[10px] uppercase tracking-widest mb-1 opacity-70">הוקצה החודש</p>
                        <h3 class="text-2xl font-extrabold text-primary tracking-tighter">${formatCurrency(monthlySavings, false)}</h3>
                    </div>
                    <div class="flex flex-col items-center">
                        <p class="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest mb-1 opacity-70">נותר ליעד</p>
                        <h3 class="text-2xl font-extrabold text-on-surface tracking-tighter">${formatCurrency(totalRemaining, false)}</h3>
                    </div>
                </div>
            </section>

            <!-- Savings Goals List -->
            <section class="space-y-4">
                <div class="flex justify-between items-center px-2">
                    <h3 class="text-2xl font-extrabold tracking-tight">יעדי חיסכון</h3>
                    <button class="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">add</span>
                        <span>הוסף חיסכון</span>
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${state.savingsGoals.map(goal => {
                        const progress = (goal.current / goal.target) * 100;
                        const startDate = goal.startDate ? new Date(goal.startDate) : new Date();
                        const duration = goal.durationMonths || 12;
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + duration);
                        
                        const now = new Date();
                        const currentMonthStr = now.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
                        const elapsedMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
                        const timeProgress = Math.min(100, Math.max(0, (elapsedMonths / duration) * 100));

                        return `
                            <div class="bg-white p-6 rounded-3xl border border-surface-variant/30 shadow-sm space-y-6 group hover:border-primary/20 transition-colors relative overflow-hidden cursor-pointer">
                                <div class="flex justify-between items-start relative z-10">
                                    <div class="flex items-center gap-4">
                                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${goal.container} ${goal.onContainer}">
                                            <span class="material-symbols-outlined text-3xl">${goal.icon}</span>
                                        </div>
                                        <div>
                                            <h4 class="font-extrabold text-lg">${goal.name}</h4>
                                            <p class="text-xs text-on-surface-variant font-bold">${formatCurrency(goal.current)} מתוך ${formatCurrency(goal.target)}</p>
                                            ${goal.monthlyAmount ? `<p class="text-[10px] font-black mt-0.5 ${goal.color.replace('bg-', 'text-')}">הפקדה חודשית: ${formatCurrency(goal.monthlyAmount)}</p>` : ''}
                                        </div>
                                    </div>
                                    <div class="text-left">
                                        <span class="text-xs font-black px-3 py-1 rounded-full shadow-sm ${goal.container} ${goal.onContainer}">
                                            ${Math.round(progress)}%
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="space-y-4 relative z-10">
                                    <div class="relative pt-4">
                                        <div class="h-3 w-full bg-surface-variant/20 rounded-full overflow-hidden">
                                            <div class="h-full rounded-full relative z-10 shadow-inner ${goal.color}" style="width: ${progress}%"></div>
                                        </div>
                                        <div class="absolute top-0 h-8 w-px bg-on-surface/30 z-20 flex flex-col items-center" style="right: ${timeProgress}%">
                                            <div class="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm -mt-1 ${goal.color}"></div>
                                            <div class="mt-4 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md whitespace-nowrap flex flex-col items-center gap-0.5 ${goal.color}">
                                                <span>${currentMonthStr}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter px-1 pt-2">
                                        <div class="flex flex-col items-start">
                                            <span class="opacity-50 mb-0.5">התחלה</span>
                                            <span>${startDate.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}</span>
                                        </div>
                                        <div class="flex flex-col items-end">
                                            <span class="opacity-50 mb-0.5">סיום משוער</span>
                                            <span>${endDate.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>
        </div>
    `;
}

function renderForecast() {
    const totalBalance = state.accountBalances.reduce((sum, acc) => sum + acc.amount, 0);
    const forecastData = generateForecastData();
    const yearEndTotal = forecastData[11].total;
    const growthPercent = ((yearEndTotal - totalBalance) / totalBalance * 100).toFixed(1);

    return `
        <div class="space-y-8 pb-10">
            <div class="flex flex-col gap-6">
                <div>
                    <h1 class="text-3xl font-extrabold text-on-surface tracking-tight mb-2">תחזית</h1>
                    <p class="text-on-surface-variant text-sm">ניתוח מעמיק של מסלול הצמיחה הפיננסי שלך ל-12 החודשים הקרובים.</p>
                </div>
                
                <!-- Summary Card -->
                <div class="bg-primary-container p-6 rounded-3xl shadow-sm flex flex-col gap-1">
                    <span class="text-on-primary-container font-semibold text-xs">צפי הון בעוד שנה (עו״ש + חסכונות)</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-on-primary-container">${formatCurrency(yearEndTotal, true)}</span>
                        <span class="font-bold text-xs px-2 py-0.5 rounded-full ${parseFloat(growthPercent) >= 0 ? 'bg-white/30 text-on-primary-container' : 'bg-error/20 text-error'}">
                            ${parseFloat(growthPercent) >= 0 ? '+' : ''}${growthPercent}%
                        </span>
                    </div>
                </div>
            </div>

            <!-- Growth Chart -->
            <div class="space-y-4">
                <div class="px-2">
                    <h3 class="text-2xl font-bold">מגמת צמיחה משוערת</h3>
                    <p class="text-on-surface-variant text-sm">תחזית צמיחת הנכסים והחסכונות שלך ל-12 החודשים הקרובים.</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-surface-variant/30 shadow-sm">
                    <div class="h-72 w-full">
                        <canvas id="growthChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Monthly Forecast List -->
            <div class="space-y-6">
                <h3 class="text-2xl font-bold px-2">פירוט חודשי צפוי</h3>
                <div class="space-y-4">
                    ${forecastData.map(item => `
                        <div class="bg-white p-6 rounded-3xl border border-surface-variant/30 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span class="material-symbols-outlined">calendar_today</span>
                                    </div>
                                    <h4 class="text-lg font-extrabold">${item.fullMonth}</h4>
                                </div>
                                <div class="text-left">
                                    <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">יתרה סופית</p>
                                    <p class="text-lg font-black text-primary">${formatCurrency(item.total)}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-surface-variant/10">
                                <div>
                                    <p class="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">הכנסות</p>
                                    <p class="text-sm font-bold text-emerald-600">${formatCurrency(item.income)}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">הוצאות</p>
                                    <p class="text-sm font-bold text-rose-600">${formatCurrency(-(item.expense + item.saving))}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateForecastData() {
    const data = [];
    let currentChecking = state.accountBalances.filter(a => a.type === 'checking').reduce((s, a) => s + a.amount, 0);
    let currentSavings = state.accountBalances.filter(a => a.type !== 'checking').reduce((s, a) => s + a.amount, 0);
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
        const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        
        const fixedIncome = state.transactions
            .filter(t => t.type === 'fixed_income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const fixedExpenses = state.transactions
            .filter(t => t.type === 'fixed_expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const savingsDeposit = state.savingsGoals.reduce((sum, goal) => {
            return sum + (goal.monthlyAmount || 0);
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
}

function renderSettings() {
    const fixedExpenses = state.transactions.filter(t => t.type === 'fixed_expense');
    const fixedIncome = state.transactions.filter(t => t.type === 'fixed_income');

    return `
        <div class="space-y-8 pb-10">
            <!-- Profile Header -->
            <section class="flex flex-col items-center text-center space-y-4 py-4">
                <div class="relative group">
                    <div class="relative w-24 h-24 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                        <img id="profile-img-preview" alt="Profile" class="w-full h-full object-cover" src="${state.settings.profileImage}" referrerPolicy="no-referrer">
                    </div>
                    <button onclick="document.getElementById('profile-upload').click()" class="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <input type="file" id="profile-upload" class="hidden" accept="image/*" onchange="handleProfileImageUpload(event)">
                </div>
                <div class="flex flex-col items-center">
                    <h2 class="text-2xl font-extrabold tracking-tight">${state.settings.userName}</h2>
                    <p class="text-on-surface-variant text-sm font-medium">${state.settings.email || 'yonatan.i@example.com'}</p>
                </div>
            </section>

            <!-- Monthly Cycle Settings -->
            <section class="space-y-4">
                <div class="flex items-center gap-2 mb-2">
                    <span class="material-symbols-outlined text-primary">calendar_month</span>
                    <h3 class="text-lg font-bold">מחזור חודשי</h3>
                </div>
                <div class="bg-surface-variant/10 rounded-3xl p-6 space-y-6 border border-surface-variant/30">
                    <div>
                        <label class="text-sm font-bold text-on-surface-variant mb-4 block">יום תחילת החודש התקציבי</label>
                        <div class="grid grid-cols-4 gap-3">
                            ${[1, 2, 10, 15].map(day => `
                                <button onclick="updateCycleStartDay(${day})" class="py-3 rounded-xl font-bold transition-all shadow-sm ${state.settings.cycleStartDay === day ? 'bg-primary text-white' : 'bg-white text-on-surface hover:bg-surface-variant/20'}">
                                    ${day}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </section>

            <!-- Fixed Income -->
            <section class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">payments</span>
                        <h3 class="text-lg font-bold">הכנסות קבועות</h3>
                    </div>
                    <button onclick="renderTransactionModal({ type: 'fixed_income' })" class="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                        <span class="material-symbols-outlined text-sm">add_circle</span>
                        הוספת הכנסה
                    </button>
                </div>
                <div class="space-y-3">
                    ${fixedIncome.map(item => `
                        <div onclick="renderTransactionModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border-r-4 border-primary cursor-pointer active:scale-[0.98] transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span class="material-symbols-outlined">work</span>
                                </div>
                                <div>
                                    <p class="font-bold">${item.name}</p>
                                    <p class="text-xs text-on-surface-variant">${item.desc || 'הכנסה קבועה'}</p>
                                </div>
                            </div>
                            <span class="font-extrabold text-primary text-lg">${formatCurrency(item.amount)}</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Fixed Expenses -->
            <section class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-rose-600">receipt_long</span>
                        <h3 class="text-lg font-bold">הוצאות קבועות</h3>
                    </div>
                    <button onclick="renderTransactionModal({ type: 'fixed_expense' })" class="text-rose-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        <span class="material-symbols-outlined text-sm">add_circle</span>
                        הוספת הוצאה
                    </button>
                </div>
                <div class="space-y-3">
                    ${fixedExpenses.map(item => `
                        <div onclick="renderTransactionModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-surface-variant/30 cursor-pointer active:scale-[0.98] transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                    <span class="material-symbols-outlined">home</span>
                                </div>
                                <div>
                                    <p class="font-bold">${item.name}</p>
                                    <span class="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] rounded-full font-bold">חודשי</span>
                                </div>
                            </div>
                            <p class="font-extrabold text-rose-600 text-lg">${formatCurrency(item.amount)}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <button onclick="logout()" class="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-rose-100 transition-all mt-6">
                <span class="material-symbols-outlined">logout</span>
                התנתקות מהמערכת
            </button>
        </div>
    `;
}

function updateCycleStartDay(day) {
    state.settings.cycleStartDay = day;
    localStorage.setItem('budget_settings', JSON.stringify(state.settings));
    render();
}

function logout() {
    state.settings.scriptUrl = '';
    state.settings.secretKey = '';
    state.isAuthenticated = false;
    localStorage.removeItem('budget_settings');
    render();
}

function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            state.settings.profileImage = base64;
            localStorage.setItem('budget_settings', JSON.stringify(state.settings));
            saveDataToGAS(); // Save settings to GAS
            render();
        };
        reader.readAsDataURL(file);
    }
}

function renderLogin() {
    return `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div class="w-full max-w-sm space-y-8">
                <div class="text-center">
                    <div class="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-on-primary mx-auto mb-6 shadow-xl shadow-primary/20">
                        <span class="material-symbols-outlined text-4xl">account_balance_wallet</span>
                    </div>
                    <h1 class="text-3xl font-bold text-primary mb-2">BudgetPro</h1>
                    <p class="text-on-surface-variant">התחבר למערכת ניהול התקציב שלך</p>
                </div>

                <div class="space-y-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium px-1">כתובת Script</label>
                        <input type="text" id="scriptUrl" placeholder="https://script.google.com/..." class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium px-1">מפתח סודי</label>
                        <input type="password" id="secretKey" placeholder="••••••••" class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                    <button onclick="handleLogin()" class="w-full h-14 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
                        התחברות
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- API Communication ---
async function fetchDataFromGAS() {
    if (!state.settings.scriptUrl || !state.settings.secretKey) return;
    
    try {
        const response = await fetch(`${state.settings.scriptUrl}?secretKey=${state.settings.secretKey}&action=getData`);
        const result = await response.json();
        
        if (result.status === 'success') {
            state.transactions = result.data.transactions || [];
            state.savingsGoals = result.data.savingsGoals || [];
            state.accountBalances = result.data.accountBalances || [];
            if (result.data.settings) {
                state.settings = { ...state.settings, ...result.data.settings };
            }
            render();
        } else {
            console.error('Failed to fetch data:', result.message);
            if (result.message === 'Invalid secret key') {
                logout();
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function saveDataToGAS(action, data) {
    if (!state.settings.scriptUrl || !state.settings.secretKey) return;
    
    try {
        const response = await fetch(state.settings.scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secretKey: state.settings.secretKey,
                action: action,
                data: data
            })
        });
        
        setTimeout(fetchDataFromGAS, 1000);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// --- Modal Management ---
function openModal(contentHtml) {
    const container = document.getElementById('modal-container');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = contentHtml;
    container.classList.remove('hidden');
    
    // Trigger animations
    setTimeout(() => {
        backdrop.classList.replace('opacity-0', 'opacity-100');
        content.classList.replace('translate-y-full', 'translate-y-0');
    }, 10);
}

function closeModal() {
    const container = document.getElementById('modal-container');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    backdrop.classList.replace('opacity-100', 'opacity-0');
    content.classList.replace('translate-y-0', 'translate-y-full');
    
    setTimeout(() => {
        container.classList.add('hidden');
    }, 300);
}

function renderTransactionModal(transaction = null) {
    const isEdit = !!transaction;
    const title = isEdit ? 'עריכת תנועה' : 'תנועה חדשה';
    
    const html = `
        <div class="space-y-6">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-2xl font-black text-primary">${title}</h2>
                <button onclick="closeModal()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="transaction-form" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">שם התנועה</label>
                    <input type="text" name="name" value="${transaction?.name || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">סכום</label>
                        <input type="number" step="0.01" name="amount" value="${transaction?.amount || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">תאריך</label>
                        <input type="date" name="date" value="${transaction?.date || formatDateLocal(new Date())}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                </div>
                
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">סוג תנועה</label>
                    <select name="type" class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all appearance-none">
                        ${Object.entries(TRANSACTION_TYPES).map(([key, val]) => `
                            <option value="${key}" ${transaction?.type === key ? 'selected' : ''}>${val.label}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">קטגוריה</label>
                    <select name="category" class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all appearance-none">
                        ${state.categories.map(cat => `
                            <option value="${cat}" ${transaction?.category === cat ? 'selected' : ''}>${cat}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="flex items-center gap-2 py-2">
                    <input type="checkbox" id="isRecurring" name="isRecurring" ${transaction?.isRecurring ? 'checked' : ''} class="w-5 h-5 rounded border-surface-variant text-primary focus:ring-primary">
                    <label for="isRecurring" class="text-sm font-bold">תנועה קבועה (מדי חודש)</label>
                </div>
                
                <div class="pt-4 flex gap-3">
                    <button type="submit" class="flex-1 h-14 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        ${isEdit ? 'עדכון תנועה' : 'הוספת תנועה'}
                    </button>
                    ${isEdit ? `
                        <button type="button" onclick="handleDeleteTransaction('${transaction.id}')" class="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    ` : ''}
                </div>
            </form>
        </div>
    `;
    
    openModal(html);
    
    document.getElementById('transaction-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            id: transaction?.id || Date.now().toString(),
            name: formData.get('name'),
            amount: parseFloat(formData.get('amount')),
            date: formData.get('date'),
            type: formData.get('type'),
            category: formData.get('category'),
            isRecurring: formData.get('isRecurring') === 'on',
            desc: formData.get('name')
        };
        
        handleSaveTransaction(data, isEdit);
    };
}

function handleSaveTransaction(data, isEdit) {
    if (isEdit) {
        state.transactions = state.transactions.map(t => t.id === data.id ? data : t);
        saveDataToGAS('updateTransaction', data);
    } else {
        state.transactions.push(data);
        saveDataToGAS('addTransaction', data);
    }
    closeModal();
    render();
}

function handleDeleteTransaction(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק תנועה זו?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveDataToGAS('deleteTransaction', { id });
        closeModal();
        render();
    }
}

function renderSavingsModal(goal = null) {
    const isEdit = !!goal;
    const title = isEdit ? 'עריכת חיסכון' : 'חיסכון חדש';
    
    const html = `
        <div class="space-y-6">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-2xl font-black text-primary">${title}</h2>
                <button onclick="closeModal()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="savings-form" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">שם היעד</label>
                    <input type="text" name="name" value="${goal?.name || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">יעד סופי</label>
                        <input type="number" name="target" value="${goal?.target || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">סכום נוכחי</label>
                        <input type="number" name="current" value="${goal?.current || '0'}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">הפקדה חודשית</label>
                        <input type="number" name="monthlyAmount" value="${goal?.monthlyAmount || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">יום הפקדה</label>
                        <input type="number" name="depositDay" value="${goal?.depositDay || '10'}" min="1" max="31" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">צבע</label>
                    <div class="grid grid-cols-5 gap-2">
                        ${PASTEL_COLORS.map(c => `
                            <button type="button" onclick="selectColor('${c.color}')" class="w-full aspect-square rounded-xl ${c.color} border-4 ${goal?.color === c.color ? 'border-primary' : 'border-transparent'}"></button>
                        `).join('')}
                    </div>
                    <input type="hidden" name="color" value="${goal?.color || PASTEL_COLORS[0].color}">
                </div>
                
                <div class="pt-4 flex gap-3">
                    <button type="submit" class="flex-1 h-14 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        ${isEdit ? 'עדכון יעד' : 'הוספת יעד'}
                    </button>
                    ${isEdit ? `
                        <button type="button" onclick="handleDeleteSavings('${goal.id}')" class="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    ` : ''}
                </div>
            </form>
        </div>
    `;
    
    openModal(html);
    
    document.getElementById('savings-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedColor = PASTEL_COLORS.find(c => c.color === formData.get('color'));
        
        const data = {
            id: goal?.id || Date.now().toString(),
            name: formData.get('name'),
            target: parseFloat(formData.get('target')),
            current: parseFloat(formData.get('current')),
            monthlyAmount: parseFloat(formData.get('monthlyAmount')),
            depositDay: parseInt(formData.get('depositDay')),
            color: selectedColor.color,
            container: selectedColor.container,
            onContainer: selectedColor.onContainer,
            icon: goal?.icon || 'savings',
            startDate: goal?.startDate || formatDateLocal(new Date())
        };
        
        handleSaveSavings(data, isEdit);
    };
}

function selectColor(color) {
    document.querySelector('input[name="color"]').value = color;
    document.querySelectorAll('#savings-form button[onclick^="selectColor"]').forEach(btn => {
        btn.classList.replace('border-primary', 'border-transparent');
        if (btn.classList.contains(color)) {
            btn.classList.replace('border-transparent', 'border-primary');
        }
    });
}

function handleSaveSavings(data, isEdit) {
    if (isEdit) {
        state.savingsGoals = state.savingsGoals.map(g => g.id === data.id ? data : g);
        saveDataToGAS('updateSavingsGoal', data);
    } else {
        state.savingsGoals.push(data);
        saveDataToGAS('addSavingsGoal', data);
    }
    closeModal();
    render();
}

function handleDeleteSavings(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק יעד זה?')) {
        state.savingsGoals = state.savingsGoals.filter(g => g.id !== id);
        saveDataToGAS('deleteSavingsGoal', { id });
        closeModal();
        render();
    }
}

function renderAccountModal(account = null) {
    const isEdit = !!account;
    const title = isEdit ? 'עריכת חשבון' : 'חשבון חדש';
    
    const html = `
        <div class="space-y-6">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-2xl font-black text-primary">${title}</h2>
                <button onclick="closeModal()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="account-form" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">שם החשבון</label>
                    <input type="text" name="name" value="${account?.name || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                </div>
                
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">יתרה נוכחית</label>
                    <input type="number" name="amount" value="${account?.amount || ''}" required class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all">
                </div>
                
                <div class="space-y-1">
                    <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">סוג חשבון</label>
                    <select name="type" class="w-full h-14 px-4 rounded-2xl bg-surface-variant/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all appearance-none">
                        <option value="checking" ${account?.type === 'checking' ? 'selected' : ''}>עו״ש</option>
                        <option value="savings" ${account?.type === 'savings' ? 'selected' : ''}>חיסכון / השקעה</option>
                    </select>
                </div>
                
                <div class="pt-4 flex gap-3">
                    <button type="submit" class="flex-1 h-14 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        ${isEdit ? 'עדכון חשבון' : 'הוספת חשבון'}
                    </button>
                    ${isEdit ? `
                        <button type="button" onclick="handleDeleteAccount('${account.id}')" class="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    ` : ''}
                </div>
            </form>
        </div>
    `;
    
    openModal(html);
    
    document.getElementById('account-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const data = {
            id: account?.id || Date.now().toString(),
            name: formData.get('name'),
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            lastUpdated: new Date().toISOString()
        };
        
        handleSaveAccount(data, isEdit);
    };
}

function handleSaveAccount(data, isEdit) {
    if (isEdit) {
        state.accountBalances = state.accountBalances.map(a => a.id === data.id ? data : a);
        saveDataToGAS('updateAccount', data);
    } else {
        state.accountBalances.push(data);
        saveDataToGAS('addAccount', data);
    }
    closeModal();
    render();
}

function handleDeleteAccount(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק חשבון זה?')) {
        state.accountBalances = state.accountBalances.filter(a => a.id !== id);
        saveDataToGAS('deleteAccount', { id });
        closeModal();
        render();
    }
}

// --- Event Handlers ---
function handleLogin() {
    const secretKey = document.getElementById('secretKey').value;
    
    if (scriptUrl && secretKey) {
        state.settings.scriptUrl = scriptUrl;
        state.settings.secretKey = secretKey;
        localStorage.setItem('budget_settings', JSON.stringify(state.settings));
        render();
    } else {
        alert('אנא הזן כתובת Script ומפתח סודי');
    }
}

function attachEventListeners() {
    // Attach any dynamic event listeners here
}

function initCharts() {
    if (state.currentPath === '/forecast') {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        const forecastData = generateForecastData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: forecastData.map(d => d.month),
                datasets: [
                    {
                        label: 'נכסים',
                        data: forecastData.map(d => d.checking),
                        backgroundColor: '#FFB74D', // Pastel Orange
                        borderRadius: 4,
                        stack: 'Stack 0',
                    },
                    {
                        label: 'חיסכון',
                        data: forecastData.map(d => d.savings),
                        backgroundColor: '#64B5F6', // Pastel Blue
                        borderRadius: 4,
                        stack: 'Stack 0',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: { family: 'Assistant', weight: 'bold' }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value, false);
                            }
                        }
                    }
                }
            }
        });
    }
}

// --- Initialization ---
async function init() {
    const saved = localStorage.getItem('budget_settings');
    if (saved) {
        state.settings = JSON.parse(saved);
    }
    
    // Initial fetch from GAS if authenticated
    if (state.isAuthenticated) {
        try {
            await fetchDataFromGAS();
        } catch (e) {
            console.error('Initial fetch failed:', e);
        }
    }
    
    // Initial render
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.remove();
                render();
            }, 200);
        } else {
            render();
        }
    }, 1000);
}

init();
