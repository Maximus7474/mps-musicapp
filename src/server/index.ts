import { RegisterServerCallback } from './utils/callbacks';
import { getOrCreateUser, logoutUser } from './user';
import type { AppUser } from '@common/types';

RegisterServerCallback<AppUser | null>('musicapp:getUser', async (src) => {
  return getOrCreateUser(src);
});

RegisterServerCallback<boolean>('musicapp:logout', async (src) => {
  return logoutUser(src);
});
