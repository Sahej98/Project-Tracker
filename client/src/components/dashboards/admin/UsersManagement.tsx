import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import type { User } from '../../../types';
import { Role, UserStatus, ProjectStatus } from '../../../types';
import Card from '../../common/Card';
import {
  EditIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  PowerIcon,
} from '../../common/Icons';
import AddEditUserModal from '../../modals/AddEditUserModal';
import ConfirmationModal from '../../modals/ConfirmationModal';
import EmptyState from '../../common/EmptyState';

interface UsersManagementProps {
  role: Role.Employee | Role.Client;
  onViewProfile: (userId: number) => void;
}

const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const baseClasses =
    'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
  const statusMap = {
    [UserStatus.Active]: 'bg-emerald-500/10 text-emerald-400',
    [UserStatus.Inactive]: 'bg-slate-500/10 text-slate-400',
  };
  return (
    <span className={`${baseClasses} ${statusMap[status]}`}>{status}</span>
  );
};

const UserActions: React.FC<{
  user: User;
  isCurrentUser: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onViewProfile: () => void;
}> = ({
  user,
  isCurrentUser,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewProfile,
}) => (
  <div className='flex justify-end items-center space-x-1'>
    <button
      onClick={onViewProfile}
      title='View Profile'
      className='p-2 text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] rounded-full transition-colors'>
      <EyeIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onEdit}
      title='Edit'
      className='p-2 text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] rounded-full transition-colors'>
      <EditIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onToggleStatus}
      title={user.status === UserStatus.Active ? 'Deactivate' : 'Activate'}
      className={`p-2 rounded-full transition-colors ${
        isCurrentUser
          ? 'text-slate-600 cursor-not-allowed'
          : 'text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))]'
      }`}
      disabled={isCurrentUser}>
      <PowerIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onDelete}
      title='Delete'
      className='p-2 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full transition-colors'
      disabled={isCurrentUser}>
      <TrashIcon className='w-5 h-5' />
    </button>
  </div>
);

