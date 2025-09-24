import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import Card from '../../common/Card';
import { CheckCircleIcon, SunriseIcon, AlertTriangleIcon } from '../../common/Icons';

const MyStandupsView: React.FC = () => {
    const { currentUser, dailyStandups, submitStandup } = useAppContext();
    const today = new Date().toISOString().split('T')[0];

    const myStandups = useMemo(() => {
        if (!currentUser) return [];
        return dailyStandups
            .filter(s => s.employeeId === currentUser.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dailyStandups, currentUser]);

    const hasSubmittedToday = myStandups.some(s => s.date === today);

    const [yesterday, setYesterday] = useState('');
    const [todayWork, setTodayWork] = useState('');
    const [blockers, setBlockers] = useState('');
    
    const textareaClasses = "w-full p-3 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors text-sm min-h-[120px] shadow-sm";
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !yesterday.trim() || !todayWork.trim()) {
            alert('Please fill out what you did yesterday and what you will do today.');
            return;
        }
        submitStandup({
            employeeId: currentUser.id,
            date: today,
            yesterday,
            today: todayWork,
            blockers
        });
        setYesterday('');
        setTodayWork('');
        setBlockers('');
    };

    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-3xl font-bold text-[rgb(var(--text-primary-rgb))]">My Daily Standups</h2>
                <p className="text-[rgb(var(--text-secondary-rgb))] mt-1">Keep your team updated on your progress.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-6">
                    <Card title={hasSubmittedToday ? "Today's Report Submitted" : "Submit Today's Standup"}>
                        {hasSubmittedToday ? (
                            <div className="text-center py-8 flex flex-col items-center gap-3">
                                <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
                                <p className="font-semibold text-emerald-400 text-lg">You've submitted your standup for today!</p>
                                <p className="text-sm text-[rgb(var(--text-secondary-rgb))]">Come back tomorrow to log your progress.</p>
                            </div>
                        ) : (
                             <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-3 mb-2">
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                        <span className="font-semibold text-lg text-[rgb(var(--text-primary-rgb))]">What did you accomplish yesterday?</span>
                                    </label>
                                    <textarea value={yesterday} onChange={e => setYesterday(e.target.value)} className={textareaClasses} required placeholder="e.g., Finished the login page UI and connected it to the authentication endpoint."/>
                                </div>
    
                                <div>
                                    <label className="flex items-center gap-3 mb-2">
                                        <SunriseIcon className="w-5 h-5 text-sky-500" />
                                        <span className="font-semibold text-lg text-[rgb(var(--text-primary-rgb))]">What are your goals for today?</span>
                                    </label>
                                    <textarea value={todayWork} onChange={e => setTodayWork(e.target.value)} className={textareaClasses} required placeholder="e.g., Start work on the main dashboard components and data fetching."/>
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-3 mb-2">
                                        <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                                        <span className="font-semibold text-lg text-[rgb(var(--text-primary-rgb))]">Any blockers?</span>
                                    </label>
                                    <textarea value={blockers} onChange={e => setBlockers(e.target.value)} className={textareaClasses} placeholder="e.g., Waiting for the final API documentation for the reporting service."/>
                                </div>

                                <button type="submit" className="w-full text-center bg-[rgb(var(--accent-primary-rgb))] text-white font-bold py-3 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-all transform hover:scale-[1.01] shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50">Submit Report</button>
                            </form>
                        )}
                    </Card>
                </div>
                
                <div className="lg:col-span-2">
                    <Card title="Submission History" padding="p-0">
                         <div className="divide-y divide-[rgb(var(--border-color-rgb))] max-h-[80vh] overflow-y-auto">
                            {myStandups.length > 0 ? myStandups.map(s => (
                                <div key={s.id} className="p-5 hover:bg-[rgba(var(--bg-tertiary-rgb),0.4)]">
                                    <p className="font-bold text-[rgb(var(--text-primary-rgb))]">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <div className="text-sm mt-3 space-y-3 pl-4 border-l-2 border-[rgb(var(--border-color-rgb))]">
                                        <p><strong className="font-semibold text-[rgb(var(--text-secondary-rgb))]">Yesterday:</strong> {s.yesterday}</p>
                                        <p><strong className="font-semibold text-[rgb(var(--text-secondary-rgb))]">Today:</strong> {s.today}</p>
                                        <p><strong className="font-semibold text-red-500">Blockers:</strong> {s.blockers || 'None'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-sm text-[rgb(var(--text-secondary-rgb))]">No past submissions found.</div>
                            )}
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MyStandupsView;