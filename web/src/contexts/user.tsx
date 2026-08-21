import type { AppUser, AuthResult, BasicResponse, UpdateArtistPayload, UpdateProfilePayload } from '@common/types';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { fetchNui } from '~/utils/fetchNui';
import { devMode } from '~/utils/utils';
import { UserContext } from '~/hooks/useUser';

const DEV_UUID = '5f3a9c2e-8b4d-4f6a-9c1e-2d7b0a6e4c8f';
const devAccounts = new Map<string, string>([['demo', 'password']]);
let devCurrentUser: AppUser = { kind: 'anon', uuid: DEV_UUID };
let devArtistProfile: { name: string; bio: string; image: string } = {
  name: 'Nova Eclipse',
  bio: 'Your favorite underground producer.',
  image: '',
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const resolved = devMode ? devCurrentUser : await fetchNui<AppUser | null>('musicapp:getUser');
      setUser(resolved);
    } catch (err) {
      console.error('[USER] Failed to load identity', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    if (devMode) {
      const stored = devAccounts.get(username);
      if (!stored || stored !== password) {
        return { success: false, message: 'Invalid username or password' };
      }
      devCurrentUser = { kind: 'artist', uuid: DEV_UUID, username, artistId: 300 };
      setUser(devCurrentUser);
      return { success: true, user: devCurrentUser };
    }

    const result = await fetchNui<AuthResult>('musicapp:login', { username, password });
    if (result.success) setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    if (devMode) {
      if (devAccounts.has(username)) {
        return { success: false, message: 'That username is already taken' };
      }
      devAccounts.set(username, password);
      devCurrentUser = { kind: 'user', uuid: DEV_UUID, username };
      setUser(devCurrentUser);
      return { success: true, user: devCurrentUser };
    }

    const result = await fetchNui<AuthResult>('musicapp:register', { username, password });
    if (result.success) setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (!devMode) {
      await fetchNui<boolean>('musicapp:logout');
    }
    devCurrentUser = { kind: 'anon', uuid: DEV_UUID };
    await refresh();
  }, [refresh]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<AuthResult> => {
    if (devMode) {
      if (devCurrentUser.kind === 'anon') {
        return { success: false, message: 'Create an account before editing your profile' };
      }
      const username = payload.username?.trim();
      const profilePic = payload.profilePic?.trim();

      if (username !== undefined) {
        if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
          return { success: false, message: 'Username must be 3-32 characters: letters, numbers, . _ -' };
        }
        if (username !== devCurrentUser.username && devAccounts.has(username)) {
          return { success: false, message: 'That username is already taken' };
        }
      }

      devCurrentUser = {
        ...devCurrentUser,
        ...(username !== undefined && username !== devCurrentUser.username ? { username } : {}),
        ...(profilePic !== undefined ? { profilePic: profilePic || undefined } : {}),
      };
      setUser(devCurrentUser);
      return { success: true, user: devCurrentUser };
    }

    const result = await fetchNui<AuthResult>('musicapp:updateProfile', payload);
    if (result.success) setUser(result.user);
    return result;
  }, []);

  const updateArtistProfile = useCallback(async (payload: UpdateArtistPayload): Promise<BasicResponse> => {
    if (devMode) {
      if (devCurrentUser.kind !== 'artist') {
        return { success: false, message: 'No artist account linked to this user' };
      }
      if (payload.name !== undefined) devArtistProfile.name = payload.name.trim();
      if (payload.bio !== undefined) devArtistProfile.bio = payload.bio.trim();
      if (payload.image !== undefined) devArtistProfile.image = payload.image.trim();
      return { success: true };
    }

    return fetchNui<BasicResponse>('musicapp:updateArtistProfile', payload);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider
      value={{ user, isLoading, refresh, login, register, logout, updateProfile, updateArtistProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};
