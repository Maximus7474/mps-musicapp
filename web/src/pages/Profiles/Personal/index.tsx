import { useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useUser } from '~/hooks/useUser';
import { AuthCard } from './auth-card';
import { AccountRow } from './account-row';
import { EditProfileCard } from './edit-profile-card';
import { StatsRow } from './stats-row';
import { PreferencesList } from './preferences-list';

export function ProfilePage() {
  const { user, login, register, logout, updateProfile, updateArtistProfile } = useUser();
  const [editing, setEditing] = useState(false);

  const isAnon = user === null || user.kind === 'anon';

  const handleLogout = async () => {
    setEditing(false);
    await logout();
  };

  return (
    <div className='page-container no-dock'>
      <div className='page-header'>
        <h1 className='title'>Your Profile</h1>
        <button className='icon-button'>
          <UserCircle2 />
        </button>
      </div>

      {isAnon ? (
        <AuthCard login={login} register={register} />
      ) : (
        <>
          <AccountRow user={user} onEdit={() => setEditing((v) => !v)} onLogout={handleLogout} />
          {editing && (
            <EditProfileCard
              user={user}
              updateProfile={updateProfile}
              updateArtistProfile={updateArtistProfile}
              onCancel={() => setEditing(false)}
            />
          )}
        </>
      )}

      {!isAnon && !editing && (
        <>
          <StatsRow />
          <PreferencesList />
        </>
      )}
    </div>
  );
}
