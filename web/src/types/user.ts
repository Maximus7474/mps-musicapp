import type { AppUser } from '@common/types';

export interface UserContextType {
  user: AppUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}
