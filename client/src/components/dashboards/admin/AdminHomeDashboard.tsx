import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { ProjectStatus, Role, ProjectHealth, TaskStatus } from '../../../types';
import Card from '../../common/Card';
import LineChart from '../../common/LineChart';
import WeeklyBarChart from '../../common/WeeklyBarChart';
import ProgressBar from '../../common/ProgressBar';
import PieChart from '../../common/PieChart';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  AlertTriangleIcon,
  SunriseIcon,
} from '../../common/Icons';

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

const TeamPulse: React.FC = () => {
  const { users, projects } = useAppContext();
  const employees = users.filter((u) => u.role === Role.Employee);

  const workloadData = employees
    .map((emp) => {
      const assignedTasksInProgress = projects.reduce((count, p) => {
        if (p.assignedTo.includes(emp.id)) {
          return (
            count +
            p.tasks.filter((t) => t.status === TaskStatus.InProgress).length
          );
        }
        return count;
      }, 0);
      return { label: emp.name.split(' ')[0], value: assignedTasksInProgress };
    })
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...workloadData.map((d) => d.value), 1);

  return (
    <div className='space-y-3'>
      {workloadData.map((item, i) => (
        <div
          key={item.label}
          className='flex items-center gap-3 animate-fade-in-scale'
          style={{ animationDelay: `${i * 0.05}s` }}>
          <span className='text-sm text-[rgb(var(--text-secondary-rgb))] w-16 truncate text-right'>
            {item.label}
          </span>
          <div className='flex-1 bg-[rgba(var(--bg-tertiary-rgb),0.5)] rounded-full h-5 relative'>
            <div
              className='bg-[rgb(var(--accent-primary-rgb))] h-5 rounded-full flex items-center justify-end px-2 transition-all duration-500'
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

const AtRiskProjects: React.FC = () => {
  const { projects } = useAppContext();
  const atRisk = projects
    .filter(
      (p) =>
        p.health === ProjectHealth.AtRisk || p.health === ProjectHealth.OffTrack
    )
    .sort((a, b) => (a.health === ProjectHealth.OffTrack ? -1 : 1))
    .slice(0, 5); // show top 5

  if (atRisk.length === 0) {
    return (
      <p className='text-center py-4 text-[rgb(var(--text-secondary-rgb))] italic'>
        No projects are currently at risk.
      </p>
    );
  }

  return (
    <div className='space-y-4'>
      {atRisk.map((p) => (
        <div key={p.id}>
          <div className='flex justify-between items-center mb-1'>
            <span className='font-semibold text-[rgb(var(--text-primary-rgb))] text-sm'>
              {p.name}
            </span>
            <span
              className={`text-xs font-bold ${
                p.health === ProjectHealth.OffTrack
                  ? 'text-red-500'
                  : 'text-amber-500'
              }`}>
              {p.health === 'OFF_TRACK' ? 'Off Track' : 'At Risk'}
            </span>
          </div>
          <ProgressBar progress={p.progress} />
        </div>
      ))}
    </div>
  );
};

const AdminHomeDashboard: React.FC = () => {
  const { projects, users, getWeekNumber } = useAppContext();

  const portfolioStats = useMemo(
    () => ({
      totalProjects: projects.length,
      completedProjects: projects.filter(
        (p) => p.status === ProjectStatus.Completed
      ).length,
      onTrackProjects: projects.filter(
        (p) => p.health === ProjectHealth.OnTrack
      ).length,
      totalEmployees: users.filter((u) => u.role === Role.Employee).length,
    }),
    [projects, users]
  );

  const timeSpentData = useMemo(() => {
    const data: { [key: string]: number } = {};
    projects.forEach((p) => {
      p.tasks.forEach((t) => {
        if (t.completedAt) {
          const date = t.completedAt;
          data[date] = (data[date] || 0) + t.loggedHours * 60; // in minutes
        }
      });
    });
    return Object.entries(data)
      .map(([date, minutes]) => ({
        date,
        value: minutes,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [projects]);

  const tasksCompletedWeeklyData = useMemo(() => {
    const data: { [key: number]: number } = {};
    projects.forEach((p) => {
      p.tasks.forEach((t) => {
        if (t.status === TaskStatus.Completed && t.completedAt) {
          const week = getWeekNumber(new Date(t.completedAt));
          data[week] = (data[week] || 0) + 1;
        }
      });
    });
    return Object.entries(data)
      .map(([week, count]) => ({
        label: `W${week}`,
        value: count,
      }))
      .slice(-8); // Get last 8 weeks
  }, [projects, getWeekNumber]);

  const projectStatusData = useMemo(() => {
    if (!projects) return [];
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<ProjectStatus, number>);

    const statusColors: Record<ProjectStatus, string> = {
      [ProjectStatus.Completed]: '#10b981', // emerald-500
      [ProjectStatus.InProgress]: '#38bdf8', // sky-400
      [ProjectStatus.OnHold]: '#f59e0b', // amber-500
      [ProjectStatus.NotStarted]: '#64748b', // slate-500
    };

    // FIX: The use of Object.entries was causing type inference issues for the 'value' property,
    // resulting in 'unknown' type. Switched to Object.keys with a type assertion to ensure
    // type safety for chart data and sorting operations.
    return (Object.keys(statusCounts) as ProjectStatus[])
      .map((status) => ({
        label: status,
        value: statusCounts[status],
        color: statusColors[status],
      }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Projects'
          value={portfolioStats.totalProjects}
          icon={<BriefcaseIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Completed'
          value={portfolioStats.completedProjects}
          icon={<CheckCircleIcon className='w-6 h-6' />}
        />
        <StatCard
          title='On Track'
          value={`${portfolioStats.onTrackProjects} / ${portfolioStats.totalProjects}`}
          icon={<TrendingUpIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Total Employees'
          value={portfolioStats.totalEmployees}
          icon={<UsersIcon className='w-6 h-6' />}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
        <Card title='Productivity (Hours Logged)'>
          <LineChart data={timeSpentData} />
        </Card>
        <Card title='Tasks Completed Per Week'>
          <WeeklyBarChart data={tasksCompletedWeeklyData} />
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <Card title='Project Status'>
          <PieChart data={projectStatusData} />
        </Card>
        <Card title='Team Pulse (Active Tasks)'>
          <TeamPulse />
        </Card>
        <Card title='At-Risk Projects'>
          <AtRiskProjects />
        </Card>
      </div>
    </div>
  );
};

export default AdminHomeDashboard;
