import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import type { Task } from '../../../types';
import { TaskStatus } from '../../../types';
import KanbanBoard from '../../common/KanbanBoard';
import CalendarView from '../../common/CalendarView';
import TaskDetailModal from '../../modals/TaskDetailModal';
import { KanbanIcon, CalendarIcon } from '../../common/Icons';
import Card from '../../common/Card';

const TodayFocus: React.FC = () => {
  const { currentUser, projects } = useAppContext();
  const today = new Date().toISOString().split('T')[0];
  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return projects.flatMap((p) =>
      p.tasks.filter((t) => p.assignedTo.includes(currentUser.id))
    );
  }, [projects, currentUser]);

  const tasksDueToday = myTasks.filter(
    (t) => t.dueDate === today && t.status !== TaskStatus.Completed
  ).length;
  const completedThisWeek = myTasks.filter((t) => {
    if (t.status !== TaskStatus.Completed || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    const todayDate = new Date();
    const pastDate = new Date();
    pastDate.setDate(todayDate.getDate() - 7);
    return completedDate >= pastDate && completedDate <= todayDate;
  }).length;

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div className='bg-[rgb(var(--bg-tertiary-rgb))] p-4 rounded-lg border border-[rgb(var(--border-color-rgb))]'>
        <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
          In Progress
        </h4>
        <p className='text-2xl font-bold text-[rgb(var(--text-primary-rgb))]'>
          {myTasks.filter((t) => t.status === TaskStatus.InProgress).length}
        </p>
      </div>
      <div className='bg-[rgb(var(--bg-tertiary-rgb))] p-4 rounded-lg border border-[rgb(var(--border-color-rgb))]'>
        <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
          Due Today
        </h4>
        <p className='text-2xl font-bold text-amber-500'>{tasksDueToday}</p>
      </div>
      <div className='bg-[rgb(var(--bg-tertiary-rgb))] p-4 rounded-lg border border-[rgb(var(--border-color-rgb))]'>
        <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
          Completed (7d)
        </h4>
        <p className='text-2xl font-bold text-emerald-500'>
          {completedThisWeek}
        </p>
      </div>
      <div className='bg-[rgb(var(--bg-tertiary-rgb))] p-4 rounded-lg border border-[rgb(var(--border-color-rgb))]'>
        <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
          Total Tasks
        </h4>
        <p className='text-2xl font-bold text-[rgb(var(--text-primary-rgb))]'>
          {myTasks.length}
        </p>
      </div>
    </div>
  );
};

const MyTasksView: React.FC = () => {
  const { currentUser, projects, updateTaskStatus } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<{
    task: Task;
    project: { id: number; name: string };
  } | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');

  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return projects.flatMap((p) =>
      p.tasks
        .filter((t) => p.assignedTo.includes(currentUser.id))
        .map((t) => ({ ...t, projectId: p.id, projectName: p.name }))
    );
  }, [projects, currentUser]);

  const handleTaskStatusChange = (
    taskId: number,
    newStatus: TaskStatus,
    projectId?: number
  ) => {
    if (projectId) {
      updateTaskStatus(projectId, taskId, newStatus);
    }
  };

  const openTaskModal = (
    task: Task & { projectId?: number; projectName?: string }
  ) => {
    if (task.projectId && task.projectName) {
      setSelectedTask({
        task,
        project: { id: task.projectId, name: task.projectName },
      });
    }
  };

  return (
    <div className='space-y-6 h-full flex flex-col'>
      <div className='flex-shrink-0'>
        <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4'>
          <div>
            <h2 className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
              My Tasks
            </h2>
            <p className='text-[rgb(var(--text-secondary-rgb))] mt-1'>
              Organize and track your assigned work.
            </p>
          </div>
          <div className='bg-[rgb(var(--bg-tertiary-rgb))] p-1 rounded-lg flex self-start border border-[rgb(var(--border-color-rgb))]'>
            <button
              onClick={() => setViewMode('kanban')}
              title='Kanban View'
              className={`p-1.5 rounded-md ${
                viewMode === 'kanban'
                  ? 'bg-[rgb(var(--bg-secondary-rgb))] shadow-sm text-[rgb(var(--accent-primary-rgb))]'
                  : 'text-[rgb(var(--text-secondary-rgb))]'
              }`}>
              <KanbanIcon className='w-5 h-5' />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              title='Calendar View'
              className={`p-1.5 rounded-md ${
                viewMode === 'calendar'
                  ? 'bg-[rgb(var(--bg-secondary-rgb))] shadow-sm text-[rgb(var(--accent-primary-rgb))]'
                  : 'text-[rgb(var(--text-secondary-rgb))]'
              }`}>
              <CalendarIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
        {viewMode === 'kanban' && <TodayFocus />}
      </div>

      <div className='flex-grow min-h-0'>
        {viewMode === 'kanban' ? (
          <div className='h-full'>
            <div className='h-full overflow-x-auto pb-4'>
              <KanbanBoard
                tasks={myTasks}
                onStatusChange={handleTaskStatusChange}
                onTaskClick={openTaskModal}
              />
            </div>
          </div>
        ) : (
          <CalendarView tasks={myTasks} onTaskClick={openTaskModal} />
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask.task}
          project={selectedTask.project}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default MyTasksView;
