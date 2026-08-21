import { useState, type FormEvent } from 'react';
import { LogIn, UserPlus, Lock, User as UserIcon } from 'lucide-react';
import type { AuthResult } from '@common/types';
import { devMode } from '~/utils/utils';

type AuthCardProps = {
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, password: string) => Promise<AuthResult>;
};

/** Login / create-account card shown to anon users. */
export function AuthCard({ login, register }: AuthCardProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsSubmitting(true);
    setError(null);

    const result = mode === 'login' ? await login(username, password) : await register(username, password);
    if (!result.success) setError(result.message);

    setIsSubmitting(false);
  };

  return (
    <div className='auth-card'>
      <div className='segmented-tab-switch'>
        <button
          type='button'
          className={mode === 'login' ? 'active' : ''}
          onClick={() => {
            setMode('login');
            setError(null);
          }}
        >
          Log in
        </button>
        <button
          type='button'
          className={mode === 'register' ? 'active' : ''}
          onClick={() => {
            setMode('register');
            setError(null);
          }}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className='auth-form'>
        <div className='form-group'>
          <label>{mode === 'login' ? 'Username' : 'Choose a username'}</label>
          <div className='search-input-box'>
            <UserIcon size={16} className='icon' />
            <input
              type='text'
              placeholder='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={32}
              pattern='[a-zA-Z0-9_\-]+'
              required
              autoComplete='username'
            />
          </div>
        </div>

        <div className='form-group'>
          <label>{mode === 'login' ? 'Password' : 'Choose a password'}</label>
          <div className='search-input-box'>
            <Lock size={16} className='icon' />
            <input
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {mode === 'register' && <p className='desc auth-hint'>At least 6 characters</p>}
        </div>

        {error && <p className='auth-error'>{error}</p>}

        {devMode && (
          <p className='desc auth-hint'>
            Dev demo: log in with <strong>demo</strong> / <strong>password</strong>
          </p>
        )}

        <button type='submit' className='btn-primary auth-submit' disabled={isSubmitting}>
          {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
          {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
