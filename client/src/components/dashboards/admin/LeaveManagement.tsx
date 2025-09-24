import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { LeaveRequestStatus } from '../../../types';
import Card from '../../common/Card';
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  UsersIcon,
} from '../../common/Icons';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Card
    padding='p-5'
    className='relative overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg'>
    <div className='absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[rgb(var(--accent-primary-rgb))] opacity-10'></div>
    <div className='flex items-center gap-4 relative'>
      <div className='p-3 rounded-lg bg-[rgba(var(--accent-primary-rgb),0.1)] text-[rgb(var(--accent-primary-rgb))]'>
        {icon}
      </div>
      <div>
        <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))]'>
          {title}
        </h4>
        <p className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
          {value}
        </p>
      </div>
    </div>
  </Card>
);

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

const LeaveManagement: React.FC = () => {
  const { leaveRequests, findUserById, updateLeaveStatus } = useAppContext();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const pending = leaveRequests.filter(
      (r) => r.status === LeaveRequestStatus.Pending
    ).length;
    const upcoming = leaveRequests.filter((r) => {
      const startDate = new Date(r.startDate);
      return (
        r.status === LeaveRequestStatus.Approved &&
        startDate > today &&
        startDate <= nextWeek
      );
    }).length;
    const onLeaveToday = leaveRequests.filter((r) => {
      const startDate = new Date(r.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(r.endDate);
      endDate.setHours(0, 0, 0, 0);
      return (
        r.status === LeaveRequestStatus.Approved &&
        today >= startDate &&
        today <= endDate
      );
    }).length;

    return { pending, upcoming, onLeaveToday };
  }, [leaveRequests]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatCard
          title='Pending Requests'
          value={stats.pending}
          icon={<AlertTriangleIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Upcoming (7 days)'
          value={stats.upcoming}
          icon={<CalendarDaysIcon className='w-6 h-6' />}
        />
        <StatCard
          title='On Leave Today'
          value={stats.onLeaveToday}
          icon={<UsersIcon className='w-6 h-6' />}
        />
      </div>

      <Card title='All Requests' padding='p-0'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b border-[rgb(var(--border-color-rgb))]'>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Employee
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Dates
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Reason
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Status
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => {
                const employee = findUserById(req.employeeId);
                return (
                  <tr
                    key={req.id}
                    className='border-b border-[rgb(var(--border-color-rgb))] last:border-b-0 hover:bg-[rgba(var(--bg-tertiary-rgb),0.2)] transition-colors'>
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        <img
                          src={employee?.avatar}
                          alt={employee?.name}
                          className='w-8 h-8 rounded-full'
                        />
                        <span className='font-medium text-[rgb(var(--text-primary-rgb))]'>
                          {employee?.name}
                        </span>
                      </div>
                    </td>
                    <td className='p-4 text-sm text-[rgb(var(--text-secondary-rgb))]'>
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className='p-4 text-sm text-[rgb(var(--text-secondary-rgb))] truncate max-w-xs'>
                      {req.reason}
                    </td>
                    <td className='p-4'>
                      <LeaveStatusBadge status={req.status} />
                    </td>
                    <td className='p-4'>
                      {req.status === LeaveRequestStatus.Pending && (
                        <div className='flex justify-end items-center space-x-2'>
                          <button
                            onClick={() =>
                              updateLeaveStatus(
                                req.id,
                                LeaveRequestStatus.Approved
                              )
                            }
                            className='text-sm bg-emerald-500 text-white font-semibold py-1 px-3 rounded-lg hover:bg-emerald-600 transition-colors'>
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateLeaveStatus(
                                req.id,
                                LeaveRequestStatus.Rejected
                              )
                            }
                            className='text-sm bg-red-500 text-white font-semibold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors'>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LeaveManagement;
