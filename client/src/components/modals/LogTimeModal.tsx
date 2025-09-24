import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Task } from '../../types';
import Modal from './Modal';

interface LogTimeModalProps {
  task: Task;
  projectId: number;
  onClose: () => void;
}

const LogTimeModal: React.FC<LogTimeModalProps> = ({
  task,
  projectId,
  onClose,
}) => {
  const { logTimeToTask } = useAppContext();
  const [hours, setHours] = useState('');
  const formId = `log-time-form-${task.id}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursLogged = parseFloat(hours);
    if (!isNaN(hoursLogged) && hoursLogged > 0) {
      logTimeToTask(projectId, task.id, hoursLogged);
      onClose();
    } else {
      alert('Please enter a valid number of hours.');
    }
  };

  const footer = (
    <>
      <button
        type='button'
        onClick={onClose}
        className='py-2 px-4 bg-[rgb(var(--bg-tertiary-rgb))] text-[rgb(var(--text-primary-rgb))] rounded-lg hover:bg-[rgb(var(--border-color-rgb))] font-semibold'>
        Cancel
      </button>
      <button
        type='submit'
        form={formId}
        className='py-2 px-4 bg-[rgb(var(--accent-primary-rgb))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] font-semibold'>
        Log Hours
      </button>
    </>
  );

  return (
    <Modal
      title={`Log Time for "${task.title}"`}
      onClose={onClose}
      footer={footer}
      size='max-w-md'>
      <form id={formId} onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='hours'
            className='block text-sm font-medium text-[rgb(var(--text-secondary-rgb))] mb-1'>
            Hours
          </label>
          <input
            type='number'
            id='hours'
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className='w-full p-2 border border-[rgb(var(--border-color-rgb))] rounded-lg bg-[rgb(var(--bg-secondary-rgb))]'
            placeholder='e.g., 2.5'
            step='0.1'
            min='0'
            autoFocus
          />
        </div>
        <p className='text-sm text-[rgb(var(--text-secondary-rgb))]'>
          Current time logged: {task.loggedHours} hours
        </p>
      </form>
    </Modal>
  );
};

export default LogTimeModal;
