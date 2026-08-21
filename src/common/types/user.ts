/**
 * The identity of the person using the app. *
 * - `anon`   – partial account: uuid (+ optional profile pic). Stored with
 *              `username = phonenumber` and linked to the phonenumber column, so
 *              logging out / disconnecting and returning reuses the same account.
 * - `user`   – signed-in account (uuid + username) using a password.
 * - `artist` – a signed-in account that also owns an artist profile (artistId).
 *              Becoming an artist requires an existing user account.
 */
export type AppUser =
  | { kind: 'anon'; uuid: string; profilePic?: string }
  | { kind: 'user'; uuid: string; username: string; profilePic?: string }
  | { kind: 'artist'; uuid: string; username: string; artistId: number; profilePic?: string };

/** Result of a login/register attempt. */
export type AuthResult =
  | { success: true; user: AppUser }
  | { success: false; message: string };
