import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { oxmysql } from '@communityox/oxmysql';
import type { AppUser, AuthResult, BasicResponse, UpdateArtistPayload, UpdateProfilePayload } from '@common/types';

/** The app identifier used in the shared `phone_logged_in_accounts` table. */
const APP_ID = 'mps-musicapp';

/** Row shape returned by the music_users query. */
interface MusicUserRow {
  uuid: string;
  phonenumber: string | null;
  username: string | null;
  password: string | null;
  profile_pic: string | null;
  is_artist: number;
  artist_id: number | null;
}

function getPlayerPhone(src: number): string | undefined {
  if (GetResourceState('lb-phone') !== 'started') return undefined;

  try {
    const phone = exports['lb-phone'].GetEquippedPhoneNumber(src) as string | undefined;
    if (phone && phone.length > 0) return phone;
  } catch (err) {
    console.error(`[music:user] Failed to resolve phone for source ${src}:`, err);
  }

  return undefined;
}

function toAppUser(row: MusicUserRow, phonenumber: string): AppUser {
  const profilePic = row.profile_pic ?? undefined;
  const isAnon = !row.username || row.username === phonenumber;

  if (!isAnon && row.is_artist && row.artist_id !== null) {
    return {
      kind: 'artist',
      uuid: row.uuid,
      username: row.username as string,
      artistId: row.artist_id,
      profilePic,
    };
  }

  if (!isAnon && row.username) {
    return { kind: 'user', uuid: row.uuid, username: row.username, profilePic };
  }

  return { kind: 'anon', uuid: row.uuid, profilePic };
}

/** Columns selected for a music_users row. */
const USER_SELECT = `SELECT uuid, phonenumber, username, password, profile_pic, is_artist, artist_id
                       FROM music_users`;

/** Hash a password for storage: `scrypt$<salt>$<hash>` (never plaintext). */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

/** Constant-time password check against a stored `scrypt$<salt>$<hash>` value. */
function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/**
 * Get or create the partial anon account linked to a phone number.
 *
 * The anon account is matched by (phonenumber, username = phonenumber) — the
 * `phonenumber` column records the phone that created the account and is never
 * updated, so logging out / disconnecting and coming back reuses the SAME anon
 * account instead of generating a new uuid each session. Because real accounts
 * have a chosen username (different from the phone), this lookup can never
 * match a user account associated with the phone.
 */
async function ensureAnonUser(phonenumber: string): Promise<MusicUserRow | null> {
  const anonLookup = `${USER_SELECT} WHERE phonenumber = ? AND username = ?`;

  let row = await oxmysql.single<MusicUserRow>(anonLookup, [phonenumber, phonenumber]);
  if (row) return row;

  const uuid = randomUUID();

  try {
    await oxmysql.insert('INSERT INTO music_users (uuid, phonenumber, username) VALUES (?, ?, ?)', [
      uuid,
      phonenumber,
      phonenumber,
    ]);

    return {
      uuid,
      phonenumber,
      username: phonenumber,
      password: null,
      profile_pic: null,
      is_artist: 0,
      artist_id: null,
    };
  } catch (err) {
    // Race: another request created the row first, load the winner.
    console.warn('[music:user] Anon user insert raced, re-reading row.', err);

    return await oxmysql.single<MusicUserRow>(anonLookup, [phonenumber, phonenumber]);
  }
}

/**
 * Ensure the phone's logged-in-accounts table carries an active session for
 * this app, so the identity survives reloads without creating duplicates.
 */
async function persistLogin(phonenumber: string, username: string): Promise<void> {
  await oxmysql.update(
    'UPDATE phone_logged_in_accounts SET username = ?, active = 1 WHERE phone_number = ? AND app = ?',
    [username, phonenumber, APP_ID],
  );

  await oxmysql.insert(
    `INSERT INTO phone_logged_in_accounts (phone_number, app, username, active)
     SELECT ?, ?, ?, 1
      WHERE NOT EXISTS (
        SELECT 1 FROM phone_logged_in_accounts
         WHERE phone_number = ? AND app = ?
      )`,
    [phonenumber, APP_ID, username, phonenumber, APP_ID],
  );
}

/**
 * Resolve (or create) the identity for a player.
 * Returns null only when no phone number could be resolved.
 */
