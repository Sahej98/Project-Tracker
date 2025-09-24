import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { User } from '../../types';
import { Role } from '../../types';
import Modal from './Modal';

interface AddEditUserModalProps {
  user: User | null;
  role: Role;
  onClose: () => void;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  user,
  role,
  onClose,
}) => {
  const { addUser, editUser } = useAppContext();
  const isEditMode = user !== null;
  const formId = `user-form-${user?.id || 'new'}`;
  const effectiveRole = user?.role || role;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [hourlyRate, setHourlyRate] = useState(
    user?.hourlyRate || (effectiveRole === Role.Employee ? 50 : undefined)
  );

  const inputClasses =
    'w-full px-3 py-2 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors shadow-sm';
  const labelClasses =
    'block text-sm font-medium text-[rgb(var(--text-secondary-rgb))] mb-1.5';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Name cannot be empty.');
      return;
    }

    if (isEditMode && user) {
      editUser({
        id: user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        jobTitle: effectiveRole === Role.Employee ? jobTitle.trim() : undefined,
        hourlyRate: effectiveRole === Role.Employee ? hourlyRate : undefined,
      });
    } else {
      addUser({
        name: name.trim(),
        role,
        email: email.trim(),
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        hourlyRate: hourlyRate || 0,
      });
    }
    onClose();
  };

  const roleName =
    effectiveRole === Role.Employee
      ? 'Employee'
      : effectiveRole === Role.Client
      ? 'Client'
      : 'Profile';
  const title = isEditMode ? `Edit ${roleName}` : `Add New ${roleName}`;

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
        {isEditMode ? 'Save Changes' : `Add ${roleName}`}
      </button>
    </>
  );

  return (
    <Modal title={title} onClose={onClose} footer={footer} size='max-w-xl'>
      <form id={formId} onSubmit={handleSubmit}>
        <div className='flex flex-col items-center space-y-6'>
          <img
            src={
              user?.avatar ||
              `https://i.pravatar.cc/150?u=${
                name.replace(/\s/g, '') || 'new_user'
              }`
            }
            alt='Avatar preview'
            className='w-24 h-24 rounded-full ring-4 ring-[rgba(var(--accent-primary-rgb),0.2)]'
          />

          <div className='w-full space-y-4'>
            <div className='relative'>
              <hr className='border-t border-[rgb(var(--border-color-rgb))]' />
              <h3 className='absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-[rgb(var(--bg-secondary-rgb))] text-sm font-medium text-[rgb(var(--text-secondary-rgb))]'>
                Contact Information
              </h3>
            </div>

            <div className='pt-2 space-y-4'>
              <div>
                <label htmlFor='userName' className={labelClasses}>
                  Full Name
                </label>
                <input
                  type='text'
                  id='userName'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  required
                  placeholder={`Enter full name`}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='email' className={labelClasses}>
                    Email Address
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder='e.g. contact@example.com'
                  />
                </div>
                <div>
                  <label htmlFor='phone' className={labelClasses}>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClasses}
                    placeholder='e.g. 555-123-4567'
                  />
                </div>
              </div>
            </div>

            {effectiveRole === Role.Employee && (
              <>
                <div className='relative pt-2'>
                  <hr className='border-t border-[rgb(var(--border-color-rgb))]' />
                  <h3 className='absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-[rgb(var(--bg-secondary-rgb))] text-sm font-medium text-[rgb(var(--text-secondary-rgb))]'>
                    Job Details
                  </h3>
                </div>

                <div className='pt-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='jobTitle' className={labelClasses}>
                      Job Title
                    </label>
                    <input
                      type='text'
                      id='jobTitle'
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={inputClasses}
                      placeholder='e.g. Frontend Developer'
                    />
                  </div>
                  <div>
                    <label htmlFor='hourlyRate' className={labelClasses}>
                      Hourly Rate ($)
                    </label>
                    <input
                      type='number'
                      id='hourlyRate'
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className={inputClasses}
                      min='0'
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditUserModal;
