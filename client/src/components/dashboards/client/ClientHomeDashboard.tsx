import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { ProjectHealth, ProjectStatus } from '../../../types';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  WalletIcon,
  TrendingUpIcon,
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

const ClientHomeDashboard: React.FC = () => {
  const { currentUser, projects, billingRecords } = useAppContext();

  const clientProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter((p) => p.clientId === currentUser.id);
  }, [projects, currentUser]);

  const stats = useMemo(() => {
    const totalProjects = clientProjects.length;
    const completedProjects = clientProjects.filter(
      (p) => p.status === ProjectStatus.Completed
    ).length;
    const onTrackProjects = clientProjects.filter(
      (p) => p.health === ProjectHealth.OnTrack
    ).length;
    const totalBilled = billingRecords
      .filter((r) => clientProjects.some((p) => p.id === r.projectId))
      .reduce((sum, r) => sum + r.total, 0);

    return { totalProjects, completedProjects, onTrackProjects, totalBilled };
  }, [clientProjects, billingRecords]);

  const projectStatusData = useMemo(() => {
    if (!clientProjects) return [];
    const statusCounts = clientProjects.reduce((acc, project) => {
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
  }, [clientProjects]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Projects'
          value={stats.totalProjects}
          icon={<BriefcaseIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Completed'
          value={stats.completedProjects}
          icon={<CheckCircleIcon className='w-6 h-6' />}
        />
        <StatCard
          title='On Track'
          value={`${stats.onTrackProjects} / ${stats.totalProjects}`}
          icon={<TrendingUpIcon className='w-6 h-6' />}
        />
        <StatCard
          title='Total Billed'
          value={`$${stats.totalBilled.toLocaleString()}`}
          icon={<WalletIcon className='w-6 h-6' />}
        />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-2'>
          <Card title='Active Projects'>
            <div className='space-y-4'>
              {clientProjects
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
                ))}
              {clientProjects.filter(
                (p) => p.status === ProjectStatus.InProgress
              ).length === 0 && (
                <p className='text-center text-[rgb(var(--text-secondary-rgb))] py-4'>
                  No active projects.
                </p>
              )}
            </div>
          </Card>
        </div>
        <div className='lg:col-span-1'>
          <Card title='Project Status Breakdown'>
            <PieChart data={projectStatusData} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientHomeDashboard;
