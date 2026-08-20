import { randomUUID } from 'node:crypto';
import { oxmysql } from '@communityox/oxmysql';
import type { AppUser } from '@common/types';

/** The app identifier used in the shared `phone_logged_in_accounts` table. */
const APP_ID = 'mps-musicapp';

/** Row shape returned by the music_users query. */
interface MusicUserRow {
  uuid: string;
  phonenumber: string | null;
  username: string | null;
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
const USER_SELECT = `SELECT uuid, phonenumber, username, profile_pic, is_artist, artist_id
                       FROM music_users`;

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
    await oxmysql.insert(
      'INSERT INTO music_users (uuid, phonenumber, username) VALUES (?, ?, ?)',
      [uuid, phonenumber, phonenumber]
    );

    return { uuid, phonenumber, username: phonenumber, profile_pic: null, is_artist: 0, artist_id: null };
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
async function ensureLoggedIn(phonenumber: string, username: string): Promise<void> {
  await oxmysql.insert(
    `INSERT INTO phone_logged_in_accounts (phone_number, app, username, active)
     SELECT ?, ?, ?, 1
      WHERE NOT EXISTS (
        SELECT 1 FROM phone_logged_in_accounts
         WHERE phone_number = ? AND app = ?
      )`,
    [phonenumber, APP_ID, username, phonenumber, APP_ID]
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
      [phonenumber, APP_ID]
    );

    let row: MusicUserRow | null = null;

    if (loggedIn?.username) {
      row = await oxmysql.single<MusicUserRow>(
        `${USER_SELECT} WHERE username = ?`,
        [loggedIn.username]
      );
    }

    // No active login: reuse the anon account linked to this phone (if any) or
    // create one, then keep it logged in so it persists across reloads.
    if (!row) {
      row = await ensureAnonUser(phonenumber);

      if (row) {
        await ensureLoggedIn(phonenumber, row.username ?? phonenumber);
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

export async function logoutUser(src: number): Promise<boolean> {
  const phonenumber = getPlayerPhone(src);
  if (!phonenumber) return false;

  try {
    await oxmysql.update(
      'DELETE FROM phone_logged_in_accounts WHERE phone_number = ? AND app = ?',
      [phonenumber, APP_ID]
    );
    return true;
  } catch (err) {
    console.error(`[music:user] Failed to logout source ${src}:`, err);
    return false;
  }
}
