import { oxmysql } from '@communityox/oxmysql';
import type { PlaylistBasic, PlaylistRecap } from '@common/types';
import { getSongsByPlaylist } from './songs';

interface PlaylistRow {
  id: number;
  title: string;
  image: string | null;
}

const PLAYLIST_SELECT = 'SELECT id, title, image FROM music_playlists';

/** A single playlist with its tracks in order. */
export async function getPlaylist(uuid: string | null, playlistId: number): Promise<PlaylistBasic | null> {
  const row = await oxmysql.single<PlaylistRow>(`${PLAYLIST_SELECT} WHERE id = ?`, [playlistId]);
  if (!row) return null;

  const tracks = await getSongsByPlaylist(uuid, playlistId);
  return { id: row.id, title: row.title, image: row.image ?? undefined, tracks };
}

/** All playlists (library). */
export async function listPlaylists(): Promise<PlaylistBasic[]> {
  const rows = await oxmysql.query<PlaylistRow[]>(`${PLAYLIST_SELECT} ORDER BY id ASC`);

  const playlists: PlaylistBasic[] = [];
  for (const row of rows) {
    const tracks = await getSongsByPlaylist(null, row.id);
    playlists.push({ id: row.id, title: row.title, image: row.image ?? undefined, tracks });
  }
  return playlists;
}

/** Most recent playlists with track counts (home screen). */
export async function listRecentPlaylists(limit: number): Promise<PlaylistRecap[]> {
  const rows = await oxmysql.query<
    Array<{ id: number; title: string; image: string | null; track_count: number }>
  >(
    `SELECT p.id, p.title, p.image, COUNT(pt.song_id) AS track_count
       FROM music_playlists p
       LEFT JOIN music_playlist_tracks pt ON pt.playlist_id = p.id
      GROUP BY p.id
      ORDER BY p.id DESC
      LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    tracks: Number(row.track_count),
    image: row.image ?? undefined,
  }));
}
