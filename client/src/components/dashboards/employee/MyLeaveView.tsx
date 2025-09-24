import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { LeaveRequestStatus } from '../../../types';
import Card from '../../common/Card';
import { PlusIcon } from '../../common/Icons';
import RequestLeaveModal from '../../modals/RequestLeaveModal';
import EmptyState from '../../common/EmptyState';

const LeaveStatusBadge: React.FC<{ status: LeaveRequestStatus }> = ({
  status,
}) => {
  const baseClasses =
    'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
  const statusMap = {
    [LeaveRequestStatus.Pending]: 'bg-amber-500/10 text-amber-400',
    [LeaveRequestStatus.Approved]: 'bg-emerald-500/10 text-emerald-400',
    [LeaveRequestStatus.Rejected]: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`${baseClasses} ${statusMap[status]}`}>{status}</span>
  );
};

const MyLeaveView: React.FC = () => {
  const { currentUser, leaveRequests } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return leaveRequests
      .filter((r) => r.employeeId === currentUser.id)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
  }, [leaveRequests, currentUser]);

  return (
    <>
      <div className='space-y-6'>
        <h2 className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
          My Leave Requests
        </h2>
        <Card
          title='Request History'
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className='flex items-center gap-2 text-sm bg-[rgb(var(--accent-primary-rgb))] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-colors'>
              <PlusIcon className='w-4 h-4' />
              Request Leave
            </button>
          }
          padding='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='border-b border-[rgb(var(--border-color-rgb))]'>
                  <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                    Start Date
                  </th>
                  <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                    End Date
                  </th>
                  <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                    Reason
                  </th>
                  <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {myRequests.length > 0 ? (
                  myRequests.map((req) => (
                    <tr
                      key={req.id}
                      className='border-b border-[rgb(var(--border-color-rgb))] last:border-b-0 hover:bg-[rgba(var(--bg-tertiary-rgb),0.2)] transition-colors'>
                      <td className='p-4 text-sm font-medium text-[rgb(var(--text-primary-rgb))]'>
                        {req.startDate}
                      </td>
                      <td className='p-4 text-sm font-medium text-[rgb(var(--text-primary-rgb))]'>
                        {req.endDate}
                      </td>
                      <td className='p-4 text-sm text-[rgb(var(--text-secondary-rgb))]'>
                        {req.reason}
                      </td>
                      <td className='p-4'>
                        <LeaveStatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState message='You have not made any leave requests.' />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {isModalOpen && (
        <RequestLeaveModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default MyLeaveView;
