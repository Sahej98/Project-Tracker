import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { BellIcon } from './Icons';

const NotificationsPopover: React.FC = () => {
    const { notifications, markNotificationsAsRead } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (isOpen && !(event.target as HTMLElement).closest('.notification-popover-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = () => {
        markNotificationsAsRead();
    }

    return (
        <div className="relative notification-popover-container">
            <button onClick={handleToggle} className="relative p-2.5 rounded-full text-[rgb(var(--text-secondary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] transition-colors">
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[rgb(var(--bg-secondary-rgb))]"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[rgb(var(--bg-secondary-rgb))] rounded-lg shadow-2xl border border-[rgb(var(--border-color-rgb))] animate-fade-in-scale origin-top-right z-50">
                    <div className="p-3 border-b border-[rgb(var(--border-color-rgb))] flex justify-between items-center">
                        <h4 className="font-semibold text-[rgb(var(--text-primary-rgb))]">Notifications</h4>
                        {unreadCount > 0 && <button onClick={handleMarkAsRead} className="text-xs text-[rgb(var(--accent-primary-rgb))] hover:underline">Mark all as read</button>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(note => (
                                <div key={note.id} className={`p-3 border-b border-[rgb(var(--border-color-rgb))] last:border-b-0 ${!note.read ? 'bg-[rgba(var(--accent-primary-rgb),0.1)]' : ''}`}>
                                    <p className="text-sm text-[rgb(var(--text-primary-rgb))]">{note.message}</p>
                                    <p className="text-xs text-[rgb(var(--text-secondary-rgb))] mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-[rgb(var(--text-secondary-rgb))] text-center">No notifications yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPopover;