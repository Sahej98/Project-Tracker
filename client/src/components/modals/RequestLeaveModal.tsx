import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Modal from './Modal';

const RequestLeaveModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentUser, requestLeave } = useAppContext();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const formId = 'request-leave-form';
    
    const inputClasses = "w-full px-3 py-2 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors shadow-sm";
    const labelClasses = "block text-sm font-medium text-[rgb(var(--text-secondary-rgb))] mb-1.5";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !startDate || !endDate || !reason.trim()) {
            alert('Please fill out all fields.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('End date cannot be before start date.');
            return;
        }
        requestLeave({
            employeeId: currentUser.id,
            startDate,
            endDate,
            reason: reason.trim()
        });
        onClose();
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} className="py-2 px-4 bg-[rgb(var(--bg-tertiary-rgb))] text-[rgb(var(--text-primary-rgb))] rounded-lg hover:bg-[rgb(var(--border-color-rgb))] font-semibold transition-colors">Cancel</button>
            <button type="submit" form={formId} className="py-2 px-4 bg-[rgb(var(--accent-primary-rgb))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] font-semibold transition-colors">Submit Request</button>
        </>
    );

    return (
        <Modal title="Request Time Off" onClose={onClose} footer={footer}>
            <form id={formId} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className={labelClasses}>Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="endDate" className={labelClasses}>End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} required />
                    </div>
                </div>
                <div>
                    <label htmlFor="reason" className={labelClasses}>Reason</label>
                    <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className={inputClasses} required placeholder="e.g., Family vacation"></textarea>
                </div>
            </form>
        </Modal>
    );
};

export default RequestLeaveModal;