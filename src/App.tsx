import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TopAppBar, BottomNavBar } from './components/Navigation';
import { Home } from './pages/Home';
import { Transactions } from './pages/Transactions';
import { Savings } from './pages/Savings';
import { Forecast } from './pages/Forecast';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { BudgetProvider, useBudget } from './context/BudgetContext';

/**
 * Main Layout Wrapper
 * Ensures consistent navigation and top bar across all pages.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { settings } = useBudget();
  
  // If not logged in and not on login page, redirect to login
  const isAuthenticated = !!(settings.scriptUrl && settings.secretKey);
  
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If logged in and on login page, redirect to home
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // Don't show nav bars on login page
  if (location.pathname === '/login') {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Determine page title based on route
  const getTitle = () => {
    switch (location.pathname) {
      case '/settings': return 'הגדרות';
      case '/savings': return 'חסכונות';
      case '/forecast': return 'תחזית';
      case '/transactions': return 'עסקאות';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar title={getTitle()} />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-32">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default function App() {
  return (
    <BudgetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </BudgetProvider>
  );
}
