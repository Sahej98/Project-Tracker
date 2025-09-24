import React, { useMemo } from 'react';
import type { Project } from '../../../types';
import { ProjectHealth } from '../../../types';
import ProgressBar from '../../common/ProgressBar';
import { useAppContext } from '../../../contexts/AppContext';
import Card from '../../common/Card';

interface ProjectSummaryCardProps {
  project: Project;
  onViewDetails: () => void;
}

const ProjectHealthIndicator: React.FC<{ health: ProjectHealth }> = ({
  health,
}) => {
  const healthConfig = {
    [ProjectHealth.OnTrack]: {
      text: 'On Track',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    [ProjectHealth.AtRisk]: {
      text: 'At Risk',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    [ProjectHealth.OffTrack]: {
      text: 'Off Track',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  };
  const { text, color, bg } = healthConfig[health];
  return (
    <div
      className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-2 ${bg} ${color}`}>
      <span
        className={`w-2 h-2 rounded-full ${color
          .replace('text', 'bg')
          .replace('-400', '-500')}`}></span>
      <span>{text}</span>
    </div>
  );
};

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({
  project,
  onViewDetails,
}) => {
  const { findUserById } = useAppContext();
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(project.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const amountSpent = useMemo(() => {
    let totalCost = 0;
    project.tasks.forEach((task) => {
      const assignments = project.assignedTo
        .map(findUserById)
        .filter((u) => u?.role === 'EMPLOYEE' && u.hourlyRate);
      if (assignments.length > 0) {
        const avgRate =
          assignments.reduce((sum, u) => sum + (u!.hourlyRate || 0), 0) /
          assignments.length;
        totalCost += task.loggedHours * avgRate;
      }
    });
    return totalCost;
  }, [project, findUserById]);

  const budgetUsage =
    project.budget > 0 ? (amountSpent / project.budget) * 100 : 0;

  const nextMilestone = useMemo(() => {
    return project.milestones
      .filter((m) => m.status === 'UPCOMING')
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];
  }, [project.milestones]);

  return (
    <Card
      padding='p-0'
      className='flex flex-col hover:border-[rgb(var(--accent-primary-rgb))] transition-all duration-300'>
      <div className='flex flex-col space-y-4 p-6 flex-grow'>
        <div className='flex justify-between items-start'>
          <h3 className='text-lg font-bold text-[rgb(var(--text-primary-rgb))]'>
            {project.name}
          </h3>
          <ProjectHealthIndicator health={project.health} />
        </div>

        <div>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-sm font-medium text-[rgb(var(--text-secondary-rgb))]'>
              Progress
            </span>
            <span className='text-sm font-bold text-[rgb(var(--accent-primary-rgb))]'>
              {project.progress}%
            </span>
          </div>
          <ProgressBar progress={project.progress} />
        </div>

        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='bg-[rgb(var(--bg-primary-rgb))] p-3 rounded-lg border border-[rgb(var(--border-color-rgb))]'>
            <p className='text-[rgb(var(--text-secondary-rgb))] font-semibold'>
              Budget Used
            </p>
            <p className='font-bold text-lg text-[rgb(var(--text-primary-rgb))]'>
              {budgetUsage.toFixed(0)}%
            </p>
          </div>
          <div className='bg-[rgb(var(--bg-primary-rgb))] p-3 rounded-lg border border-[rgb(var(--border-color-rgb))]'>
            <p className='text-[rgb(var(--text-secondary-rgb))] font-semibold'>
              Days Left
            </p>
            <p className='font-bold text-lg text-[rgb(var(--text-primary-rgb))]'>
              {daysLeft}
            </p>
          </div>
        </div>

        {nextMilestone && (
          <div className='text-sm'>
            <p className='text-[rgb(var(--text-secondary-rgb))] font-semibold'>
              Next Milestone
            </p>
            <p className='font-bold text-[rgb(var(--text-primary-rgb))]'>
              {nextMilestone.name} -{' '}
              <span className='font-normal'>
                {new Date(nextMilestone.date).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className='p-4 bg-[rgba(var(--bg-primary-rgb),0.5)] rounded-b-lg border-t border-[rgb(var(--border-color-rgb))] mt-auto'>
        <button
          onClick={onViewDetails}
          className='w-full text-center bg-[rgb(var(--accent-primary-rgb))] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-colors'>
          View Details
        </button>
      </div>
    </Card>
  );
};

export default ProjectSummaryCard;
