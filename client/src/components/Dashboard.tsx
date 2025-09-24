import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { EmployeeView, ClientView } from '../types';
import { Role } from '../types';
import DashboardHeader from './common/DashboardHeader';

// Dashboards & Views
import AdminHomeDashboard from './dashboards/admin/AdminHomeDashboard';
import UsersManagement from './dashboards/admin/UsersManagement';
import ProjectsManagement from './dashboards/admin/ProjectsManagement';
import EmployeeDashboard from './dashboards/EmployeeDashboard';
import ClientDashboard from './dashboards/ClientDashboard';
import ProjectBoardView from './dashboards/admin/ProjectBoardView';
import EmployeeProfileView from './dashboards/admin/EmployeeProfileView';
import ClientProfileView from './dashboards/admin/ClientProfileView';
import CommandPalette from './common/CommandPalette';
import TeamManagementDashboard from './dashboards/admin/TeamManagementDashboard';
import UserProfileView from './dashboards/common/UserProfileView';

// Icons
import {
  HomeIcon,
  BriefcaseIcon,
  UsersIcon,
  LogoIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  SunriseIcon,
  CreditCardIcon,
  ClipboardListIcon,
  UserCircleIcon,
  PowerIcon,
} from './common/Icons';

type AdminView =
  | 'dashboard'
  | 'projects'
  | 'employees'
  | 'clients'
  | 'project_board'
  | 'employee_profile'
  | 'client_profile'
  | 'team'
  | 'profile';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  icon,
  label,
  isActive,
  onClick,
  isCollapsed,
}) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`flex items-center w-full h-11 px-4 rounded-lg transition-all duration-200 text-left group ${
      isActive
        ? 'bg-[rgb(var(--accent-primary-rgb))] text-white shadow-md'
        : 'hover:bg-[rgba(var(--text-primary-rgb),0.05)] text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))]'
    }`}>
    <div
      className={`${
        isActive
          ? 'text-white'
          : 'text-slate-500 dark:text-slate-400 group-hover:text-[rgb(var(--text-primary-rgb))]'
      }`}>
      {icon}
    </div>
    <span
      className={`ml-4 font-semibold whitespace-nowrap transition-opacity duration-200 ${
        isCollapsed ? 'opacity-0' : 'opacity-100'
      }`}>
      {label}
    </span>
  </button>
);

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [employeeView, setEmployeeView] = useState<EmployeeView>('dashboard');
  const [clientView, setClientView] = useState<ClientView>('dashboard');

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const isLargeScreen = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  }, []);

  useEffect(() => {
    setSidebarCollapsed(!isLargeScreen);
  }, [isLargeScreen]);

  const navigateTo = useCallback(
    (view: AdminView, id: number | null = null) => {
      setAdminView(view);
      setActiveId(id);
      if (!isLargeScreen) setMobileSidebarOpen(false);
    },
    [isLargeScreen]
  );

  const handleViewChange = (view: AdminView | EmployeeView | ClientView) => {
    if (currentUser?.role === Role.Admin) setAdminView(view as AdminView);
    if (currentUser?.role === Role.Employee)
      setEmployeeView(view as EmployeeView);
    if (currentUser?.role === Role.Client) setClientView(view as ClientView);
    if (!isLargeScreen) setMobileSidebarOpen(false);
  };

  const handleNavigateToProfile = () => {
    if (!currentUser) return;
    switch (currentUser.role) {
      case Role.Admin:
        setAdminView('profile');
        break;
      case Role.Employee:
        setEmployeeView('profile');
        break;
      case Role.Client:
        setClientView('profile');
        break;
    }
    if (!isLargeScreen) setMobileSidebarOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderAdminDashboard = () => {
    switch (adminView) {
      case 'dashboard':
        return <AdminHomeDashboard />;
      case 'projects':
        return (
          <ProjectsManagement
            onViewProjectBoard={(id) => navigateTo('project_board', id)}
          />
        );
      case 'employees':
        return (
          <UsersManagement
            role={Role.Employee}
            onViewProfile={(id) => navigateTo('employee_profile', id)}
          />
        );
      case 'clients':
        return (
          <UsersManagement
            role={Role.Client}
            onViewProfile={(id) => navigateTo('client_profile', id)}
          />
        );
      case 'team':
        return <TeamManagementDashboard />;
      case 'project_board':
        return activeId ? (
          <ProjectBoardView projectId={activeId} />
        ) : (
          <ProjectsManagement
            onViewProjectBoard={(id) => navigateTo('project_board', id)}
          />
        );
      case 'employee_profile':
        return activeId ? (
          <EmployeeProfileView employeeId={activeId} />
        ) : (
          <UsersManagement
            role={Role.Employee}
            onViewProfile={(id) => navigateTo('employee_profile', id)}
          />
        );
      case 'client_profile':
        return activeId ? (
          <ClientProfileView clientId={activeId} />
        ) : (
          <UsersManagement
            role={Role.Client}
            onViewProfile={(id) => navigateTo('client_profile', id)}
          />
        );
      case 'profile':
        return <UserProfileView />;
      default:
        return <AdminHomeDashboard />;
    }
  };

  const renderSidebar = () => {
    if (!currentUser) return null;
    const effectiveSidebarCollapsed = isSidebarCollapsed && isLargeScreen;

    switch (currentUser.role) {
      case Role.Admin:
        const adminViews: {
          key: AdminView;
          icon: React.ReactNode;
          label: string;
        }[] = [
          {
            key: 'dashboard',
            icon: <HomeIcon className='h-5 w-5' />,
            label: 'Dashboard',
          },
          {
            key: 'projects',
            icon: <BriefcaseIcon className='h-5 w-5' />,
            label: 'Projects',
          },
          {
            key: 'employees',
            icon: <UsersIcon className='h-5 w-5' />,
            label: 'Employees',
          },
          {
            key: 'clients',
            icon: <UsersIcon className='h-5 w-5' />,
            label: 'Clients',
          },
          {
            key: 'team',
            icon: <ClipboardListIcon className='h-5 w-5' />,
            label: 'Team',
          },
        ];
        return adminViews.map((v) => (
          <NavLink
            key={v.key}
            {...v}
            isActive={adminView === v.key}
            onClick={() => navigateTo(v.key)}
            isCollapsed={effectiveSidebarCollapsed}
          />
        ));

      case Role.Employee:
        const employeeViews: {
          key: EmployeeView;
          icon: React.ReactNode;
          label: string;
        }[] = [
          {
            key: 'dashboard',
            icon: <HomeIcon className='h-5 w-5' />,
            label: 'Dashboard',
          },
          {
            key: 'tasks',
            icon: <ClipboardListIcon className='h-5 w-5' />,
            label: 'My Tasks',
          },
          {
            key: 'standups',
            icon: <SunriseIcon className='h-5 w-5' />,
            label: 'My Standups',
          },
          {
            key: 'leave',
            icon: <CalendarDaysIcon className='h-5 w-5' />,
            label: 'Leave',
          },
        ];
        return (
          <>
            {employeeViews.map((v) => (
              <NavLink
                key={v.key}
                {...v}
                isActive={employeeView === v.key}
                onClick={() => handleViewChange(v.key)}
                isCollapsed={effectiveSidebarCollapsed}
              />
            ))}
          </>
        );

      case Role.Client:
        const clientViews: {
          key: ClientView;
          icon: React.ReactNode;
          label: string;
        }[] = [
          {
            key: 'dashboard',
            icon: <HomeIcon className='h-5 w-5' />,
            label: 'Dashboard',
          },
          {
            key: 'projects',
            icon: <BriefcaseIcon className='h-5 w-5' />,
            label: 'Projects',
          },
          {
            key: 'billing',
            icon: <CreditCardIcon className='h-5 w-5' />,
            label: 'Billing',
          },
        ];
        return (
          <>
            {clientViews.map((v) => (
              <NavLink
                key={v.key}
                {...v}
                isActive={clientView === v.key}
                onClick={() => handleViewChange(v.key)}
                isCollapsed={effectiveSidebarCollapsed}
              />
            ))}
          </>
        );

      default:
        return null;
    }
  };

  const renderMainContent = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case Role.Admin:
        return renderAdminDashboard();
      case Role.Employee:
        return employeeView === 'profile' ? (
          <UserProfileView />
        ) : (
          <EmployeeDashboard view={employeeView} />
        );
      case Role.Client:
        return clientView === 'profile' ? (
          <UserProfileView />
        ) : (
          <ClientDashboard view={clientView} />
        );
      default:
        return <div>Invalid user role.</div>;
    }
  };

  const effectiveSidebarCollapsed = isSidebarCollapsed && isLargeScreen;

  const sidebarContent = (
    <>
      <div
        className={`flex items-center h-[65px] border-b border-[rgb(var(--border-color-rgb))] px-6`}>
        <div className={`flex items-center gap-3 overflow-hidden`}>
          <LogoIcon className='h-8 w-8 text-[rgb(var(--accent-primary-rgb))] flex-shrink-0' />
          <span
            className={`text-xl font-bold text-[rgb(var(--text-primary-rgb))] whitespace-nowrap tracking-tighter transition-all duration-200 ${
              effectiveSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}>
            {isLargeScreen ? 'Zenith' : ''}
          </span>
        </div>
      </div>
      <nav className='flex flex-col space-y-2 p-4 flex-grow'>
        {renderSidebar()}
      </nav>
      <div
        className={`p-4 border-t border-[rgb(var(--border-color-rgb))] transition-all duration-300`}>
        <div
          className={`p-2 rounded-lg ${
            !effectiveSidebarCollapsed ? 'bg-[rgb(var(--bg-tertiary-rgb))]' : ''
          }`}>
          <div className='flex items-center gap-3'>
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className='w-10 h-10 rounded-full flex-shrink-0'
            />
            <div
              className={`flex-1 overflow-hidden transition-all duration-200 ${
                effectiveSidebarCollapsed
                  ? 'opacity-0 w-0'
                  : 'opacity-100 w-auto'
              }`}>
              <p className='text-sm font-semibold truncate'>
                {currentUser?.name}
              </p>
              <p className='text-xs text-[rgb(var(--text-secondary-rgb))] truncate'>
                {currentUser?.role}
              </p>
            </div>
            <button
              onClick={logout}
              title='Logout'
              className={`p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors ${
                effectiveSidebarCollapsed
                  ? 'opacity-0 w-0'
                  : 'opacity-100 w-auto'
              }`}>
              <PowerIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        className={`absolute top-14 -right-3 w-6 h-6 bg-[rgb(var(--bg-secondary-rgb))] border-2 border-[rgb(var(--border-color-rgb))] rounded-full hidden lg:flex items-center justify-center text-[rgb(var(--text-secondary-rgb))] hover:text-[rgb(var(--text-primary-rgb))]`}>
        <ChevronLeftIcon
          className={`w-4 h-4 transition-transform duration-300 ${
            isSidebarCollapsed ? 'rotate-180' : ''
          }`}
        />
      </button>
    </>
  );

  return (
    <div className='flex h-screen bg-transparent text-[rgb(var(--text-primary-rgb))]'>
      {isMobileSidebarOpen && !isLargeScreen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setMobileSidebarOpen(false)}></div>
      )}

      <aside
        className={`bg-[rgb(var(--bg-secondary-rgb))] flex flex-col transition-all duration-300 ease-in-out border-r border-[rgb(var(--border-color-rgb))] fixed lg:relative inset-y-0 left-0 z-50
            ${
              isLargeScreen
                ? ''
                : isMobileSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full'
            }`}
        style={{
          width: isLargeScreen
            ? isSidebarCollapsed
              ? 'var(--sidebar-width-collapsed)'
              : 'var(--sidebar-width)'
            : 'var(--sidebar-width)',
        }}>
        {sidebarContent}
      </aside>

      <main className='flex-1 flex flex-col overflow-hidden'>
        <DashboardHeader
          onCommandPaletteToggle={() => setCommandPaletteOpen(true)}
          onNavigateToProfile={handleNavigateToProfile}
          onMobileMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <div className='flex-1 p-4 sm:p-6 overflow-y-auto'>
          {renderMainContent()}
        </div>
      </main>
      {isCommandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
};

export default Dashboard;
