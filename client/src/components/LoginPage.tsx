import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LogoIcon } from './common/Icons';

const LoginPage: React.FC = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    login(email, password);
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-[rgb(var(--bg-primary-rgb))] p-4'>
      <div className='w-full max-w-5xl bg-[rgb(var(--bg-secondary-rgb))] rounded-2xl shadow-2xl shadow-black/10 flex flex-col lg:flex-row overflow-hidden min-h-[70vh]'>
        <div className='hidden lg:flex flex-col items-center justify-center w-1/2 p-12 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative'>
          <div className='flex items-center gap-4 mb-6'>
            <LogoIcon className='h-14 w-14' />
            <h1 className='text-6xl font-bold tracking-tighter'>Zenith</h1>
          </div>
          <p className='text-lg text-indigo-200 text-center'>
            The peak of project management.
          </p>
          <div className='absolute bottom-4 left-4 right-4 text-center text-xs text-indigo-300'>
            <p>
              &copy; {new Date().getFullYear()} Zenith. All rights reserved.
            </p>
          </div>
        </div>

        <div className='w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center'>
          <div className='lg:hidden flex justify-center items-center gap-4 mb-8'>
            <LogoIcon className='h-10 w-10 text-[rgb(var(--accent-primary-rgb))]' />
            <h1 className='text-4xl font-bold tracking-tighter text-[rgb(var(--text-primary-rgb))]'>
              Zenith
            </h1>
          </div>
          <div className='w-full max-w-md mx-auto'>
            <h2 className='text-3xl font-bold text-[rgb(var(--text-primary-rgb))] mb-2'>
              Sign In
            </h2>
            <p className='text-base text-[rgb(var(--text-secondary-rgb))] mb-8'>
              Enter your credentials to access your dashboard.
            </p>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-[rgb(var(--text-secondary-rgb))] mb-2'>
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-3 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors'
                  placeholder='you@example.com'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-[rgb(var(--text-secondary-rgb))] mb-2'>
                  Password
                </label>
                <input
                  type='password'
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-[rgb(var(--bg-primary-rgb))] border border-[rgb(var(--border-color-rgb))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent-primary-rgb))] focus:border-[rgb(var(--accent-primary-rgb))] transition-colors'
                  placeholder='••••••••'
                  required
                />
              </div>
              <button
                type='submit'
                className='w-full text-center bg-[rgb(var(--accent-primary-rgb))] text-white font-bold py-3 px-4 rounded-lg hover:bg-[rgb(var(--accent-primary-hover-rgb))] transition-all transform hover:scale-[1.01] shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50'>
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
