import type { AppUser, AuthResult } from '@common/types';

export interface UserContextType {
  user: AppUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}