const UsersManagement: React.FC<UsersManagementProps> = ({
  role,
  onViewProfile,
}) => {
  const { users, projects, deleteUser, updateUserStatus, currentUser } =
    useAppContext();
  const [modalUser, setModalUser] = useState<User | null | undefined>(
    undefined
  );
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const roleName = role === Role.Employee ? 'Employee' : 'Client';
  const title = `${roleName}s`;

  const filteredUsers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return users.filter(
      (u) => u.role === role && u.name.toLowerCase().includes(searchLower)
    );
  }, [users, role, searchTerm]);

  const getUserStats = (user: User) => {
    if (user.role === Role.Employee) {
      const assignedProjects = projects.filter((p) =>
        p.assignedTo.includes(user.id)
      );
      const activeProjects = assignedProjects.filter(
        (p) => p.status === ProjectStatus.InProgress
      ).length;
      const loggedHours = assignedProjects.reduce(
        (sum, p) => sum + p.totalLoggedHours,
        0
      );
      return { activeProjects, loggedHours };
    }
    if (user.role === Role.Client) {
      const clientProjects = projects.filter(
        (p) => p.clientId === user.id
      ).length;
      return { totalProjects: clientProjects };
    }
    return {};
  };

  const handleEdit = (user: User) => setModalUser(user);
  const handleAddNew = () => setModalUser(null);
  const handleDeleteConfirm = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const cardActions = (
    <div className='flex flex-col sm:flex-row items-center gap-2'>
      <input
        type='text'
        placeholder={`Search ${roleName}s...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='w-full sm:w-auto p-2.5 bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors text-sm'
      />
      <button
        onClick={handleAddNew}
        className='flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-[rgb(var(--accent-primary-rgb))] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-colors'>
        <PlusIcon className='w-4 h-4' />
        Add New {roleName}
      </button>
    </div>
  );

  return (
    <div className='space-y-6'>
      <Card title={title} actions={cardActions} padding='p-0'>
        <div className='overflow-x-auto hidden lg:block'>
          <table className='w-full text-left'>
            <thead className='bg-[rgb(var(--bg-tertiary-rgb))]'>
              <tr className='border-b border-[rgb(var(--border-color-rgb))]'>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Name
                </th>
                {role === Role.Employee ? (
                  <>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-center'>
                      Active Projects
                    </th>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-center'>
                      Logged Hours
                    </th>
                  </>
                ) : (
                  <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-center'>
                    Total Projects
                  </th>
                )}
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Status
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[rgb(var(--border-color-rgb))]'>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const stats = getUserStats(user);
                  return (
                    <tr
                      key={user.id}
                      className='hover:bg-[rgba(var(--bg-tertiary-rgb),0.4)] transition-colors'>
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className='w-10 h-10 rounded-full'
                          />
                          <div>
                            <span className='font-medium text-[rgb(var(--text-primary-rgb))]'>
                              {user.name}
                            </span>
                            <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                              {user.jobTitle || user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {role === Role.Employee ? (
                        <>
                          <td className='p-4 text-sm text-center font-medium text-[rgb(var(--text-primary-rgb))]'>
                            {stats.activeProjects}
                          </td>
                          <td className='p-4 text-sm text-center font-medium text-[rgb(var(--text-primary-rgb))]'>
                            {stats.loggedHours}h
                          </td>
                        </>
                      ) : (
                        <td className='p-4 text-sm text-center font-medium text-[rgb(var(--text-primary-rgb))]'>
                          {stats.totalProjects}
                        </td>
                      )}
                      <td className='p-4'>
                        <UserStatusBadge status={user.status} />
                      </td>
                      <td className='p-4'>
                        <UserActions
                          user={user}
                          isCurrentUser={user.id === currentUser?.id}
                          onEdit={() => handleEdit(user)}
                          onToggleStatus={() =>
                            updateUserStatus(
                              user.id,
                              user.status === UserStatus.Active
                                ? UserStatus.Inactive
                                : UserStatus.Active
                            )
                          }
                          onDelete={() => setDeletingUser(user)}
                          onViewProfile={() => onViewProfile(user.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      message={`No ${roleName.toLowerCase()}s found.`}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='lg:hidden'>
          {filteredUsers.length > 0 ? (
            <div className='divide-y divide-[rgb(var(--border-color-rgb))]'>
              {filteredUsers.map((user) => {
                const stats = getUserStats(user);
                return (
                  <div key={user.id} className='p-4 space-y-3'>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-center gap-3'>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className='w-10 h-10 rounded-full'
                        />
                        <div>
                          <span className='font-medium text-[rgb(var(--text-primary-rgb))]'>
                            {user.name}
                          </span>
                          <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                            {user.jobTitle || user.email}
                          </p>
                        </div>
                      </div>
                      <UserStatusBadge status={user.status} />
                    </div>
                    <div className='flex justify-between items-center text-sm p-3 bg-[rgb(var(--bg-tertiary-rgb))] rounded-lg border border-[rgb(var(--border-color-rgb))]'>
                      {role === Role.Employee ? (
                        <>
                          <div className='text-center'>
                            <p className='font-bold text-lg'>
                              {stats.activeProjects}
                            </p>
                            <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                              Active Projects
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='font-bold text-lg'>
                              {stats.loggedHours}h
                            </p>
                            <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                              Logged Hours
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className='text-center w-full'>
                          <p className='font-bold text-lg'>
                            {stats.totalProjects}
                          </p>
                          <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                            Total Projects
                          </p>
                        </div>
                      )}
                    </div>
                    <div className='border-t border-[rgb(var(--border-color-rgb))] pt-2'>
                      <UserActions
                        user={user}
                        isCurrentUser={user.id === currentUser?.id}
                        onEdit={() => handleEdit(user)}
                        onToggleStatus={() =>
                          updateUserStatus(
                            user.id,
                            user.status === UserStatus.Active
                              ? UserStatus.Inactive
                              : UserStatus.Active
                          )
                        }
                        onDelete={() => setDeletingUser(user)}
                        onViewProfile={() => onViewProfile(user.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message={`No ${roleName.toLowerCase()}s found.`} />
          )}
        </div>
      </Card>

      {modalUser !== undefined && (
        <AddEditUserModal
          user={modalUser}
          role={role}
          onClose={() => setModalUser(undefined)}
        />
      )}
      {deletingUser && (
        <ConfirmationModal
          title={`Delete ${roleName}`}
          message={`Are you sure you want to delete ${deletingUser.name}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingUser(null)}
          confirmText='Delete'
        />
      )}
    </div>
  );
};

export default UsersManagement;
