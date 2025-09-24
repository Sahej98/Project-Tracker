import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import type { Project } from '../../../types';
import { ProjectStatus, ProjectHealth } from '../../../types';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import {
  EditIcon,
  TrashIcon,
  TasksIcon,
  PlusIcon,
  TagIcon,
  PaperClipIcon,
  EyeIcon,
  GanttChartIcon,
  KanbanIcon,
  UsersIcon,
} from '../../common/Icons';
import AddEditProjectModal from '../../modals/AddEditProjectModal';
import AssignProjectModal from '../../modals/AssignProjectModal';
import ConfirmationModal from '../../modals/ConfirmationModal';
import ProjectFilesModal from '../../modals/ProjectFilesModal';
import EmptyState from '../../common/EmptyState';
import GanttChart from '../../common/GanttChart';

const ProjectHealthIndicator: React.FC<{ health: ProjectHealth }> = ({
  health,
}) => {
  const healthConfig = {
    [ProjectHealth.OnTrack]: { text: 'On Track', color: 'bg-emerald-500' },
    [ProjectHealth.AtRisk]: { text: 'At Risk', color: 'bg-amber-500' },
    [ProjectHealth.OffTrack]: { text: 'Off Track', color: 'bg-red-500' },
  };
  const { text, color } = healthConfig[health];
  return (
    <div className='flex items-center gap-2'>
      <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
      <span className='text-sm text-[rgb(var(--text-primary-rgb))]'>
        {text}
      </span>
    </div>
  );
};

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

const ProjectActions: React.FC<{
  project: Project;
  onEdit: () => void;
  onAssign: () => void;
  onFiles: () => void;
  onDelete: () => void;
  onViewBoard: () => void;
}> = ({ project, onEdit, onAssign, onFiles, onDelete, onViewBoard }) => (
  <div className='flex justify-end items-center space-x-1'>
    <button
      onClick={onViewBoard}
      title='View Board'
      className='p-2 text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] rounded-full transition-colors'>
      <EyeIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onAssign}
      title='Assign Users'
      className='p-2 text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] rounded-full transition-colors'>
      <UsersIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onFiles}
      title='Files'
      className='p-2 text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] rounded-full transition-colors'>
      <PaperClipIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onEdit}
      title='Edit'
      className='p-2 text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))] rounded-full transition-colors'>
      <EditIcon className='w-5 h-5' />
    </button>
    <button
      onClick={onDelete}
      title='Delete'
      className='p-2 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full transition-colors'>
      <TrashIcon className='w-5 h-5' />
    </button>
  </div>
);

interface ProjectsManagementProps {
  onViewProjectBoard: (projectId: number) => void;
}

