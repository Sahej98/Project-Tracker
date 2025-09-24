import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';
import { Role } from '../../../types';
import { CheckCircleIcon, AlertTriangleIcon } from '../../common/Icons';

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

const DailyStandupsView: React.FC = () => {
  const { dailyStandups, findUserById, users } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const employeeCount = useMemo(
    () => users.filter((u) => u.role === Role.Employee).length,
    [users]
  );

  const standupsForDate = useMemo(() => {
    return dailyStandups
      .filter((s) => s.date === selectedDate)
      .sort(
        (a, b) =>
          findUserById(a.employeeId)?.name.localeCompare(
            findUserById(b.employeeId)?.name || ''
          ) || 0
      );
  }, [dailyStandups, selectedDate, findUserById]);

  const blockersToday = useMemo(() => {
    return standupsForDate.filter(
      (s) =>
        s.blockers &&
        s.blockers.trim() !== '' &&
        s.blockers.trim().toLowerCase() !== 'none'
    ).length;
  }, [standupsForDate]);

  return (
    <div className='space-y-6'>
      <Card>
        <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4'>
          <div>
            <h3 className='text-lg font-bold text-[rgb(var(--text-primary-rgb))]'>
              Daily Summary
            </h3>
            <p className='text-sm text-[rgb(var(--text-secondary-rgb))]'>
              Select a date to view standups
            </p>
          </div>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='p-2 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))]'
          />
        </div>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <StatCard
          title='Submitted Today'
          value={`${standupsForDate.length} / ${employeeCount}`}
          icon={<CheckCircleIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Blockers Reported'
          value={blockersToday}
          icon={<AlertTriangleIcon className='w-6 h-6' />}
        />
      </div>

      {standupsForDate.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {standupsForDate.map((standup) => {
            const employee = findUserById(standup.employeeId);
            return (
              <Card
                key={standup.id}
                className='flex flex-col animate-fade-in-scale'
                padding='p-0'>
                <div className='p-4 border-b border-[rgb(var(--border-color-rgb))] flex items-center gap-3'>
                  <img
                    src={employee?.avatar}
                    alt={employee?.name}
                    className='w-10 h-10 rounded-full'
                  />
                  <div>
                    <h3 className='font-bold text-[rgb(var(--text-primary-rgb))]'>
                      {employee?.name}
                    </h3>
                    <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                      {new Date(standup.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className='p-4 space-y-3 text-sm flex-grow'>
                  <div>
                    <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))] mb-1'>
                      Yesterday
                    </h4>
                    <p className='text-[rgb(var(--text-primary-rgb))] bg-[rgba(var(--bg-tertiary-rgb),0.3)] p-2 rounded-md'>
                      {standup.yesterday}
                    </p>
                  </div>
                  <div>
                    <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))] mb-1'>
                      Today
                    </h4>
                    <p className='text-[rgb(var(--text-primary-rgb))] bg-[rgba(var(--bg-tertiary-rgb),0.3)] p-2 rounded-md'>
                      {standup.today}
                    </p>
                  </div>
                  <div>
                    <h4
                      className={`font-semibold mb-1 ${
                        standup.blockers &&
                        standup.blockers.trim() !== '' &&
                        standup.blockers.trim().toLowerCase() !== 'none'
                          ? 'text-red-500'
                          : 'text-[rgb(var(--text-secondary-rgb))]'
                      }`}>
                      Blockers
                    </h4>
                    <p className='text-[rgb(var(--text-primary-rgb))] bg-[rgba(var(--bg-tertiary-rgb),0.3)] p-2 rounded-md'>
                      {standup.blockers || 'None'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState message={`No standups submitted for ${selectedDate}.`} />
        </Card>
      )}
    </div>
  );
};

export default DailyStandupsView;
