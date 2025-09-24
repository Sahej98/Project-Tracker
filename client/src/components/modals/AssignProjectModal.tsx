import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Project } from '../../types';
import { Role } from '../../types';
import Modal from './Modal';

interface AssignProjectModalProps {
  project: Project;
  onClose: () => void;
}

const AssignProjectModal: React.FC<AssignProjectModalProps> = ({
  project,
  onClose,
}) => {
  const { users, editProject } = useAppContext();
  const employees = users.filter((u) => u.role === Role.Employee);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>(
    project.assignedTo
  );

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = () => {
    editProject({ id: project.id, assignedTo: selectedEmployees });
    onClose();
  };

  const footer = (
    <>
      <button
        type='button'
        onClick={onClose}
        className='py-2 px-4 bg-[rgb(var(--bg-tertiary-rgb))] text-[rgb(var(--text-primary-rgb))] rounded-lg hover:bg-[rgb(var(--border-color-rgb))] font-semibold transition-colors'>
        Cancel
      </button>
      <button
        type='button'
        onClick={handleSubmit}
        className='py-2 px-4 bg-[rgb(var(--accent-primary-rgb))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] font-semibold transition-colors'>
        Save Changes
      </button>
    </>
  );

  return (
    <Modal
      title={`Assign to "${project.name}"`}
      onClose={onClose}
      footer={footer}>
      <div className='space-y-3 max-h-60 overflow-y-auto pr-2'>
        {employees.map((employee) => (
          <label
            key={employee.id}
            className='flex items-center space-x-3 p-3 rounded-lg hover:bg-[rgba(var(--bg-tertiary-rgb),0.5)] cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedEmployees.includes(employee.id)}
              onChange={() => handleEmployeeToggle(employee.id)}
              className='h-5 w-5 rounded-md text-[rgb(var(--accent-primary-rgb))] bg-[rgb(var(--bg-primary-rgb))] border-[rgb(var(--border-color-rgb))] focus:ring-[rgb(var(--accent-primary-rgb))]'
            />
            <img
              src={employee.avatar}
              alt={employee.name}
              className='w-8 h-8 rounded-full'
            />
            <span className='text-[rgb(var(--text-primary-rgb))]'>
              {employee.name}
            </span>
          </label>
        ))}
      </div>
    </Modal>
  );
};

export default AssignProjectModal;
