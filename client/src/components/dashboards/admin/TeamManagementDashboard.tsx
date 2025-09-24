import React, { useState } from 'react';
import Card from '../../common/Card';
import LeaveManagement from './LeaveManagement';
import DailyStandupsView from './DailyStandupsView';
import { CalendarDaysIcon, SunriseIcon } from '../../common/Icons';

const TabButton: React.FC<{label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void}> = ({ label, icon, isActive, onClick}) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-[rgb(var(--accent-primary-rgb))] text-white shadow-sm' : 'text-[rgb(var(--text-secondary-rgb))] hover:bg-[rgb(var(--bg-tertiary-rgb))]'}`}>
        {icon} {label}
    </button>
);

const TeamManagementDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'leave' | 'standups'>('leave');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-[rgb(var(--text-primary-rgb))]">Team Hub</h2>
                <p className="text-[rgb(var(--text-secondary-rgb))] mt-1">Manage leave requests and daily standups from one central place.</p>
            </div>
            
            <Card padding="p-0">
                <div className="px-4 pt-4 sm:px-6 sm:pt-5 border-b border-[rgb(var(--border-color-rgb))]">
                    <div className="flex items-center gap-2">
                        <TabButton label="Leave Management" icon={<CalendarDaysIcon className="w-4 h-4" />} isActive={activeTab === 'leave'} onClick={() => setActiveTab('leave')} />
                        <TabButton label="Daily Standups" icon={<SunriseIcon className="w-4 h-4"/>} isActive={activeTab === 'standups'} onClick={() => setActiveTab('standups')} />
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-[rgba(var(--bg-primary-rgb),0.5)] rounded-b-lg">
                    {activeTab === 'leave' ? <LeaveManagement /> : <DailyStandupsView />}
                </div>
            </Card>
        </div>
    );
};

export default TeamManagementDashboard;
