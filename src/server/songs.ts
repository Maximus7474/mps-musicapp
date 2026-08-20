import { oxmysql } from '@communityox/oxmysql';
import type { CreateSongPayload, EditSongPayload, SongBasic } from '@common/types';

interface SongRow {
  id: number;
  name: string;
  author: string;
  url: string;
  image: string | null;
  duration: number;
  liked: number;
}

/**
 * Base song select. The first parameter is always the current user's uuid and
 * drives the `liked` flag through the likes join (NULL uuid => not liked).
 */
const SONG_SELECT = `
  SELECT s.id, s.name, s.author, s.url, s.image, s.duration,
         IF(l.song_id IS NULL, 0, 1) AS liked
    FROM music_songs s
    LEFT JOIN music_song_likes l ON l.song_id = s.id AND l.user_uuid = ?`;

function toSongBasic(row: SongRow): SongBasic {
  return {
    id: row.id,
    name: row.name,
    author: row.author,
    liked: row.liked === 1,
    url: row.url,
    image: row.image ?? undefined,
    duration: row.duration,
  };
}

/** The artist's own tracks (Studio song list). */
export async function listSongsByArtist(uuid: string | null, artistId: number): Promise<SongBasic[]> {
  const rows = await oxmysql.query<SongRow[]>(
    `${SONG_SELECT} WHERE s.artist_id = ? ORDER BY s.created_at DESC`,
    [uuid, artistId]
  );
  return rows.map(toSongBasic);
}

/** Latest added songs (home screen). */
export async function getLatestSongs(uuid: string | null, limit: number): Promise<SongBasic[]> {
  const rows = await oxmysql.query<SongRow[]>(
    `${SONG_SELECT} ORDER BY s.created_at DESC LIMIT ?`,
    [uuid, limit]
  );
  return rows.map(toSongBasic);
}

/** An artist's most streamed tracks (artist profile). */
export async function getTopTracks(uuid: string | null, artistId: number, limit: number): Promise<SongBasic[]> {
  const rows = await oxmysql.query<SongRow[]>(
    `${SONG_SELECT} WHERE s.artist_id = ? ORDER BY s.streams DESC LIMIT ?`,
    [uuid, artistId, limit]
  );
  return rows.map(toSongBasic);
}

/** A single song (used by update flows). */
export async function getSong(uuid: string | null, songId: number): Promise<SongBasic | null> {
  const row = await oxmysql.single<SongRow>(`${SONG_SELECT} WHERE s.id = ?`, [uuid, songId]);
  return row ? toSongBasic(row) : null;
}

/** Songs of an album in track order. */
export async function getSongsByAlbum(uuid: string | null, albumId: number): Promise<SongBasic[]> {
  const rows = await oxmysql.query<SongRow[]>(
    `${SONG_SELECT}
      JOIN music_album_tracks at ON at.song_id = s.id AND at.album_id = ?
     ORDER BY at.position ASC`,
    [uuid, albumId]
  );
  return rows.map(toSongBasic);
}

/** Songs of a playlist in track order. */
export async function getSongsByPlaylist(uuid: string | null, playlistId: number): Promise<SongBasic[]> {
  const rows = await oxmysql.query<SongRow[]>(
    `${SONG_SELECT}
      JOIN music_playlist_tracks pt ON pt.song_id = s.id AND pt.playlist_id = ?
     ORDER BY pt.position ASC`,
    [uuid, playlistId]
  );
  return rows.map(toSongBasic);
}

/** Create a song owned by the given artist. */
export async function createSong(artistId: number, payload: CreateSongPayload): Promise<SongBasic | null> {
  try {
    const id = await oxmysql.insert<number>(
      'INSERT INTO music_songs (artist_id, name, author, url, image, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [artistId, payload.name, payload.author, payload.url, payload.image ?? null, payload.duration ?? 0]
    );

    return {
      id,
      name: payload.name,
      author: payload.author,
      liked: false,
      url: payload.url,
      image: payload.image,
      duration: payload.duration ?? 0,
    };
  } catch (err) {
    console.error('[music:songs] Failed to create song:', err);
    return null;
  }
}

/** Update a song, only if it belongs to the given artist. */
export async function updateSong(uuid: string | null, artistId: number, payload: EditSongPayload): Promise<SongBasic | null> {
  const affected = await oxmysql.update<number>(
    `UPDATE music_songs
        SET name = ?, author = ?, url = ?, image = ?, duration = ?
      WHERE id = ? AND artist_id = ?`,
    [payload.name, payload.author, payload.url, payload.image ?? null, payload.duration ?? 0, payload.id, artistId]
  );

  if (affected < 1) return null;
  return getSong(uuid, payload.id);
}

/** Delete a song, only if it belongs to the given artist. */
export async function deleteSong(artistId: number, songId: number): Promise<boolean> {
  const affected = await oxmysql.update<number>(
    'DELETE FROM music_songs WHERE id = ? AND artist_id = ?',
    [songId, artistId]
  );
  return affected > 0;
}

/** Set (or clear) a user's like on a song. Returns false when the song is unknown. */
export async function toggleLike(uuid: string, songId: number, liked: boolean): Promise<boolean> {
  const exists = await oxmysql.single<{ total: number }>(
    'SELECT COUNT(*) AS total FROM music_songs WHERE id = ?',
    [songId]
  );
  if (!exists || Number(exists.total) < 1) return false;

  if (liked) {
    // IGNORE keeps re-liking idempotent (no duplicate rows).
    await oxmysql.insert('INSERT IGNORE INTO music_song_likes (user_uuid, song_id) VALUES (?, ?)', [uuid, songId]);
  } else {
    await oxmysql.update('DELETE FROM music_song_likes WHERE user_uuid = ? AND song_id = ?', [uuid, songId]);
  }

  return true;
}

/** Register a play/stream for a song. */
export async function logStream(songId: number): Promise<void> {
  await oxmysql.update('UPDATE music_songs SET streams = streams + 1 WHERE id = ?', [songId]);
}
