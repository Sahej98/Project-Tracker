import React, { useMemo } from 'react';
import type { Milestone } from '../../types';
import { CheckCircleIcon } from './Icons';

interface ProjectTimelineProps {
  milestones: Milestone[];
  startDate: string;
  deadline: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  milestones,
  startDate,
  deadline,
}) => {
  const sortedMilestones = useMemo(() => {
    const allEvents = [
      {
        id: 'start',
        name: 'Project Start',
        date: startDate,
        status: 'COMPLETED' as const,
      },
      ...milestones,
      {
        id: 'end',
        name: 'Project Deadline',
        date: deadline,
        status: 'UPCOMING' as const,
      },
    ];
    return allEvents.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [milestones, startDate, deadline]);

  if (sortedMilestones.length <= 2) {
    return null; // Don't show if there are no milestones
  }

  return (
    <div>
      <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))] mb-4'>
        Project Timeline
      </h4>
      <div className='relative flex justify-between items-center w-full pt-10'>
        <div className='absolute top-10 left-0 w-full h-0.5 bg-[rgb(var(--border-color-rgb))]'></div>
        {sortedMilestones.map((milestone, index) => {
          const isCompleted = milestone.status === 'COMPLETED';
          return (
            <div
              key={milestone.id}
              className='relative z-10 flex flex-col items-center'>
              <div
                className={`w-4 h-4 rounded-full border-2 border-[rgb(var(--bg-secondary-rgb))] ring-2 ${
                  isCompleted
                    ? 'bg-[rgb(var(--accent-primary-rgb))] ring-[rgb(var(--accent-primary-rgb))]'
                    : 'bg-[rgb(var(--border-color-rgb))] ring-[rgb(var(--border-color-rgb))]'
                }`}>
                {isCompleted && (
                  <CheckCircleIcon className='w-full h-full text-white' />
                )}
              </div>
              <div className='absolute -top-6 text-center w-24'>
                <p
                  className={`text-xs font-semibold ${
                    isCompleted
                      ? 'text-[rgb(var(--accent-primary-rgb))]'
                      : 'text-[rgb(var(--text-secondary-rgb))]'
                  }`}>
                  {milestone.name}
                </p>
                <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                  {new Date(milestone.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline;
