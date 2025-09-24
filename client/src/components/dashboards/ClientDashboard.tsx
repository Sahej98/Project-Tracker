import React from 'react';
import type { ClientView } from '../../types';
import ProjectsOverview from './client/ProjectsOverview';
import ClientBillingView from './client/ClientBillingView';
import ClientHomeDashboard from './client/ClientHomeDashboard';

const ClientDashboard: React.FC<{ view: ClientView }> = ({ view }) => {
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <ClientHomeDashboard />;
      case 'projects':
        return <ProjectsOverview />;
      case 'billing':
        return <ClientBillingView />;
      default:
        return <ClientHomeDashboard />;
    }
  };

  return <div className='h-full'>{renderContent()}</div>;
};

export default ClientDashboard;
