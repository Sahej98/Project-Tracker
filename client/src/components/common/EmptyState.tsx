import React from 'react';

interface EmptyStateProps {
    message: string;
    icon?: React.ReactNode;
    compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, compact = false }) => {
    const paddingClass = compact ? 'py-2' : 'py-12';
    return (
        <div className={`text-center ${paddingClass}`}>
            {icon && <div className="flex justify-center mb-4 text-slate-400">{icon}</div>}
            <p className="text-sm text-slate-500 italic">{message}</p>
        </div>
    );
};

export default EmptyState;
