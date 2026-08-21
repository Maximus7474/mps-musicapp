import { useState, type FormEvent } from 'react';
import { Music, Heart, Disc, Bell, Volume2, HardDrive, Shield, UserCircle2, ChevronRight, LogIn, LogOut, UserPlus, Lock, User as UserIcon } from 'lucide-react';
import { useUser } from '~/hooks/useUser';
import { devMode } from '~/utils/utils';

export function ProfilePage() {
  const { user, isLoading, login, register, logout } = useUser();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAnon = user === null || user.kind === 'anon';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsSubmitting(true);
    setError(null);

    const result = mode === 'login' ? await login(username, password) : await register(username, password);
    if (!result.success) setError(result.message);

    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
    setMode('login');
    setUsername('');
    setPassword('');
    setError(null);
  };

  const stats = [
    { label: 'Liked', value: '248', icon: Heart },
    { label: 'Artists', value: '34', icon: Disc },
    { label: 'Playlists', value: '12', icon: Music },
  ];

  const preferences = [
    { icon: <Bell size={18} className='icon' />, label: 'Notifications', desc: 'Manage alerts' },
    { icon: <Volume2 size={18} className='icon' />, label: 'Audio Quality', desc: 'Lossless' },
    { icon: <HardDrive size={18} className='icon' />, label: 'Offline Mode', desc: 'Manage downloads' },
    { icon: <Shield size={18} className='icon' />, label: 'Privacy & Data', desc: 'Local session settings' },
  ];

  return (
    <div className='page-container no-dock'>
      <div className='page-header'>
        <h1 className='title'>Your Profile</h1>
        <button className='icon-button'>
          <UserCircle2 />
        </button>
      </div>

      {isAnon ? (
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
                  pattern='[a-zA-Z0-9_\\-]+'
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
      ) : (
        <div className='setting-row' style={{ cursor: 'default' }}>
          <div className='row-left'>
            <div className='row-icon-box'>
              <UserCircle2 size={18} className='icon' />
            </div>
            <div>
              <p className='title'>Account</p>
              <p className='desc'>
                {user?.kind === 'artist'
                  ? `Artist account · owns artist #${user.artistId}`
                  : user
                    ? `Signed in as @${user.username}`
                    : 'Not signed in'}
              </p>
            </div>
          </div>
          <button type='button' className='btn-secondary auth-logout' onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}

      <div className='stats-card-group'>
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className='stat-box'>
            <Icon size={16} className='stat-icon' />
            <p className='value'>{value}</p>
            <p className='label'>{label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className='greeting-label' style={{ marginBottom: '0.75rem' }}>
          App Preferences
        </p>

        <div className='preferences-list'>
          {preferences.map((item) => (
            <button key={item.label} className='setting-row'>
              <div className='row-left'>
                <div className='row-icon-box'>{item.icon}</div>
                <div>
                  <p className='title'>{item.label}</p>
                  <p className='desc'>{item.desc}</p>
                </div>
              </div>

              <ChevronRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
