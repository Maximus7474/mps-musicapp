import type { AppUser } from '@common/types';

/** A signed-in (non-anon) account: user or artist. */
export type SignedInUser = Exclude<AppUser, { kind: 'anon' }>;
