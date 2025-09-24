import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Project } from '../../types';
import { Role } from '../../types';
import Modal from './Modal';

interface AddEditProjectModalProps {
  project: Project | null; // null for new project, project object for editing
  onClose: () => void;
}

const AddEditProjectModal: React.FC<AddEditProjectModalProps> = ({
  project,
  onClose,
}) => {
  const { users, addProject, editProject } = useAppContext();
  const isEditMode = project !== null;
  const formId = `project-form-${project?.id || 'new'}`;

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [clientId, setClientId] = useState<number | undefined>(
    project?.clientId
  );
  const [startDate, setStartDate] = useState(project?.startDate || '');
  const [deadline, setDeadline] = useState(project?.deadline || '');
  const [category, setCategory] = useState(project?.category || '');
  const [budget, setBudget] = useState(project?.budget || 0);

  const clients = useMemo(
    () => users.filter((u) => u.role === Role.Client),
    [users]
  );

  const inputClasses =
    'w-full px-3 py-2 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors shadow-sm';
  const labelClasses =
    'block text-sm font-medium text-[rgb(var(--text-secondary-rgb))] mb-1.5';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !deadline || !category || !startDate) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isEditMode) {
      editProject({
        id: project.id,
        name,
        description,
        clientId,
        deadline,
        category,
        startDate,
        budget,
      });
    } else {
      addProject({
        name,
        description,
        clientId,
        deadline,
        category,
        startDate,
        budget,
      });
    }
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
        type='submit'
        form={formId}
        className='py-2 px-4 bg-[rgb(var(--accent-primary-rgb))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] font-semibold transition-colors'>
        {isEditMode ? 'Save Changes' : 'Create Project'}
      </button>
    </>
  );

  return (
    <Modal
      title={isEditMode ? `Edit "${project.name}"` : 'Add New Project'}
      onClose={onClose}
      footer={footer}
      size='max-w-2xl'>
      <form id={formId} className='space-y-4' onSubmit={handleSubmit}>
        <div>
          <label htmlFor='projectName' className={labelClasses}>
            Project Name
          </label>
          <input
            type='text'
            id='projectName'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='client' className={labelClasses}>
              Client
            </label>
            <select
              id='client'
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
              className={inputClasses}
              required>
              <option value=''>Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='category' className={labelClasses}>
              Category
            </label>
            <input
              type='text'
              id='category'
              placeholder='e.g., Web Development'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='startDate' className={labelClasses}>
              Start Date
            </label>
            <input
              type='date'
              id='startDate'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor='deadline' className={labelClasses}>
              Deadline
            </label>
            <input
              type='date'
              id='deadline'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor='budget' className={labelClasses}>
            Budget ($)
          </label>
          <input
            type='number'
            id='budget'
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label htmlFor='description' className={labelClasses}>
            Description
          </label>
          <textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClasses}></textarea>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditProjectModal;
