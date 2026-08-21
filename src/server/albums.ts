import { oxmysql } from '@communityox/oxmysql';
import type { AlbumBasic, SaveAlbumPayload, SongBasic } from '@common/types';
import { getSongsByAlbum } from './songs';

interface AlbumRow {
  id: number;
  artist_id: number;
  name: string;
  image: string | null;
  year: string | null;
  artist_name: string;
}

const ALBUM_SELECT = `
  SELECT a.id, a.artist_id, a.name, a.image, a.year, ar.name AS artist_name
    FROM music_albums a
    JOIN music_artists ar ON ar.id = a.artist_id`;

function toAlbumBasic(row: AlbumRow, tracks: SongBasic[]): AlbumBasic {
  return {
    id: String(row.id),
    name: row.name,
    year: row.year ?? '',
    image: row.image ?? undefined,
    author: { id: row.artist_id, name: row.artist_name },
    tracks,
  };
}

/** A single album with its tracks in order. */
export async function getAlbum(uuid: string | null, albumId: number): Promise<AlbumBasic | null> {
  const row = await oxmysql.single<AlbumRow>(`${ALBUM_SELECT} WHERE a.id = ?`, [albumId]);
  if (!row) return null;

  const tracks = await getSongsByAlbum(uuid, row.id);
  return toAlbumBasic(row, tracks);
}

/** Albums owned by an artist (Studio album list / artist profile). */
export async function listAlbumsByArtist(uuid: string | null, artistId: number): Promise<AlbumBasic[]> {
  const rows = await oxmysql.query<AlbumRow[]>(`${ALBUM_SELECT} WHERE a.artist_id = ? ORDER BY a.created_at DESC`, [
    artistId,
  ]);

  const albums: AlbumBasic[] = [];
  for (const row of rows) {
    const tracks = await getSongsByAlbum(uuid, row.id);
    albums.push(toAlbumBasic(row, tracks));
  }
  return albums;
}

/**
 * Replace an album's track list. Only songs owned by the artist are linked
 * (defense in depth against arbitrary song ids), preserving the payload order.
 */
async function setAlbumTracks(albumId: number, tracks: SongBasic[], artistId: number): Promise<void> {
  await oxmysql.update('DELETE FROM music_album_tracks WHERE album_id = ?', [albumId]);
  if (tracks.length === 0) return;

  const placeholders = tracks.map(() => '?').join(', ');
  const owned = await oxmysql.query<{ id: number }[]>(
    `SELECT id FROM music_songs WHERE id IN (${placeholders}) AND artist_id = ?`,
    [...tracks.map((t) => t.id), artistId],
  );
  const ownedIds = new Set(owned.map((r) => r.id));

  let position = 0;
  for (const track of tracks) {
    if (ownedIds.has(track.id)) {
      await oxmysql.insert('INSERT INTO music_album_tracks (album_id, song_id, position) VALUES (?, ?, ?)', [
        albumId,
        track.id,
        position++,
      ]);
    }
  }
}

/** Create an album for the given artist (id and author are attributed server-side). */
export async function createAlbum(artistId: number, payload: SaveAlbumPayload): Promise<AlbumBasic | null> {
  try {
    const id = await oxmysql.insert<number>(
      'INSERT INTO music_albums (artist_id, name, image, year) VALUES (?, ?, ?, ?)',
      [artistId, payload.name, payload.image, payload.year],
    );

    await setAlbumTracks(id, payload.tracks, artistId);
    return getAlbum(null, id);
  } catch (err) {
    console.error('[music:albums] Failed to create album:', err);
    return null;
  }
}

/** Update an album, only if it belongs to the given artist. */
export async function updateAlbum(
  uuid: string | null,
  artistId: number,
  payload: SaveAlbumPayload & { id: string },
): Promise<AlbumBasic | null> {
  const albumId = Number(payload.id);

  const affected = await oxmysql.update<number>(
    `UPDATE music_albums SET name = ?, image = ?, year = ? WHERE id = ? AND artist_id = ?`,
    [payload.name, payload.image, payload.year, albumId, artistId],
  );

  if (affected < 1) return null;

  await setAlbumTracks(albumId, payload.tracks, artistId);
  return getAlbum(uuid, albumId);
}

/** Delete an album, only if it belongs to the given artist. */
export async function deleteAlbum(artistId: number, albumId: string | number): Promise<boolean> {
  const affected = await oxmysql.update<number>('DELETE FROM music_albums WHERE id = ? AND artist_id = ?', [
    Number(albumId),
    artistId,
  ]);
  return affected > 0;
}
