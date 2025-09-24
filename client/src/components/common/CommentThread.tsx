import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Comment } from '../../types';

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  isReadOnly?: boolean;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddComment,
  isReadOnly = false,
}) => {
  const { findUserById, currentUser } = useAppContext();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-4 max-h-72 overflow-y-auto pr-2'>
        {comments.length > 0 ? (
          [...comments]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((comment) => {
              const author = findUserById(comment.authorId);
              return (
                <div key={comment.id} className='flex space-x-3'>
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    className='w-9 h-9 rounded-full flex-shrink-0'
                  />
                  <div>
                    <div className='bg-[rgb(var(--bg-tertiary-rgb))] rounded-lg px-3 py-2'>
                      <p className='font-semibold text-sm text-[rgb(var(--text-primary-rgb))]'>
                        {author?.name}
                      </p>
                      <p className='text-sm text-[rgb(var(--text-secondary-rgb))]'>
                        {comment.content}
                      </p>
                    </div>
                    <p className='text-xs text-[rgb(var(--text-secondary-rgb))] mt-1'>
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
        ) : (
          <p className='text-sm text-[rgb(var(--text-secondary-rgb))] italic text-center py-4'>
            No comments yet.
          </p>
        )}
      </div>
      {!isReadOnly && currentUser && (
        <form
          onSubmit={handleSubmit}
          className='flex space-x-3 items-start pt-4 border-t border-[rgb(var(--border-color-rgb))]'>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className='w-9 h-9 rounded-full flex-shrink-0'
          />
          <div className='flex-1'>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder='Write a comment...'
              rows={2}
              className='w-full p-2 border border-[rgb(var(--border-color-rgb))] rounded-lg text-sm bg-[rgb(var(--bg-secondary-rgb))]'
            />
            <button
              type='submit'
              className='mt-2 py-1.5 px-4 bg-[rgb(var(--accent-primary-rgb))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] font-semibold text-sm'>
              Post Comment
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentThread;
