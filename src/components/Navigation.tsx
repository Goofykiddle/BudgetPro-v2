import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useBudget } from '../context/BudgetContext';

/**
 * Shared Top Navigation Bar
 * Displays the app name, current page title, and user profile/wallet icons.
 */
export const TopAppBar: React.FC<{ title?: string }> = ({ title }) => {
  const { settings } = useBudget();
  const location = useLocation();
  const [showNotification, setShowNotification] = React.useState(false);
  const profileImageSrc = settings.profileImage?.trim() || null;

  React.useEffect(() => {
    const isDismissed = sessionStorage.getItem('banner_dismissed');
    
    if (location.pathname === '/' && !isDismissed) {
      const timer = setTimeout(() => setShowNotification(true), 1000);
      
      const handleScroll = () => {
        if (window.scrollY > 20) {
          setShowNotification(false);
          sessionStorage.setItem('banner_dismissed', 'true');
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      setShowNotification(false);
    }
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="relative flex flex-row-reverse justify-between items-center px-6 h-16 bg-primary-container/40 backdrop-blur-xl shadow-sm border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xl font-extrabold text-primary">BudgetPro</span>
            {title && <span className="text-primary font-bold text-lg leading-none">{title}</span>}
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {profileImageSrc ? (
              <img 
                alt="User profile" 
                className="w-full h-full object-cover"
                src={profileImageSrc}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="material-symbols-outlined text-primary">person</span>
            )}
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 hover:bg-primary/10">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
        </button>
      </div>

      {/* Notification Banner */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-16 left-0 w-full px-4 py-2 z-40 pointer-events-none"
          >
            <div className="max-w-md mx-auto bg-primary text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 pointer-events-auto border border-white/20">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white material-symbols-fill">notifications_active</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">היי {settings.userName}, שמחים שחזרת!</p>
                <p className="text-[11px] opacity-90 font-medium">הגיע הזמן לבדוק את התזרים החודשי שלך.</p>
              </div>
              <button 
                onClick={() => {
                  setShowNotification(false);
                  sessionStorage.setItem('banner_dismissed', 'true');
                }}
                className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/**
 * Shared Bottom Navigation Bar
 * Provides navigation between the main sections of the app.
 */
export const BottomNavBar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'בית', icon: 'home', path: '/' },
    { label: 'עסקאות', icon: 'receipt_long', path: '/transactions' },
    { label: 'חסכונות', icon: 'savings', path: '/savings' },
    { label: 'תחזית', icon: 'insights', path: '/forecast' },
    { label: 'הגדרות', icon: 'settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex flex-row-reverse justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-2xl rounded-t-3xl shadow-[0_-4px_20px_0_rgba(45,52,51,0.04)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center px-5 py-1.5 transition-all duration-200 ease-out active:scale-90 rounded-2xl",
              isActive ? "bg-primary-container text-primary" : "text-slate-400 hover:bg-primary/5"
            )}
          >
            <span className={cn("material-symbols-outlined", isActive && "material-symbols-fill")}>
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold tracking-tight mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