export async function getOrCreateUser(src: number): Promise<AppUser | null> {
  const phonenumber = getPlayerPhone(src);
  if (!phonenumber) return null;

  try {
    // Auto-login
    const loggedIn = await oxmysql.single<{ username: string }>(
      `SELECT username
         FROM phone_logged_in_accounts
        WHERE phone_number = ? AND app = ? AND active = 1
        LIMIT 1`,
      [phonenumber, APP_ID],
    );

    let row: MusicUserRow | null = null;

    if (loggedIn?.username) {
      row = await oxmysql.single<MusicUserRow>(`${USER_SELECT} WHERE username = ?`, [loggedIn.username]);
    }

    // No active login: reuse the anon account linked to this phone (if any) or
    // create one, then keep it logged in so it persists across reloads.
    if (!row) {
      row = await ensureAnonUser(phonenumber);

      if (row) {
        await persistLogin(phonenumber, row.username ?? phonenumber);
      }
    }

    if (!row) return null;

    await oxmysql.update('UPDATE music_users SET last_seen_at = CURRENT_TIMESTAMP WHERE uuid = ?', [row.uuid]);
    return toAppUser(row, phonenumber);
  } catch (err) {
    console.error(`[music:user] Failed to load user for source ${src}:`, err);
    return null;
  }
}

/** Resolve the player's uuid (creating/loading their anon account if needed). */
export async function getUserUuid(src: number): Promise<string | null> {
  const user = await getOrCreateUser(src);
  return user?.uuid ?? null;
}

/** Resolve the player's artist id, or null when they don't own an artist account. */
export async function getArtistId(src: number): Promise<number | null> {
  const user = await getOrCreateUser(src);
  return user?.kind === 'artist' ? user.artistId : null;
}

export async function loginUser(src: number, username: string, password: string): Promise<AuthResult> {
  const phonenumber = getPlayerPhone(src);
  if (!phonenumber) return { success: false, message: 'Could not resolve your phone number' };

  try {
    const row = await oxmysql.single<MusicUserRow>(`${USER_SELECT} WHERE username = ?`, [username]);
    if (!row) return { success: false, message: 'Account not found' };
    if (!row.password) return { success: false, message: 'This account has no password set' };
    if (!verifyPassword(password, row.password)) return { success: false, message: 'Incorrect password' };

    await persistLogin(phonenumber, username);
    await oxmysql.update('UPDATE music_users SET last_seen_at = CURRENT_TIMESTAMP WHERE uuid = ?', [row.uuid]);

    return { success: true, user: toAppUser(row, phonenumber) };
  } catch (err) {
    console.error(`[music:user] Failed to login source ${src}:`, err);
    return { success: false, message: 'Something went wrong, try again' };
  }
}

/**
 * Promote the player's anon account into a real account (chosen username +
 * password). Reuses the phone-linked anon account, so likes/playlists are
 * preserved across the anon -> user transition.
 */
