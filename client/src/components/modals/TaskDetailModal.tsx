import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';
import Modal from './Modal';
import CommentThread from '../common/CommentThread';
import { ClockIcon, BriefcaseIcon, CalendarIcon } from '../common/Icons';
import LogTimeModal from './LogTimeModal';

interface TaskDetailModalProps {
  task: Task;
  project: { id: number; name: string };
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  project,
  onClose,
}) => {
  const { updateTaskStatus, addComment } = useAppContext();
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTaskStatus(project.id, task.id, e.target.value as TaskStatus);
  };

  const handleAddComment = (content: string) => {
    addComment('task', { projectId: project.id, taskId: task.id }, content);
  };

  return (
    <>
      <Modal title={task.title} onClose={onClose} size='max-w-4xl'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <h3 className='font-semibold text-[rgb(var(--text-primary-rgb))] mb-3 text-lg border-b border-[rgb(var(--border-color-rgb))] pb-2'>
              Comments
            </h3>
            <CommentThread
              comments={task.comments}
              onAddComment={handleAddComment}
            />
          </div>
          <div className='space-y-6'>
            <div>
              <label
                htmlFor='task-status'
                className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] block mb-1'>
                Status
              </label>
              <select
                id='task-status'
                value={task.status}
                onChange={handleStatusChange}
                className='w-full p-2.5 border border-[rgb(var(--border-color-rgb))] rounded-lg bg-[rgb(var(--bg-secondary-rgb))]'>
                {/* FIX: Replaced Object.values with an explicit array for type safety. */}
                {[
                  TaskStatus.ToDo,
                  TaskStatus.InProgress,
                  TaskStatus.Completed,
                  TaskStatus.OnHold,
                ].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Details
              </h4>
              <div className='p-3 bg-[rgb(var(--bg-tertiary-rgb))] rounded-lg space-y-2 text-sm border border-[rgb(var(--border-color-rgb))]'>
                <div className='flex items-center gap-3'>
                  <BriefcaseIcon className='w-5 h-5 text-[rgb(var(--text-secondary-rgb))]' />
                  <div>
                    <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                      Project
                    </p>
                    <p className='font-semibold text-[rgb(var(--text-primary-rgb))]'>
                      {project.name}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <CalendarIcon className='w-5 h-5 text-[rgb(var(--text-secondary-rgb))]' />
                  <div>
                    <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                      Due Date
                    </p>
                    <p className='font-semibold text-[rgb(var(--text-primary-rgb))]'>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <ClockIcon className='w-5 h-5 text-[rgb(var(--text-secondary-rgb))]' />
                  <div>
                    <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                      Time Logged
                    </p>
                    <p className='font-semibold text-[rgb(var(--text-primary-rgb))]'>
                      {task.loggedHours} hours
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsLoggingTime(true)}
                className='text-sm text-[rgb(var(--accent-primary-rgb))] hover:underline mt-2 w-full text-left p-1'>
                Log More Time
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {isLoggingTime && (
        <LogTimeModal
          task={task}
          projectId={project.id}
          onClose={() => setIsLoggingTime(false)}
        />
      )}
    </>
  );
};

export default TaskDetailModal;
