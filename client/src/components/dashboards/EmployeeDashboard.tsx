import React from 'react';
import type { EmployeeView } from '../../types';
import EmployeeHomeDashboard from './employee/EmployeeHomeDashboard';
import MyTasksView from './employee/MyTasksView';
import MyStandupsView from './employee/MyStandupsView';
import MyLeaveView from './employee/MyLeaveView';

interface EmployeeDashboardProps {
  view: EmployeeView;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ view }) => {
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <EmployeeHomeDashboard />;
      case 'tasks':
        return <MyTasksView />;
      case 'standups':
        return <MyStandupsView />;
      case 'leave':
        return <MyLeaveView />;
      default:
        return <EmployeeHomeDashboard />;
    }
  };

  return <div className='h-full'>{renderContent()}</div>;
};

export default EmployeeDashboard;
