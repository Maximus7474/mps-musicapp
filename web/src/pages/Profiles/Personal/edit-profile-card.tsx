import { useState, type FormEvent } from 'react';
import { User as UserIcon, Camera, Save, X } from 'lucide-react';
import type { AuthResult, BasicResponse, UpdateArtistPayload, UpdateProfilePayload } from '@common/types';
import { devMode } from '~/utils/utils';
import type { SignedInUser } from './types';

type EditProfileCardProps = {
  user: SignedInUser;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthResult>;
  updateArtistProfile: (payload: UpdateArtistPayload) => Promise<BasicResponse>;
  onCancel: () => void;
};

export function EditProfileCard({ user, updateProfile, updateArtistProfile, onCancel }: EditProfileCardProps) {
  const [editUsername, setEditUsername] = useState(user.username ?? '');
  const [editProfilePic, setEditProfilePic] = useState(user.profilePic ?? '');
  const [editArtistName, setEditArtistName] = useState(devMode && user.kind === 'artist' ? 'Nova Eclipse' : '');
  const [editArtistBio, setEditArtistBio] = useState(
    devMode && user.kind === 'artist' ? 'Your favorite underground producer.' : ''
  );
  const [editArtistImage, setEditArtistImage] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setEditError(null);
    setEditSuccess(false);

    const profileResult = await updateProfile({
      username: editUsername.trim(),
      profilePic: editProfilePic.trim(),
    });

    if (!profileResult.success) {
      setEditError(profileResult.message);
      setIsSaving(false);
      return;
    }

    if (user.kind === 'artist') {
      const artistResult = await updateArtistProfile({
        name: editArtistName.trim(),
        bio: editArtistBio.trim(),
        image: editArtistImage.trim(),
      });

      if (!artistResult.success) {
        setEditError(artistResult.message);
        setIsSaving(false);
        return;
      }
    }

    setEditSuccess(true);
    setIsSaving(false);
  };

  return (
    <div className='edit-card'>
      <p className='greeting-label'>Edit profile</p>
      <form onSubmit={handleSaveProfile} className='auth-form'>
        <div className='edit-section'>
          <p className='edit-heading'>User profile</p>

          <div className='form-group'>
            <label>Username</label>
            <div className='search-input-box'>
              <UserIcon size={16} className='icon' />
              <input
                type='text'
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                minLength={3}
                maxLength={32}
                pattern='[a-zA-Z0-9_\-]+'
                required
                autoComplete='username'
              />
            </div>
          </div>

          <div className='form-group'>
            <label>Profile picture URL</label>
            <div className='search-input-box'>
              <Camera size={16} className='icon' />
              <input
                type='url'
                placeholder='https://…'
                value={editProfilePic}
                onChange={(e) => setEditProfilePic(e.target.value)}
              />
            </div>
          </div>
        </div>

        {user.kind === 'artist' && (
          <div className='edit-section'>
            <p className='edit-heading'>Artist profile</p>

            <div className='form-group'>
              <label>Name</label>
              <div className='search-input-box'>
                <UserIcon size={16} className='icon' />
                <input
                  type='text'
                  value={editArtistName}
                  onChange={(e) => setEditArtistName(e.target.value)}
                  maxLength={64}
                  required
                />
              </div>
            </div>

            <div className='form-group'>
              <label>Bio</label>
              <textarea
                className='auth-textarea'
                rows={3}
                value={editArtistBio}
                onChange={(e) => setEditArtistBio(e.target.value)}
                placeholder='Tell fans about yourself…'
              />
            </div>

            <div className='form-group'>
              <label>Artist picture URL</label>
              <div className='search-input-box'>
                <Camera size={16} className='icon' />
                <input
                  type='url'
                  placeholder='https://…'
                  value={editArtistImage}
                  onChange={(e) => setEditArtistImage(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {editError && <p className='auth-error'>{editError}</p>}
        {editSuccess && <p className='desc auth-hint edit-success'>Saved ✓</p>}

        <div className='edit-actions'>
          <button type='submit' className='btn-primary auth-submit' disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving…' : 'Save changes'}
          </button>
          <button type='button' className='btn-secondary auth-cancel' onClick={onCancel} aria-label='Cancel editing'>
            <X size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
