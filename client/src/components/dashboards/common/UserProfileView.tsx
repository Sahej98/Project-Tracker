import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import Card from '../../common/Card';
import AddEditUserModal from '../../modals/AddEditUserModal';
import { EditIcon } from '../../common/Icons';

const UserProfileView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    if (!currentUser) {
        return <div className="text-center p-8">User not found or not logged in.</div>;
    }

    return (
        <>
            <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[rgb(var(--text-primary-rgb))]">My Profile</h2>
                        <p className="text-[rgb(var(--text-secondary-rgb))] mt-1">View and manage your personal information.</p>
                    </div>
                     <button onClick={() => setEditModalOpen(true)} className="flex items-center justify-center gap-2 text-sm bg-[rgb(var(--accent-primary-rgb))] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-colors self-start sm:self-center">
                        <EditIcon className="w-4 h-4" /> Edit Profile
                    </button>
                </div>
                <Card padding="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-32 h-32 rounded-full ring-4 ring-[rgba(var(--accent-primary-rgb),0.2)]" />
                        <div className="flex-1 w-full">
                            <h2 className="text-3xl font-bold text-[rgb(var(--text-primary-rgb))] text-center md:text-left">{currentUser.name}</h2>
                            <p className="text-[rgb(var(--accent-primary-rgb))] font-semibold mt-1 text-lg text-center md:text-left">{currentUser.jobTitle || currentUser.role}</p>
                            <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color-rgb))] space-y-3 text-sm">
                                <div className="flex flex-col sm:flex-row">
                                    <strong className="w-24 text-[rgb(var(--text-secondary-rgb))]">Email</strong>
                                    <a href={`mailto:${currentUser.email}`} className="text-[rgb(var(--text-primary-rgb))] font-medium hover:underline break-all">{currentUser.email || 'N/A'}</a>
                                </div>
                               <div className="flex flex-col sm:flex-row">
                                    <strong className="w-24 text-[rgb(var(--text-secondary-rgb))]">Phone</strong>
                                    <span className="text-[rgb(var(--text-primary-rgb))] font-medium">{currentUser.phone || 'N/A'}</span>
                               </div>
                               {currentUser.role === 'EMPLOYEE' && currentUser.hourlyRate != null && (
                                   <div className="flex flex-col sm:flex-row">
                                        <strong className="w-24 text-[rgb(var(--text-secondary-rgb))]">Rate</strong>
                                        <span className="text-[rgb(var(--text-primary-rgb))] font-medium">${currentUser.hourlyRate}/hr</span>
                                   </div>
                               )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {isEditModalOpen && (
                <AddEditUserModal 
                    user={currentUser}
                    role={currentUser.role}
                    onClose={() => setEditModalOpen(false)} 
                />
            )}
        </>
    );
};

export default UserProfileView;
