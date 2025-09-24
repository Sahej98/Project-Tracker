import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import NotificationsPopover from './NotificationsPopover';
import { SunIcon, MoonIcon, UserCircleIcon, PowerIcon, MenuIcon } from './Icons';

interface DashboardHeaderProps {
    onCommandPaletteToggle: () => void;
    onNavigateToProfile: () => void;
    onMobileMenuToggle: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onCommandPaletteToggle, onNavigateToProfile, onMobileMenuToggle }) => {
    const { currentUser, logout, theme, toggleTheme } = useAppContext();

    if (!currentUser) return null;

    return (
        <header className="bg-[rgb(var(--bg-secondary-rgb))] border-b border-[rgb(var(--border-color-rgb))] p-3 flex justify-between items-center sticky top-0 z-30 h-[65px] flex-shrink-0">
             <button onClick={onMobileMenuToggle} className="p-2.5 rounded-full text-[rgb(var(--text-secondary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] transition-colors lg:hidden">
                <MenuIcon className="w-5 h-5"/>
             </button>
             <div className="hidden lg:block"/>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button 
                    onClick={onCommandPaletteToggle} 
                    className="hidden sm:flex items-center text-sm text-[rgb(var(--text-secondary-rgb))] bg-transparent border border-[rgb(var(--border-color-rgb))] rounded-lg px-3 py-1.5 hover:bg-[rgb(var(--bg-tertiary-rgb))] transition-colors"
                >
                   Search... <kbd className="ml-4 font-sans font-semibold text-xs bg-[rgba(var(--bg-tertiary-rgb),0.8)] p-1 rounded-md border border-[rgb(var(--border-color-rgb))]"><span className="text-sm">⌘</span> K</kbd>
                </button>
                
                <button onClick={toggleTheme} title="Toggle Theme" className="p-2.5 rounded-full text-[rgb(var(--text-secondary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] transition-colors">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <NotificationsPopover />

                <div className="w-px h-6 bg-[rgb(var(--border-color-rgb))]"></div>

                <div className="group relative">
                    <button className="flex items-center gap-3 p-1 rounded-full transition-colors hover:bg-[rgb(var(--bg-tertiary-rgb))]">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-64 bg-[rgb(var(--bg-secondary-rgb))] rounded-lg shadow-2xl border border-[rgb(var(--border-color-rgb))] p-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform scale-95 group-hover:scale-100 origin-top-right z-10">
                         <div className="px-3 py-4 border-b border-[rgb(var(--border-color-rgb))] flex items-center gap-3">
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-bold text-sm text-[rgb(var(--text-primary-rgb))] truncate">{currentUser.name}</p>
                                <p className="text-xs text-[rgb(var(--text-secondary-rgb))] truncate">{currentUser.email}</p>
                            </div>
                         </div>
                         <div className="p-1 mt-1">
                            <button
                                onClick={onNavigateToProfile}
                                title="My Profile"
                                className="w-full flex items-center text-sm hover:bg-[rgba(var(--bg-tertiary-rgb),0.8)] text-[rgb(var(--text-primary-rgb))] font-medium p-2 rounded-md transition-colors"
                            >
                                <UserCircleIcon className="h-5 w-5 mr-3 text-[rgb(var(--text-secondary-rgb))]"/>
                                My Profile
                            </button>
                         </div>
                         <div className="p-1 mt-1 border-t border-[rgb(var(--border-color-rgb))]">
                            <button
                                onClick={logout}
                                title="Logout"
                                className="w-full flex items-center text-sm hover:bg-red-500/10 text-red-500 font-medium p-2 rounded-md transition-colors"
                            >
                                <PowerIcon className="h-5 w-5 mr-3"/>
                                Logout
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
