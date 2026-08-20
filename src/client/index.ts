import { triggerServerCallback } from './utils/callbacks';
import type { AppUser } from '@common/types';

RegisterNuiCallback('musicapp:getUser', async (_: unknown, cb: (user: AppUser | null) => void) => {
  const user = await triggerServerCallback<AppUser | null>('musicapp:getUser');
  cb(user);
});

RegisterNuiCallback('musicapp:logout', async (_: unknown, cb: (done: boolean) => void) => {
  const done = await triggerServerCallback<boolean>('musicapp:logout');
  cb(done);
});
