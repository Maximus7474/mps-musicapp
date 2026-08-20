import type { AppUser } from '@common/types';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { fetchNui } from '~/utils/fetchNui';
import { UserContext } from '~/hooks/useUser';

/** Dev-mode fallback so the UI is explorable in the browser (fetchNui returns mocks in devMode). */
const MOCK_USER: AppUser = {
  kind: 'artist',
  uuid: '5f3a9c2e-8b4d-4f6a-9c1e-2d7b0a6e4c8f',
  username: 'nova_eclipse',
  artistId: 1,
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const resolved = await fetchNui<AppUser>('musicapp:getUser', {}, MOCK_USER);
      setUser(resolved);
    } catch (err) {
      console.error('[USER] Failed to load identity', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetchNui('musicapp:logout', {}, true);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, isLoading, refresh, logout }}>{children}</UserContext.Provider>
  );
};
