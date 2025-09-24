import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  padding?: 'p-0' | 'p-2' | 'p-4' | 'p-5' | 'p-6';
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions, padding = 'p-6' }) => {
  return (
    <div className={`bg-[rgb(var(--bg-secondary-rgb))] rounded-xl border border-[rgb(var(--border-color-rgb))] shadow-sm ${className}`}>
        {(title || actions) && (
            <div className="px-4 pt-4 pb-4 sm:px-6 sm:pt-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                {title && <h3 className="text-lg font-bold text-[rgb(var(--text-primary-rgb))]">{title}</h3>}
                {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
        )}
        <div className={padding}>
            {children}
        </div>
    </div>
  );
};

export default Card;
