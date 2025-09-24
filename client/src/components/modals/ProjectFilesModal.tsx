import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Project, ProjectFile } from '../../types';
import Modal from './Modal';
import { PlusIcon, PaperClipIcon, TrashIcon } from '../common/Icons';
import EmptyState from '../common/EmptyState';
import ConfirmationModal from './ConfirmationModal';

interface ProjectFilesModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectFilesModal: React.FC<ProjectFilesModalProps> = ({
  project,
  onClose,
}) => {
  const { addFileToProject, deleteFileFromProject } = useAppContext();
  const [deletingFile, setDeletingFile] = React.useState<ProjectFile | null>(
    null
  );

  const handleSimulatedUpload = () => {
    const newFile: Omit<ProjectFile, 'id'> = {
      name: `new_document_${Math.floor(Math.random() * 100)}.pdf`,
      type: 'PDF Document',
      size: `${(Math.random() * 5).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      url: '#',
    };
    addFileToProject(project.id, newFile);
  };

  const handleDeleteConfirm = () => {
    if (deletingFile) {
      deleteFileFromProject(project.id, deletingFile.id);
      setDeletingFile(null);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className='py-2 px-4 bg-[rgb(var(--bg-tertiary-rgb))] text-[rgb(var(--text-primary-rgb))] rounded-lg hover:bg-[rgb(var(--border-color-rgb))] font-semibold'>
        Close
      </button>
      <button
        onClick={handleSimulatedUpload}
        className='flex items-center gap-2 py-2 px-4 bg-[rgb(var(--accent-primary-rgb))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] font-semibold'>
        <PlusIcon className='w-4 h-4' /> Upload File
      </button>
    </>
  );

  return (
    <>
      <Modal
        title={`Files for "${project.name}"`}
        onClose={onClose}
        footer={footer}
        size='max-w-2xl'>
        <div className='space-y-4'>
          {project.files.length > 0 ? (
            <ul className='divide-y divide-[rgb(var(--border-color-rgb))] -mx-6'>
              {project.files.map((file) => (
                <li
                  key={file.id}
                  className='flex items-center justify-between py-3 px-6 hover:bg-[rgba(var(--bg-tertiary-rgb),0.5)]'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <PaperClipIcon className='w-5 h-5 text-[rgb(var(--text-secondary-rgb))] flex-shrink-0' />
                    <div className='min-w-0'>
                      <a
                        href={file.url}
                        className='text-sm font-medium text-[rgb(var(--accent-primary-rgb))] hover:underline truncate'>
                        {file.name}
                      </a>
                      <p className='text-xs text-[rgb(var(--text-secondary-rgb))]'>
                        {file.type} - {file.size}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center flex-shrink-0 ml-4 gap-4'>
                    <p className='text-xs text-[rgb(var(--text-secondary-rgb))] hidden sm:block'>
                      Uploaded: {file.uploadedAt}
                    </p>
                    <button
                      onClick={() => setDeletingFile(file)}
                      className='p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full'>
                      <TrashIcon className='w-4 h-4' />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              message='No files uploaded yet.'
              icon={<PaperClipIcon className='w-12 h-12' />}
            />
          )}
        </div>
      </Modal>

      {deletingFile && (
        <ConfirmationModal
          title='Delete File'
          message={`Are you sure you want to delete "${deletingFile.name}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingFile(null)}
          confirmText='Delete'
        />
      )}
    </>
  );
};

export default ProjectFilesModal;
