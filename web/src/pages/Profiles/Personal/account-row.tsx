import { UserCircle2, Pencil, LogOut } from 'lucide-react';
import type { SignedInUser } from './types';

type AccountRowProps = {
  user: SignedInUser;
  onEdit: () => void;
  onLogout: () => void;
};

/** The signed-in account row: avatar, identity, edit + logout icon buttons. */
export function AccountRow({ user, onEdit, onLogout }: AccountRowProps) {
  return (
    <div className='setting-row' style={{ cursor: 'default' }}>
      <div className='row-left'>
        <div className='row-icon-box'>
          {user.profilePic ? (
            <img src={user.profilePic} alt='' className='avatar-img' />
          ) : (
            <UserCircle2 size={18} className='icon' />
          )}
        </div>
        <div>
          <p className='title'>{user.kind === 'artist' ? `Artist · @${user.username}` : `@${user.username}`}</p>
          <p className='desc'>
            {user.kind === 'artist' ? `Artist account · owns artist #${user.artistId}` : 'Signed in'}
          </p>
        </div>
      </div>
      <div className='row-actions'>
        <button type='button' className='btn-secondary auth-logout' onClick={onEdit} aria-label='Edit profile'>
          <Pencil size={14} />
        </button>
        <button type='button' className='btn-secondary auth-logout' onClick={onLogout} aria-label='Log out'>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
