import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import type { Task } from '../../../types';
import { TaskStatus, ProjectStatus } from '../../../types';
import KanbanBoard from '../../common/KanbanBoard';
import TaskDetailModal from '../../modals/TaskDetailModal';
import { TagIcon, UsersIcon, PlusIcon } from '../../common/Icons';
import ProgressBar from '../../common/ProgressBar';

interface ProjectBoardViewProps {
  projectId: number;
}

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

const AddTaskForm: React.FC<{ onAddTask: (title: string) => void }> = ({
  onAddTask,
}) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-1'>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className='w-full px-3 py-2 bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg text-sm placeholder:text-[rgb(var(--text-secondary-rgb))] focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))]'
        placeholder='Add new task...'
      />
      <button
        type='submit'
        className='mt-2 w-full flex items-center justify-center gap-2 text-sm bg-[rgb(var(--accent-primary-rgb))] text-white font-semibold py-2 px-3 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-colors'>
        <PlusIcon className='w-4 h-4' /> Add Task
      </button>
    </form>
  );
};

const ProjectBoardView: React.FC<ProjectBoardViewProps> = ({ projectId }) => {
  const { projects, findUserById, updateTaskStatus, addTask } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const handleTaskStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateTaskStatus(projectId, taskId, newStatus);
  };

  const handleAddTask = (taskTitle: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default due date 1 week from now
    addTask(projectId, taskTitle, dueDate.toISOString().split('T')[0]);
  };

  if (!project) {
    return <div className='text-center p-8'>Project not found.</div>;
  }

  const tasksWithProjectInfo = project.tasks.map((t) => ({
    ...t,
    projectId: project.id,
    projectName: project.name,
  }));

  const renderColumnFooter = (status: TaskStatus) => {
    if (status === TaskStatus.ToDo) {
      return <AddTaskForm onAddTask={handleAddTask} />;
    }
    return null;
  };

  return (
    <div className='h-full flex flex-col space-y-4'>
      <div className='bg-[rgb(var(--bg-secondary-rgb))] p-4 rounded-lg border border-[rgba(var(--border-color-rgb),0.8)] shadow-sm flex-shrink-0'>
        <div className='flex flex-col sm:flex-row justify-between sm:items-start gap-3'>
          <div>
            <h2 className='text-2xl font-bold text-[rgb(var(--text-primary-rgb))]'>
              {project.name}
            </h2>
            <div className='flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-[rgb(var(--text-secondary-rgb))] mt-1'>
              <span className='flex items-center gap-1.5'>
                <TagIcon className='w-4 h-4' /> {project.category}
              </span>
              <span className='flex items-center gap-1.5'>
                <UsersIcon className='w-4 h-4' />{' '}
                {findUserById(project.clientId)?.name}
              </span>
            </div>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className='mt-4'>
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
      </div>

      <div className='flex-grow min-h-0 overflow-x-auto pb-4'>
        <KanbanBoard
          tasks={tasksWithProjectInfo}
          onStatusChange={handleTaskStatusChange}
          onTaskClick={setSelectedTask}
          renderColumnFooter={renderColumnFooter}
        />
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={{ id: project.id, name: project.name }}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default ProjectBoardView;
