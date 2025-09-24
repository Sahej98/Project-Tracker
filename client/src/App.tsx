import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { LogoIcon } from './components/common/Icons';

const AppContent: React.FC = () => {
    const { currentUser, theme, isLoading } = useAppContext();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.colorScheme = theme;
    }, [theme]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[rgb(var(--bg-primary-rgb))] text-[rgb(var(--text-primary-rgb))] gap-4">
                <LogoIcon className="h-16 w-16 text-[rgb(var(--accent-primary-rgb))] animate-pulse" />
                <p className="text-lg font-semibold text-[rgb(var(--text-secondary-rgb))]">Loading Zenith...</p>
            </div>
        )
    }

    return (
      <div className="antialiased">
        {currentUser ? <Dashboard /> : <LoginPage />}
      </div>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
        <AppContent />
    </AppProvider>
  );
}

export default App;