export async function registerUser(src: number, username: string, password: string): Promise<AuthResult> {
  const phonenumber = getPlayerPhone(src);
  if (!phonenumber) return { success: false, message: 'Could not resolve your phone number' };

  const clean = username.trim();
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(clean)) {
    return { success: false, message: 'Username must be 3-32 characters: letters, numbers, . _ -' };
  }
  if (clean.toLowerCase() === phonenumber.toLowerCase()) {
    return { success: false, message: 'That username is reserved' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  try {
    const taken = await oxmysql.single<{ username: string }>('SELECT username FROM music_users WHERE username = ?', [
      clean,
    ]);
    if (taken) return { success: false, message: 'That username is already taken' };

    const anon = await ensureAnonUser(phonenumber);
    if (!anon) return { success: false, message: 'Could not resolve your identity' };

    const updated = await oxmysql.update('UPDATE music_users SET username = ?, password = ? WHERE uuid = ?', [
      clean,
      hashPassword(password),
      anon.uuid,
    ]);
    if (!updated) return { success: false, message: 'Something went wrong, try again' };

    await persistLogin(phonenumber, clean);

    const row = await oxmysql.single<MusicUserRow>(`${USER_SELECT} WHERE uuid = ?`, [anon.uuid]);
    if (!row) return { success: false, message: 'Something went wrong, try again' };

    await oxmysql.update('UPDATE music_users SET last_seen_at = CURRENT_TIMESTAMP WHERE uuid = ?', [anon.uuid]);
    return { success: true, user: toAppUser(row, phonenumber) };
  } catch (err) {
    // Likely a race on the unique username key.
    console.error(`[music:user] Failed to register source ${src}:`, err);
    return { success: false, message: 'That username is already taken' };
  }
}

export async function logoutUser(src: number): Promise<boolean> {
  const phonenumber = getPlayerPhone(src);
  if (!phonenumber) return false;

  try {
    await oxmysql.update('DELETE FROM phone_logged_in_accounts WHERE phone_number = ? AND app = ?', [
      phonenumber,
      APP_ID,
    ]);
    return true;
  } catch (err) {
    console.error(`[music:user] Failed to logout source ${src}:`, err);
    return false;
  }
}

export async function updateProfile(src: number, payload: UpdateProfilePayload): Promise<AuthResult> {
  const phonenumber = getPlayerPhone(src);
  if (!phonenumber) return { success: false, message: 'Could not resolve your phone number' };

  const username = payload.username?.trim();
  const profilePic = payload.profilePic?.trim();

  if (username !== undefined) {
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
      return { success: false, message: 'Username must be 3-32 characters: letters, numbers, . _ -' };
    }
    if (username.toLowerCase() === phonenumber.toLowerCase()) {
      return { success: false, message: 'That username is reserved' };
    }
  }

  try {
    // Resolve the current identity first, then validate the new username.
    const current = await getOrCreateUser(src);
    if (!current) return { success: false, message: 'Could not resolve your identity' };
    if (current.kind === 'anon') return { success: false, message: 'Create an account before editing your profile' };

    if (username !== undefined && username !== current.username) {
      const taken = await oxmysql.single<{ username: string }>(
        'SELECT username FROM music_users WHERE username = ? AND uuid != ?',
        [username, current.uuid],
      );
      if (taken) return { success: false, message: 'That username is already taken' };
    }

    const sets: string[] = [];
    const params: (string | null)[] = [];
    if (username !== undefined && username !== current.username) {
      sets.push('username = ?');
      params.push(username);
    }
    if (profilePic !== undefined) {
      sets.push('profile_pic = ?');
      params.push(profilePic || null);
    }

    if (sets.length > 0) {
      params.push(current.uuid);
      await oxmysql.update(`UPDATE music_users SET ${sets.join(', ')} WHERE uuid = ?`, params);

      // Keep the auto-login session in sync when the username changes.
      if (username !== undefined && username !== current.username) {
        await persistLogin(phonenumber, username);
      }
    }

    const updated = await oxmysql.single<MusicUserRow>(`${USER_SELECT} WHERE uuid = ?`, [current.uuid]);
    if (!updated) return { success: false, message: 'Something went wrong, try again' };

    return { success: true, user: toAppUser(updated, phonenumber) };
  } catch (err) {
    console.error(`[music:user] Failed to update profile for source ${src}:`, err);
    return { success: false, message: 'Something went wrong, try again' };
  }
}

/**
 * Let an artist update their own artist profile (name / bio / picture).
 * Requires the caller to own an artist account (artist_id set on their user).
 */
export async function updateArtistProfile(src: number, payload: UpdateArtistPayload): Promise<BasicResponse> {
  const artistId = await getArtistId(src);
  if (!artistId) return { success: false, message: 'No artist account linked to this user' };

  const name = payload.name?.trim();
  const bio = payload.bio?.trim();
  const image = payload.image?.trim();

  if (name !== undefined && (name.length === 0 || name.length > 64)) {
    return { success: false, message: 'Artist name must be 1-64 characters' };
  }
  if (image !== undefined && image.length > 512) {
    return { success: false, message: 'Image URL is too long' };
  }

  try {
    if (name !== undefined) {
      const taken = await oxmysql.single<{ id: number }>('SELECT id FROM music_artists WHERE name = ? AND id != ?', [
        name,
        artistId,
      ]);
      if (taken) return { success: false, message: 'An artist with that name already exists' };
    }

    const sets: string[] = [];
    const params: (string | null)[] = [];
    if (name !== undefined) {
      sets.push('name = ?');
      params.push(name);
    }
    if (bio !== undefined) {
      sets.push('bio = ?');
      params.push(bio || null);
    }
    if (image !== undefined) {
      sets.push('image = ?');
      params.push(image || null);
    }

    if (sets.length > 0) {
      params.push(String(artistId));
      await oxmysql.update(`UPDATE music_artists SET ${sets.join(', ')} WHERE id = ?`, params);
    }

    return { success: true };
  } catch (err) {
    console.error(`[music:user] Failed to update artist ${artistId}:`, err);
    return { success: false, message: 'Something went wrong, try again' };
  }
}
