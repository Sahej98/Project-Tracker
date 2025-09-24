import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import Card from '../../common/Card';
import { WalletIcon } from '../../common/Icons';
import EmptyState from '../../common/EmptyState';

const ClientBillingView: React.FC = () => {
    const { billingRecords, projects, currentUser } = useAppContext();

    const clientProjects = projects.filter(p => currentUser && p.clientId === currentUser.id);
    const clientProjectIds = clientProjects.map(p => p.id);

    const recordsForClient = billingRecords.filter(r => clientProjectIds.includes(r.projectId));
    const totalBilled = recordsForClient.reduce((sum, r) => sum + r.total, 0);

    const findProjectName = (projectId: number) => {
        return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[rgb(var(--text-primary-rgb))]">Invoices & Billing</h2>
            <Card className="bg-gradient-to-br from-[rgb(var(--accent-primary-hover-rgb))] to-[rgb(var(--accent-primary-rgb))] text-white shadow-xl shadow-teal-500/20">
                <div className="flex items-center gap-6">
                    <WalletIcon className="w-16 h-16 opacity-50"/>
                    <div className="text-left">
                        <h4 className="text-lg font-semibold text-teal-200">Total Billed to Date</h4>
                        <p className="text-5xl font-bold">${totalBilled.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </Card>
            <Card title="Billing History" padding="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[rgb(var(--border-color-rgb))]">
                                <th className="p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider">Date</th>
                                <th className="p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider">Project</th>
                                <th className="p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider">Description</th>
                                <th className="p-4 text-sm font-semibold text-[rgb(var(--text-secondary-rgb))] uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordsForClient.length > 0 ? recordsForClient.map(rec => (
                                <tr key={rec.id} className="border-b border-[rgb(var(--border-color-rgb))] last:border-b-0 hover:bg-[rgba(var(--bg-tertiary-rgb),0.2)] transition-colors">
                                    <td className="p-4 text-sm text-[rgb(var(--text-secondary-rgb))]">{rec.date}</td>
                                    <td className="p-4 text-sm text-[rgb(var(--text-primary-rgb))] font-medium">{findProjectName(rec.projectId)}</td>
                                    <td className="p-4 text-sm text-[rgb(var(--text-primary-rgb))]">{rec.description}</td>
                                    <td className="p-4 text-sm text-[rgb(var(--text-primary-rgb))] font-semibold text-right">${rec.total.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4}><EmptyState message="No billing records found."/></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

export default ClientBillingView;