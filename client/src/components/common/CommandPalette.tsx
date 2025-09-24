import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Project, User, Task } from '../../types';
import { Role } from '../../types';
import { BriefcaseIcon, UsersIcon, TasksIcon } from './Icons';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (view: 'project_board' | 'employee_profile', id: number) => void;
}

// Define a discriminated union type for search results to help TypeScript with type narrowing.
type SearchResultItem =
  | ({ type: 'Project' } & Project)
  | ({ type: 'Employee' } & User)
  | ({ type: 'Task' } & Task & { projectId: number });

const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClose,
  onNavigate,
}) => {
  const { projects, users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchResults = useMemo((): SearchResultItem[] => {
    if (!searchTerm) return [];

    const lowerSearch = searchTerm.toLowerCase();

    const projectResults = projects
      .filter((p) => p.name.toLowerCase().includes(lowerSearch))
      .map((p) => ({ type: 'Project' as const, ...p }));

    const employeeResults = users
      .filter(
        (u) =>
          u.role === Role.Employee && u.name.toLowerCase().includes(lowerSearch)
      )
      .map((u) => ({ type: 'Employee' as const, ...u }));

    const taskResults = projects.flatMap((p) =>
      p.tasks
        .filter((t) => t.title.toLowerCase().includes(lowerSearch))
        .map((t) => ({ type: 'Task' as const, projectId: p.id, ...t }))
    );

    return [...projectResults, ...employeeResults, ...taskResults];
  }, [searchTerm, projects, users]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, searchResults.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults.length > 0) {
        e.preventDefault();
        handleSelect(searchResults[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex]);

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'Project' || item.type === 'Task') {
      onNavigate(
        'project_board',
        item.type === 'Project' ? item.id : item.projectId
      );
    } else if (item.type === 'Employee') {
      onNavigate('employee_profile', item.id);
    }
    onClose();
  };

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-[100] pt-20'
      onClick={onClose}>
      <div
        className='bg-[rgb(var(--bg-secondary-rgb))] rounded-lg shadow-2xl w-full max-w-xl transform transition-all duration-300 animate-fade-in-scale flex flex-col'
        onClick={(e) => e.stopPropagation()}>
        <div className='p-3 border-b border-[rgb(var(--border-color-rgb))]'>
          <input
            type='text'
            className='w-full text-lg px-2 py-1 bg-transparent focus:outline-none'
            placeholder='Search for projects, people, tasks...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <div className='max-h-96 overflow-y-auto'>
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((item, index) => {
                let icon, title, subtitle;
                if (item.type === 'Project') {
                  icon = <BriefcaseIcon className='w-5 h-5 text-slate-400' />;
                  title = item.name;
                  subtitle = 'Project';
                } else if (item.type === 'Employee') {
                  icon = <UsersIcon className='w-5 h-5 text-slate-400' />;
                  title = item.name;
                  subtitle = 'Employee';
                } else {
                  // Task
                  icon = <TasksIcon className='w-5 h-5 text-slate-400' />;
                  title = item.title;
                  subtitle = `Task in ${
                    projects.find((p) => p.id === item.projectId)?.name
                  }`;
                }
                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                      selectedIndex === index
                        ? 'bg-indigo-500/10'
                        : 'hover:bg-indigo-500/5'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}>
                    {icon}
                    <div>
                      <p className='font-medium text-[rgb(var(--text-primary-rgb))]'>
                        {title}
                      </p>
                      <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                        {subtitle}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className='p-8 text-center text-[rgb(var(--text-secondary-rgb))]'>
              {searchTerm ? 'No results found.' : 'Start typing to search.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
