import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { ProjectStatus, Role } from '../../../types';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import { BriefcaseIcon, WalletIcon, TrendingUpIcon } from '../../common/Icons';
import EmptyState from '../../common/EmptyState';

interface ClientProfileViewProps {
  clientId: number;
}

const ClientProfileView: React.FC<ClientProfileViewProps> = ({ clientId }) => {
  const { findUserById, projects } = useAppContext();

  const client = findUserById(clientId);

  const clientProjects = useMemo(() => {
    return projects.filter((p) => p.clientId === clientId);
  }, [projects, clientId]);

  const financialSummary = useMemo(() => {
    const totalBudget = clientProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = clientProjects.reduce((sum, p) => {
      const projectCost = p.tasks.reduce((taskSum, task) => {
        const assignees = p.assignedTo
          .map((id) => findUserById(id))
          .filter((u) => u && u.role === Role.Employee && u.hourlyRate);
        if (assignees.length > 0) {
          const avgRate =
            assignees.reduce(
              (rateSum, u) => rateSum + (u!.hourlyRate || 0),
              0
            ) / assignees.length;
          return taskSum + task.loggedHours * avgRate;
        }
        return taskSum;
      }, 0);
      return sum + projectCost;
    }, 0);
    return { totalBudget, totalSpent };
  }, [clientProjects, findUserById]);

  if (!client) {
    return <div className='text-center p-8'>Client not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <Card padding='p-6'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          <img
            src={client.avatar}
            alt={client.name}
            className='w-24 h-24 rounded-full ring-4 ring-[rgba(var(--accent-primary-rgb),0.2)]'
          />
          <div className='flex-1'>
            <h2 className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))]'>
              {client.name}
            </h2>
            <p className='text-[rgb(var(--accent-primary-rgb))] font-semibold mt-1'>
              {client.role}
            </p>
            <div className='mt-3 pt-3 border-t border-[rgb(var(--border-color-rgb))] flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2 text-sm text-[rgb(var(--text-secondary-rgb))]'>
              <span>
                Email:{' '}
                <a
                  href={`mailto:${client.email}`}
                  className='text-[rgb(var(--text-primary-rgb))] font-medium hover:underline'>
                  {client.email}
                </a>
              </span>
              <span>
                Phone:{' '}
                <span className='text-[rgb(var(--text-primary-rgb))] font-medium'>
                  {client.phone}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <div className='flex items-center gap-4'>
            <BriefcaseIcon className='w-8 h-8 text-sky-400' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Total Projects
              </h4>
              <p className='text-3xl font-bold'>{clientProjects.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className='flex items-center gap-4'>
            <WalletIcon className='w-8 h-8 text-emerald-400' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Total Budget
              </h4>
              <p className='text-3xl font-bold'>
                ${financialSummary.totalBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className='flex items-center gap-4'>
            <TrendingUpIcon className='w-8 h-8 text-amber-400' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[rgb(var(--text-secondary-rgb))]'>
                Total Spent
              </h4>
              <p className='text-3xl font-bold'>
                $
                {financialSummary.totalSpent.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title='Projects' padding='p-0'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b border-[rgb(var(--border-color-rgb))]'>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Project Name
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Status
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Progress
                </th>
                <th className='p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider'>
                  Budget
                </th>
              </tr>
            </thead>
            <tbody>
              {clientProjects.length > 0 ? (
                clientProjects.map((project) => (
                  <tr
                    key={project.id}
                    className='border-b border-[rgb(var(--border-color-rgb))] last:border-b-0 hover:bg-[rgba(var(--bg-tertiary-rgb),0.2)] transition-colors'>
                    <td className='p-4 font-medium text-[rgb(var(--text-primary-rgb))]'>
                      {project.name}
                    </td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          project.status === ProjectStatus.Completed
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-sky-500/10 text-sky-400'
                        }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className='p-4 min-w-[200px]'>
                      <ProgressBar progress={project.progress} />
                    </td>
                    <td className='p-4 text-sm font-medium text-[rgb(var(--text-primary-rgb))]'>
                      ${project.budget.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message='No projects associated with this client.' />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientProfileView;
