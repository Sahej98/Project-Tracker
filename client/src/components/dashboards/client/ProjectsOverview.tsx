import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import type { Project, ProjectFile } from '../../../types';
import { ProjectStatus, TaskStatus } from '../../../types';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import {
  CheckCircleIcon,
  CircleIcon,
  PauseCircleIcon,
  ArrowPathIcon,
  PaperClipIcon,
  ChevronLeftIcon,
} from '../../common/Icons';
import EmptyState from '../../common/EmptyState';
import CommentThread from '../../common/CommentThread';
import ProjectTimeline from '../../common/ProjectTimeline';
import ProjectSummaryCard from './ProjectSummaryCard';

const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({
  status,
}) => {
  const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full';
  const statusMap = {
    [ProjectStatus.Completed]: 'bg-emerald-500/10 text-emerald-400',
    [ProjectStatus.InProgress]: 'bg-sky-500/10 text-sky-400',
    [ProjectStatus.OnHold]: 'bg-amber-500/10 text-amber-400',
    [ProjectStatus.NotStarted]: 'bg-slate-500/10 text-slate-400',
  };
  return (
    <span className={`${baseClasses} ${statusMap[status]}`}>{status}</span>
  );
};

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive
        ? 'bg-[rgb(var(--accent-primary-rgb))] text-white shadow-sm'
        : 'text-[rgb(var(--text-secondary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))]'
    }`}>
    {label}
  </button>
);

const ProjectDetailView: React.FC<{ project: Project }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = ['overview', 'tasks', 'files', 'budget', 'comments'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab project={project} />;
      case 'tasks':
        return <TasksTab tasks={project.tasks} />;
      case 'files':
        return <FilesTab files={project.files} />;
      case 'budget':
        return <BudgetTab project={project} />;
      case 'comments':
        return (
          <CommentThread
            comments={project.comments}
            onAddComment={(content) => {}}
            isReadOnly={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className='flex flex-col' padding='p-0'>
      <div className='px-6 py-5 border-b border-[rgb(var(--border-color-rgb))]'>
        <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4'>
          <div>
            <h3 className='text-2xl font-bold text-[rgb(var(--text-primary-rgb))]'>
              {project.name}
            </h3>
            <p className='text-sm text-[rgb(var(--text-secondary-rgb))] mt-1'>
              {project.category}
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </div>
      <div className='px-6 py-3 border-b border-[rgb(var(--border-color-rgb))]'>
        <div className='flex items-center gap-2 overflow-x-auto'>
          {tabs.map((tab) => (
            <TabButton
              key={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
      </div>
      <div className='p-6 flex-grow bg-[rgba(var(--bg-primary-rgb),0.5)] rounded-b-lg'>
        {renderTabContent()}
      </div>
    </Card>
  );
};

const OverviewTab: React.FC<{ project: Project }> = ({ project }) => {
  const { findUserById } = useAppContext();
  return (
    <div className='space-y-8'>
      <ProjectTimeline
        milestones={project.milestones}
        startDate={project.startDate}
        deadline={project.deadline}
      />
      <div>
        <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))] mb-2'>
          Description
        </h4>
        <p className='text-sm text-[rgb(var(--text-primary-rgb))]'>
          {project.description}
        </p>
      </div>
      <div>
        <h4 className='font-semibold text-[rgb(var(--text-secondary-rgb))] mb-2'>
          Assigned Team
        </h4>
        <div className='flex -space-x-2'>
          {project.assignedTo.length > 0 ? (
            project.assignedTo.map((id) => {
              const user = findUserById(id);
              return user ? (
                <img
                  key={id}
                  src={user.avatar}
                  alt={user.name}
                  className='w-9 h-9 rounded-full ring-2 ring-[rgb(var(--bg-secondary-rgb))]'
                  title={user.name}
                />
              ) : null;
            })
          ) : (
            <EmptyState message='Team not assigned yet.' compact />
          )}
        </div>
      </div>
      <div>
        <div className='flex justify-between items-center mb-1'>
          <span className='text-sm font-medium text-[rgb(var(--text-secondary-rgb))]'>
            Overall Progress
          </span>
          <span className='text-sm font-bold text-[rgb(var(--accent-primary-rgb))]'>
            {project.progress}%
          </span>
        </div>
        <ProgressBar progress={project.progress} />
      </div>
    </div>
  );
};

const BudgetTab: React.FC<{ project: Project }> = ({ project }) => {
  const { users, findUserById } = useAppContext();

  const amountSpent = React.useMemo(() => {
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
  }, [project, users, findUserById]);

  const budgetRemaining = project.budget - amountSpent;
  const spentPercentage =
    project.budget > 0 ? (amountSpent / project.budget) * 100 : 0;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
        <div className='bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))] p-4 rounded-lg'>
          <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
            Total Budget
          </h4>
          <p className='text-2xl font-bold text-[rgb(var(--text-primary-rgb))]'>
            ${project.budget.toLocaleString()}
          </p>
        </div>
        <div className='bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))] p-4 rounded-lg'>
          <h4 className='text-sm font-semibold text-amber-500'>Amount Spent</h4>
          <p className='text-2xl font-bold text-amber-400'>
            $
            {amountSpent.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className='bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))] p-4 rounded-lg'>
          <h4 className='text-sm font-semibold text-emerald-500'>Remaining</h4>
          <p className='text-2xl font-bold text-emerald-400'>
            $
            {budgetRemaining.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
      <div>
        <div className='flex justify-between items-center mb-1'>
          <span className='text-sm font-medium text-[rgb(var(--text-secondary-rgb))]'>
            Budget Usage
          </span>
          <span className='text-sm font-bold text-sky-400'>
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className='w-full bg-[rgb(var(--bg-tertiary-rgb))] rounded-full h-4'>
          <div
            className='bg-amber-500 h-4 rounded-full'
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const TasksTab: React.FC<{ tasks: Project['tasks'] }> = ({ tasks }) => (
  <div className='space-y-3'>
    {tasks.length > 0 ? (
      tasks.map((task) => {
        let icon, style;
        switch (task.status) {
          case TaskStatus.Completed:
            icon = (
              <CheckCircleIcon className='w-5 h-5 text-emerald-500 flex-shrink-0' />
            );
            style = 'text-[rgb(var(--text-secondary-rgb))] line-through';
            break;
          case TaskStatus.InProgress:
            icon = (
              <ArrowPathIcon className='w-5 h-5 text-sky-500 animate-spin flex-shrink-0' />
            );
            style = 'text-[rgb(var(--text-primary-rgb))] font-medium';
            break;
          case TaskStatus.OnHold:
            icon = (
              <PauseCircleIcon className='w-5 h-5 text-amber-500 flex-shrink-0' />
            );
            style = 'text-[rgb(var(--text-secondary-rgb))] italic';
            break;
          default:
            icon = (
              <CircleIcon className='w-5 h-5 text-slate-400 flex-shrink-0' />
            );
            style = 'text-[rgb(var(--text-primary-rgb))]';
        }
        return (
          <div
            key={task.id}
            className='flex items-center gap-3 text-sm p-3 rounded-lg bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))]'>
            {icon}
            <span className={style}>{task.title}</span>
          </div>
        );
      })
    ) : (
      <EmptyState message='No tasks defined for this project.' />
    )}
  </div>
);

const FilesTab: React.FC<{ files: ProjectFile[] }> = ({ files }) => (
  <div>
    {files.length > 0 ? (
      <ul className='divide-y divide-[rgb(var(--border-color-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg'>
        {files.map((file) => (
          <li
            key={file.id}
            className='flex items-center justify-between p-3 hover:bg-[rgb(var(--bg-primary-rgb))]'>
            <div className='flex items-center gap-3 min-w-0'>
              <PaperClipIcon className='w-5 h-5 text-[rgb(var(--text-secondary-rgb))] flex-shrink-0' />
              <div className='min-w-0'>
                <a
                  href={file.url}
                  className='text-sm font-medium text-[rgb(var(--accent-primary-rgb))] hover:underline truncate'>
                  {file.name}
                </a>
                <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                  {file.type} - {file.size}
                </p>
              </div>
            </div>
            <p className='text-xs text-[rgb(var(--text-secondary-rgb))] flex-shrink-0 ml-4'>
              Uploaded: {file.uploadedAt}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <EmptyState message='No files have been attached to this project.' />
    )}
  </div>
);

const ProjectsOverview: React.FC = () => {
  const { currentUser, projects } = useAppContext();
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  const clientProjects = projects.filter(
    (p) => currentUser && p.clientId === currentUser.id
  );
  const activeProject = clientProjects.find((p) => p.id === activeProjectId);

  if (activeProject) {
    return (
      <div className='space-y-4'>
        <button
          onClick={() => setActiveProjectId(null)}
          className='flex items-center gap-2 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))]'>
          <ChevronLeftIcon className='w-5 h-5' />
          Back to all projects
        </button>
        <ProjectDetailView project={activeProject} />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
        My Projects
      </h2>
      {clientProjects.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {clientProjects.map((project) => (
            <ProjectSummaryCard
              key={project.id}
              project={project}
              onViewDetails={() => setActiveProjectId(project.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState message='You do not have any active projects with us.' />
        </Card>
      )}
    </div>
  );
};

export default ProjectsOverview;
