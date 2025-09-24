import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { ProjectStatus, TaskStatus } from '../../../types';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import {
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  SunriseIcon,
} from '../../common/Icons';
import PieChart from '../../common/PieChart';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Card
    padding='p-5'
    className='transition-all duration-300 hover:scale-[1.03] hover:shadow-lg'>
    <div className='flex items-center gap-4'>
      <div className='p-3 rounded-lg bg-[rgba(var(--accent-primary-rgb),0.1)] text-[rgb(var(--accent-primary-rgb))]'>
        {icon}
      </div>
      <div>
        <p className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
          {value}
        </p>
        <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))] text-sm'>
          {title}
        </h4>
      </div>
    </div>
  </Card>
);

const TasksPerProjectBars: React.FC<{
  data: { label: string; value: number }[];
}> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className='space-y-3'>
      {data.map((item, i) => (
        <div
          key={item.label}
          className='flex items-center gap-3 animate-fade-in-scale'
          style={{ animationDelay: `${i * 0.05}s` }}>
          <span className='text-sm text-[rgb(var(--text-secondary-rgb))] w-24 truncate text-right'>
            {item.label}
          </span>
          <div className='flex-1 bg-[rgba(var(--bg-tertiary-rgb),0.5)] rounded-full h-5 relative'>
            <div
              className='bg-gradient-to-r from-sky-500 to-indigo-500 h-5 rounded-full flex items-center justify-end px-2 transition-all duration-500'
              style={{ width: `${(item.value / maxValue) * 100}%` }}>
              <span className='text-white text-xs font-bold'>
                {item.value > 0 ? item.value : ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EmployeeHomeDashboard: React.FC = () => {
  const { currentUser, projects, notifications, dailyStandups } =
    useAppContext();
  const today = new Date();

  const myProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter((p) => p.assignedTo.includes(currentUser.id));
  }, [projects, currentUser]);

  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return myProjects.flatMap((p) => p.tasks);
  }, [myProjects, currentUser]);

  const stats = useMemo(() => {
    if (!currentUser)
      return {
        activeProjects: 0,
        tasksDueWeek: 0,
        hoursThisWeek: 0,
        standupPending: true,
      };

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const tasksDueWeek = myTasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= today &&
        dueDate <= nextWeek &&
        t.status !== TaskStatus.Completed
      );
    }).length;

    const hoursThisWeek = myTasks.reduce((sum, task) => {
      // A more robust implementation would check if log entries fall within the week.
      // This is a simplification based on available data.
      return sum + task.loggedHours;
    }, 0);

    const hasSubmittedStandupToday = dailyStandups.some(
      (s) =>
        s.employeeId === currentUser.id &&
        s.date === today.toISOString().split('T')[0]
    );

    return {
      activeProjects: myProjects.filter(
        (p) => p.status === ProjectStatus.InProgress
      ).length,
      tasksDueWeek,
      hoursThisWeek,
      standupPending: !hasSubmittedStandupToday,
    };
  }, [myProjects, myTasks, currentUser, dailyStandups, today]);

  const taskStatusData = useMemo(() => {
    if (!myTasks) return [];
    const statusCounts = myTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const statusColors: Record<TaskStatus, string> = {
      [TaskStatus.Completed]: '#10b981',
      [TaskStatus.InProgress]: '#38bdf8',
      [TaskStatus.OnHold]: '#f59e0b',
      [TaskStatus.ToDo]: '#64748b',
    };

    // FIX: The use of Object.entries was causing type inference issues for the 'value' property,
    // resulting in 'unknown' type. Switched to Object.keys with a type assertion to ensure
    // type safety for chart data and sorting operations.
    return (Object.keys(statusCounts) as TaskStatus[])
      .map((status) => ({
        label: status,
        value: statusCounts[status],
        color: statusColors[status],
      }))
      .sort((a, b) => b.value - a.value);
  }, [myTasks]);

  const tasksPerProjectData = useMemo(() => {
    if (!myProjects) return [];
    return myProjects
      .map((p) => ({
        label: p.name,
        value: p.tasks.filter((t) =>
          p.assignedTo.includes(currentUser?.id || -1)
        ).length,
      }))
      .filter((p) => p.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [myProjects, currentUser]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Active Projects'
          value={stats.activeProjects}
          icon={<BriefcaseIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Tasks Due Soon'
          value={stats.tasksDueWeek}
          icon={<CalendarIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Hours Logged'
          value={`${stats.hoursThisWeek}h`}
          icon={<ClockIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Daily Standup'
          value={stats.standupPending ? 'Pending' : 'Submitted'}
          icon={<SunriseIcon className='w-6 h-6' />}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-2'>
          <Card title='My Active Projects'>
            <div className='space-y-4'>
              {myProjects.filter((p) => p.status === ProjectStatus.InProgress)
                .length > 0 ? (
                myProjects
                  .filter((p) => p.status === ProjectStatus.InProgress)
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
                  ))
              ) : (
                <p className='text-center text-[rgb(var(--text-secondary-rgb))] py-4'>
                  No active projects assigned.
                </p>
              )}
            </div>
          </Card>
        </div>
        <div className='lg:col-span-1 space-y-6'>
          <Card title='Task Status'>
            <PieChart data={taskStatusData} />
          </Card>
        </div>
      </div>
      <Card title='Tasks per Project'>
        <TasksPerProjectBars data={tasksPerProjectData} />
      </Card>
    </div>
  );
};

export default EmployeeHomeDashboard;
