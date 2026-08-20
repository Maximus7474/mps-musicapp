import { oxmysql } from '@communityox/oxmysql';
import type { ArtistBasic, ArtistProfile, HomeScreenData, LibraryData } from '@common/types';
import { getTopTracks, getLatestSongs } from './songs';
import { listAlbumsByArtist } from './albums';
import { listPlaylists, listRecentPlaylists } from './playlists';

interface ArtistRow {
  id: number;
  name: string;
  image: string | null;
  genre: string;
  followers: number;
  verified: number;
  bio: string | null;
}

const ARTIST_SELECT = `
  SELECT id, name, image, genre, followers, verified, bio
    FROM music_artists`;

/** Top artists by followers. */
export async function listArtists(limit: number): Promise<ArtistBasic[]> {
  const rows = await oxmysql.query<ArtistRow[]>(
    `${ARTIST_SELECT} ORDER BY followers DESC LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    image: row.image ?? undefined,
    genre: row.genre,
    followers: row.followers,
  }));
}

/** Home screen: latest songs, top artists and recent playlists. */
export async function getHomeScreenData(uuid: string | null): Promise<HomeScreenData> {
  const [latestsongs, recentartists, recentplaylists] = await Promise.all([
    getLatestSongs(uuid, 10),
    listArtists(6),
    listRecentPlaylists(5),
  ]);

  return { latestsongs, recentartists, recentplaylists };
}

/** Library: all artists and playlists. */
export async function getLibraryData(uuid: string | null): Promise<LibraryData> {
  const [artists, playlists] = await Promise.all([listArtists(50), listPlaylists()]);
  return { artists, playlists };
}

/** Full artist profile: info, top tracks, albums and related artists. */
export async function getArtistProfile(uuid: string | null, artistId: number): Promise<ArtistProfile | null> {
  const row = await oxmysql.single<ArtistRow>(`${ARTIST_SELECT} WHERE id = ?`, [artistId]);
  if (!row) return null;

  const [topTracks, albums, related] = await Promise.all([
    getTopTracks(uuid, artistId, 10),
    listAlbumsByArtist(uuid, artistId),
    listRelatedArtists(artistId, 6),
  ]);

  return {
    id: row.id,
    name: row.name,
    image: row.image ?? undefined,
    genre: row.genre,
    followers: row.followers,
    verified: row.verified === 1,
    bio: row.bio ?? undefined,
    topTracks,
    albums,
    related,
  };
}

async function listRelatedArtists(artistId: number, limit: number): Promise<ArtistBasic[]> {
  const rows = await oxmysql.query<ArtistRow[]>(
    `${ARTIST_SELECT} WHERE id != ? ORDER BY followers DESC LIMIT ?`,
    [artistId, limit]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    image: row.image ?? undefined,
    genre: row.genre,
    followers: row.followers,
  }));
}
