import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { LeaveRequestStatus } from '../../../types';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  SunriseIcon,
  CalendarDaysIcon,
} from '../../common/Icons';

interface EmployeeProfileViewProps {
  employeeId: number;
}

const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({
  employeeId,
}) => {
  const {
    findUserById,
    getEmployeeStats,
    projects,
    dailyStandups,
    leaveRequests,
  } = useAppContext();

  const employee = findUserById(employeeId);
  const stats = getEmployeeStats(employeeId);

  const employeeProjects = useMemo(() => {
    return projects
      .filter((p) => p.assignedTo.includes(employeeId))
      .sort((a, b) => (a.status === 'Completed' ? 1 : -1));
  }, [projects, employeeId]);

  const latestStandup = useMemo(() => {
    return dailyStandups
      .filter((s) => s.employeeId === employeeId)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
  }, [dailyStandups, employeeId]);

  const upcomingLeave = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return leaveRequests
      .filter(
        (r) =>
          r.employeeId === employeeId &&
          r.status === LeaveRequestStatus.Approved &&
          new Date(r.startDate) >= today
      )
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )[0];
  }, [leaveRequests, employeeId]);

  if (!employee) {
    return <div className='text-center p-8'>Employee not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <Card padding='p-6'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          <img
            src={employee.avatar}
            alt={employee.name}
            className='w-24 h-24 rounded-full ring-4 ring-[rgba(var(--accent-primary-rgb),0.2)]'
          />
          <div className='flex-1'>
            <h2 className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
              {employee.name}
            </h2>
            <p className='text-[rgb(var(--accent-primary-rgb))] font-semibold mt-1'>
              {employee.jobTitle}
            </p>
            <div className='mt-3 pt-3 border-t border-[rgb(var(--border-color-rgb))] flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2 text-sm text-[rgb(var(--text-secondary-rgb))]'>
              <span>
                Email:{' '}
                <a
                  href={`mailto:${employee.email}`}
                  className='text-[rgb(var(--text-primary-rgb))] font-medium hover:underline'>
                  {employee.email}
                </a>
              </span>
              <span>
                Phone:{' '}
                <span className='text-[rgb(var(--text-primary-rgb))] font-medium'>
                  {employee.phone}
                </span>
              </span>
              <span>
                Rate:{' '}
                <span className='text-[rgb(var(--text-primary-rgb))] font-medium'>
                  ${employee.hourlyRate}/hr
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <div className='flex items-center gap-4'>
            <BriefcaseIcon className='w-8 h-8 text-sky-400' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Total Projects
              </h4>
              <p className='text-3xl font-bold'>{stats.totalProjects}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className='flex items-center gap-4'>
            <CheckCircleIcon className='w-8 h-8 text-emerald-400' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Tasks Completed
              </h4>
              <p className='text-3xl font-bold'>{stats.tasksCompleted}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className='flex items-center gap-4'>
            <ClockIcon className='w-8 h-8 text-amber-400' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Total Hours Logged
              </h4>
              <p className='text-3xl font-bold'>{stats.totalHours}h</p>
            </div>
          </div>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <Card title='Current Projects' className='lg:col-span-2'>
          <div className='space-y-4'>
            {employeeProjects
              .filter((p) => p.status !== 'Completed')
              .map((project) => (
                <div key={project.id}>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='font-semibold text-[rgb(var(--text-primary-rgb))]'>
                      {project.name}
                    </span>
                    <span className='text-sm font-bold text-[rgb(var(--accent-primary-rgb))]'>
                      {project.progress}%
                    </span>
                  </div>
                  <ProgressBar progress={project.progress} />
                </div>
              ))}
            {employeeProjects.filter((p) => p.status !== 'Completed').length ===
              0 && (
              <p className='text-[rgb(var(--text-secondary-rgb))] text-sm italic text-center py-4'>
                No active projects.
              </p>
            )}
          </div>
        </Card>
        <div className='space-y-6'>
          <Card title='Latest Standup'>
            {latestStandup ? (
              <div className='space-y-2 text-sm'>
                <p className='font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                  {new Date(latestStandup.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className='text-[rgb(var(--text-primary-rgb))]'>
                  <strong className='font-semibold'>Today:</strong>{' '}
                  {latestStandup.today}
                </p>
                <p className='text-red-500'>
                  <strong className='font-semibold'>Blockers:</strong>{' '}
                  {latestStandup.blockers || 'None'}
                </p>
              </div>
            ) : (
              <p className='text-sm text-[rgb(var(--text-secondary-rgb))] italic'>
                No standups submitted yet.
              </p>
            )}
          </Card>
          <Card title='Upcoming Leave'>
            {upcomingLeave ? (
              <div className='flex items-center gap-3 text-sm'>
                <CalendarDaysIcon className='w-8 h-8 text-[rgb(var(--accent-primary-rgb))]' />
                <div>
                  <p className='font-semibold text-[rgb(var(--text-primary-rgb))]'>
                    {upcomingLeave.startDate} to {upcomingLeave.endDate}
                  </p>
                  <p className='text-[rgb(var(--text-secondary-rgb))]'>
                    {upcomingLeave.reason}
                  </p>
                </div>
              </div>
            ) : (
              <p className='text-sm text-[rgb(var(--text-secondary-rgb))] italic'>
                No upcoming leave.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileView;
