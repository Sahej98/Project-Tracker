import React from 'react';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';
import { ClockIcon, MessageSquareIcon, CalendarIcon } from './Icons';

interface KanbanCardProps {
  task: Task & { projectId?: number; projectName?: string };
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < today && task.status !== TaskStatus.Completed;

  return (
    <div
      onClick={onClick}
      className='bg-[rgb(var(--bg-secondary-rgb))] p-4 rounded-lg border border-[rgb(var(--border-color-rgb))] shadow-sm hover:shadow-md hover:border-[rgb(var(--accent-primary-rgb))] cursor-pointer transition-all transform hover:-translate-y-1'>
      <p className='font-semibold text-base text-[rgb(var(--text-primary-rgb))] mb-2'>
        {task.title}
      </p>
      {task.projectName && (
        <p className='text-xs font-medium text-[rgb(var(--text-secondary-rgb))] bg-[rgba(var(--bg-tertiary-rgb),0.7)] px-2 py-1 rounded-full inline-block mb-3'>
          {task.projectName}
        </p>
      )}
      <div className='flex justify-between items-center text-xs text-[rgb(var(--text-secondary-rgb))]'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1' title='Logged Hours'>
            <ClockIcon className='w-3.5 h-3.5' />
            <span>{task.loggedHours}h</span>
          </div>
          <div className='flex items-center gap-1' title='Comments'>
            <MessageSquareIcon className='w-3.5 h-3.5' />
            <span>{task.comments.length}</span>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded-full ${
            isOverdue ? 'text-red-500 bg-red-500/10' : ''
          }`}
          title='Due Date'>
          <CalendarIcon className='w-3.5 h-3.5' />
          <span>
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: (Task & { projectId?: number; projectName?: string })[];
  onTaskClick: (
    task: Task & { projectId?: number; projectName?: string }
  ) => void;
  footer?: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  footer,
}) => {
  const statusConfig = {
    [TaskStatus.ToDo]: { title: 'To Do', color: 'border-slate-400' },
    [TaskStatus.InProgress]: { title: 'In Progress', color: 'border-sky-500' },
    [TaskStatus.Completed]: { title: 'Completed', color: 'border-emerald-500' },
    [TaskStatus.OnHold]: { title: 'On Hold', color: 'border-amber-500' },
  };

  return (
    <div className='flex-shrink-0 w-80 bg-[rgb(var(--bg-tertiary-rgb))] rounded-xl flex flex-col h-full border border-[rgb(var(--border-color-rgb))] shadow-sm'>
      <div
        className={`p-4 border-b-2 ${statusConfig[status].color} flex justify-between items-center`}>
        <h3 className='font-bold text-base text-[rgb(var(--text-primary-rgb))]'>
          {statusConfig[status].title}
        </h3>
        <p className='text-sm font-semibold text-white bg-[rgb(var(--text-secondary-rgb))] rounded-full px-2 py-0.5'>
          {tasks.length}
        </p>
      </div>
      <div className='p-3 space-y-3 overflow-y-auto flex-grow'>
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
      {footer && (
        <div className='p-2 border-t border-[rgb(var(--border-color-rgb))]'>
          {footer}
        </div>
      )}
    </div>
  );
};

interface KanbanBoardProps {
  tasks: (Task & { projectId?: number; projectName?: string })[];
  onStatusChange: (
    taskId: number,
    newStatus: TaskStatus,
    projectId?: number
  ) => void;
  onTaskClick: (
    task: Task & { projectId?: number; projectName?: string }
  ) => void;
  renderColumnFooter?: (status: TaskStatus) => React.ReactNode;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onTaskClick,
  renderColumnFooter,
}) => {
  const columns: TaskStatus[] = [
    TaskStatus.ToDo,
    TaskStatus.InProgress,
    TaskStatus.Completed,
    TaskStatus.OnHold,
  ];

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className='flex gap-4 h-full'>
      {columns.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus(status)}
          onTaskClick={onTaskClick}
          footer={renderColumnFooter ? renderColumnFooter(status) : undefined}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
