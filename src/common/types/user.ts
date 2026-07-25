export interface User {
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  proximitySharing: boolean;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserSharedProfile {
  username: string;
  displayName?: string;
  avatar?: string;
}

export interface RawUser {
  id: number;
  username: string;
  display_name?: string;
  email?: string;
  avatar?: string;
  proximity_sharing: number;
  balance: number;
}

export interface AccountHistory {
  action: 'transfer' | 'withdraw' | 'deposit';
  amount: number;
  related_account: string | null;
  timestamp: number;
}

export type HistoryResponse = { success: true; history: AccountHistory[] } | { success: false; error: string };

export type DeletionResponse = { success: true } | { success: false; error: string };

export type LoginResponse = { success: true; user: User } | { success: false; error: string };

export type UpdateProfileResponse = { success: true; user: User } | { success: false; error: string };
