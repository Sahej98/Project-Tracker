import React from 'react';
import Modal from './Modal';
import { AlertTriangleIcon } from '../common/Icons';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
    
  const footer = (
    <>
      <button type="button" onClick={onCancel} className="py-2 px-4 bg-[rgb(var(--bg-tertiary-rgb))] text-[rgb(var(--text-primary-rgb))] rounded-lg hover:bg-[rgb(var(--border-color-rgb))] font-semibold transition-colors">
        {cancelText}
      </button>
      <button type="button" onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal title={title} onClose={onCancel} footer={footer} size="max-w-md">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
            </div>
            <div className="mt-1">
                 <p className="text-[rgb(var(--text-secondary-rgb))]">{message}</p>
            </div>
        </div>
    </Modal>
  );
};

export default ConfirmationModal;