const ProjectsManagement: React.FC<ProjectsManagementProps> = ({
  onViewProjectBoard,
}) => {
  const { projects, findUserById, deleteProject } = useAppContext();
  const [assignModalProject, setAssignModalProject] = useState<Project | null>(
    null
  );
  const [addEditModalProject, setAddEditModalProject] = useState<
    Project | null | undefined
  >(undefined);
  const [filesModalProject, setFilesModalProject] = useState<Project | null>(
    null
  );
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const projectCategories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        categoryFilter === 'All' || project.category === categoryFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        project.name.toLowerCase().includes(searchLower) ||
        findUserById(project.clientId)
          ?.name.toLowerCase()
          .includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [projects, searchTerm, categoryFilter, findUserById]);

  const handleEdit = (project: Project) => setAddEditModalProject(project);
  const handleAddNew = () => setAddEditModalProject(null);
  const handleDeleteConfirm = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  const actions = (
    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className='bg-[rgb(var(--bg-secondary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))]'>
        {projectCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <div className='bg-[rgb(var(--bg-tertiary-rgb))] p-1 rounded-lg flex border border-[rgb(var(--border-color-rgb))]'>
        <button
          onClick={() => setViewMode('list')}
          title='List View'
          className={`p-1.5 rounded-md ${
            viewMode === 'list'
              ? 'bg-[rgb(var(--bg-secondary-rgb))] shadow-sm text-[rgb(var(--accent-primary-rgb))]'
              : 'text-[rgb(var(--text-secondary-rgb))]'
          }`}>
          <TasksIcon className='w-5 h-5' />
        </button>
        <button
          onClick={() => setViewMode('gantt')}
          title='Gantt View'
          className={`p-1.5 rounded-md ${
            viewMode === 'gantt'
              ? 'bg-[rgb(var(--bg-secondary-rgb))] shadow-sm text-[rgb(var(--accent-primary-rgb))]'
              : 'text-[rgb(var(--text-secondary-rgb))]'
          }`}>
          <GanttChartIcon className='w-5 h-5' />
        </button>
      </div>
      <button
        onClick={handleAddNew}
        className='flex items-center gap-2 text-sm bg-[rgb(var(--accent-primary-rgb))] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-colors'>
        <PlusIcon className='w-4 h-4' />
        New Project
      </button>
    </div>
  );

  return (
    <div className='space-y-6'>
      <Card title='All Projects' actions={actions} padding='p-0'>
        {viewMode === 'list' ? (
          <>
            <div className='overflow-x-auto hidden lg:block'>
              <table className='w-full text-left'>
                <thead className='bg-[rgb(var(--bg-tertiary-rgb))]'>
                  <tr className='border-b border-[rgb(var(--border-color-rgb))]'>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                      Project
                    </th>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                      Health
                    </th>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                      Assigned To
                    </th>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                      Progress
                    </th>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-right'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[rgb(var(--border-color-rgb))]'>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className='hover:bg-[rgba(var(--bg-tertiary-rgb),0.4)] transition-colors'>
                        <td className='p-4'>
                          <div className='font-bold text-[rgb(var(--text-primary-rgb))]'>
                            {project.name}
                          </div>
                          <div className='text-xs text-[rgb(var(--text-secondary-rgb))] flex items-center gap-1.5'>
                            <TagIcon className='w-3 h-3' />
                            {project.category}
                          </div>
                        </td>
                        <td className='p-4'>
                          <ProjectHealthIndicator health={project.health} />
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center -space-x-2'>
                            {project.assignedTo.slice(0, 4).map((id) => (
                              <img
                                key={id}
                                src={findUserById(id)?.avatar}
                                alt={findUserById(id)?.name}
                                className='w-8 h-8 rounded-full ring-2 ring-[rgb(var(--bg-secondary-rgb))]'
                                title={findUserById(id)?.name}
                              />
                            ))}
                            {project.assignedTo.length > 4 && (
                              <div className='w-8 h-8 rounded-full ring-2 ring-[rgb(var(--bg-secondary-rgb))] bg-[rgb(var(--bg-tertiary-rgb))] flex items-center justify-center text-xs font-semibold'>
                                +{project.assignedTo.length - 4}
                              </div>
                            )}
                            {project.assignedTo.length === 0 && (
                              <span className='h-8 flex items-center text-[rgb(var(--text-secondary-rgb))] text-sm italic pl-2'>
                                Unassigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='p-4 min-w-[150px]'>
                          <ProgressBar progress={project.progress} />
                        </td>
                        <td className='p-4'>
                          <ProjectStatusBadge status={project.status} />
                        </td>
                        <td className='p-4'>
                          <ProjectActions
                            project={project}
                            onViewBoard={() => onViewProjectBoard(project.id)}
                            onAssign={() => setAssignModalProject(project)}
                            onFiles={() => setFilesModalProject(project)}
                            onEdit={() => handleEdit(project)}
                            onDelete={() => setDeletingProject(project)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState message='No projects found.' />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='lg:hidden'>
              {filteredProjects.length > 0 ? (
                <div className='divide-y divide-[rgb(var(--border-color-rgb))]'>
                  {filteredProjects.map((project) => (
                    <div key={project.id} className='p-4 space-y-3'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <div className='font-bold text-[rgb(var(--text-primary-rgb))]'>
                            {project.name}
                          </div>
                          <div className='text-xs text-[rgb(var(--text-secondary-rgb))] flex items-center gap-1.5'>
                            <TagIcon className='w-3 h-3' />
                            {project.category}
                          </div>
                        </div>
                        <ProjectStatusBadge status={project.status} />
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between items-center'>
                          <span className='text-[rgb(var(--text-secondary-rgb))]'>
                            Health
                          </span>{' '}
                          <ProjectHealthIndicator health={project.health} />
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-[rgb(var(--text-secondary-rgb))]'>
                            Progress
                          </span>{' '}
                          <span className='font-semibold'>
                            {project.progress}%
                          </span>
                        </div>
                        <ProgressBar progress={project.progress} />
                      </div>
                      <div>
                        <span className='text-sm text-[rgb(var(--text-secondary-rgb))]'>
                          Assigned To
                        </span>
                        <div className='flex items-center -space-x-2 mt-1'>
                          {project.assignedTo.slice(0, 4).map((id) => (
                            <img
                              key={id}
                              src={findUserById(id)?.avatar}
                              alt={findUserById(id)?.name}
                              className='w-8 h-8 rounded-full ring-2 ring-[rgb(var(--bg-secondary-rgb))]'
                              title={findUserById(id)?.name}
                            />
                          ))}
                          {project.assignedTo.length === 0 && (
                            <span className='h-8 flex items-center text-[rgb(var(--text-secondary-rgb))] text-sm italic pl-2'>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='border-t border-[rgb(var(--border-color-rgb))] pt-2'>
                        <ProjectActions
                          project={project}
                          onViewBoard={() => onViewProjectBoard(project.id)}
                          onAssign={() => setAssignModalProject(project)}
                          onFiles={() => setFilesModalProject(project)}
                          onEdit={() => handleEdit(project)}
                          onDelete={() => setDeletingProject(project)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message='No projects found.' />
              )}
            </div>
          </>
        ) : (
          <GanttChart projects={filteredProjects} />
        )}
      </Card>

      {assignModalProject && (
        <AssignProjectModal
          project={assignModalProject}
          onClose={() => setAssignModalProject(null)}
        />
      )}
      {addEditModalProject !== undefined && (
        <AddEditProjectModal
          project={addEditModalProject}
          onClose={() => setAddEditModalProject(undefined)}
        />
      )}
      {filesModalProject && (
        <ProjectFilesModal
          project={filesModalProject}
          onClose={() => setFilesModalProject(null)}
        />
      )}
      {deletingProject && (
        <ConfirmationModal
          title='Delete Project'
          message={`Are you sure you want to delete "${deletingProject.name}"? This action is irreversible.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProject(null)}
          confirmText='Delete'
        />
      )}
    </div>
  );
};

export default ProjectsManagement;
