import React, { ReactNode } from 'react';

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
    title: string;
    icon?: ReactNode;
    footer?: ReactNode;
    size?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-4xl';
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title, icon, footer, size = 'max-w-lg' }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className={`w-full ${size} transform transition-all duration-300 animate-fade-in-scale max-h-[90vh] flex`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-[rgb(var(--bg-secondary-rgb))] rounded-xl shadow-2xl flex flex-col h-full border border-[rgb(var(--border-color-rgb))] w-full">
                    <div className="p-5 border-b border-[rgb(var(--border-color-rgb))] flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {icon}
                            <h2 id="modal-title" className="text-lg font-bold text-[rgb(var(--text-primary-rgb))]">{title}</h2>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-[rgb(var(--text-secondary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] transition-colors" aria-label="Close modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-grow">
                        {children}
                    </div>
                    {footer && (
                        <div className="p-4 bg-[rgb(var(--bg-primary-rgb))] rounded-b-xl border-t border-[rgb(var(--border-color-rgb))] flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
