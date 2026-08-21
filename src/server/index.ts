import { RegisterServerCallback } from './utils/callbacks';
import { getOrCreateUser, logoutUser, loginUser, registerUser, getUserUuid, getArtistId } from './user';
import { getHomeScreenData, getLibraryData, getArtistProfile } from './library';
import { getAlbum, listAlbumsByArtist, createAlbum, updateAlbum, deleteAlbum } from './albums';
import { getPlaylist } from './playlists';
import {
  listSongsByArtist,
  createSong,
  updateSong,
  deleteSong,
  toggleLike,
  logStream,
} from './songs';
import type {
  AppUser,
  AuthResult,
  BasicResponse,
  CreateSongPayload,
  EditSongPayload,
  LikeSongPayload,
  LogStreamPayload,
  SaveAlbumPayload,
  SongBasic,
  AlbumBasic,
  PlaylistBasic,
  ArtistProfile,
  HomeScreenData,
  LibraryData,
} from '@common/types';

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

RegisterServerCallback<AppUser | null>('musicapp:getUser', async (src) => {
  return getOrCreateUser(src);
});

RegisterServerCallback<boolean>('musicapp:logout', async (src) => {
  return logoutUser(src);
});

RegisterServerCallback<AuthResult>('musicapp:login', async (src, data: { username: string; password: string }) => {
  return loginUser(src, data.username, data.password);
});

RegisterServerCallback<AuthResult>('musicapp:register', async (src, data: { username: string; password: string }) => {
  return registerUser(src, data.username, data.password);
});

// ---------------------------------------------------------------------------
// Browse
// ---------------------------------------------------------------------------

RegisterServerCallback<HomeScreenData>('musicapp:homescreendata', async (src) => {
  return getHomeScreenData(await getUserUuid(src));
});

RegisterServerCallback<LibraryData>('musicapp:fetchlibrary', async (src) => {
  return getLibraryData(await getUserUuid(src));
});

RegisterServerCallback<ArtistProfile | null>('musicapp:fetchartist', async (src, data: { id: number }) => {
  return getArtistProfile(await getUserUuid(src), Number(data.id));
});

RegisterServerCallback<AlbumBasic | null>('musicapp:fetchalbum', async (src, data: { id: string | number }) => {
  return getAlbum(await getUserUuid(src), Number(data.id));
});

RegisterServerCallback<PlaylistBasic | null>('musicapp:fetchplaylist', async (src, data: { id: number }) => {
  return getPlaylist(await getUserUuid(src), Number(data.id));
});

// ---------------------------------------------------------------------------
// Likes / streams
// ---------------------------------------------------------------------------

RegisterServerCallback<BasicResponse>('musicapp:likesong', async (src, data: LikeSongPayload) => {
  const uuid = await getUserUuid(src);
  if (!uuid) return { success: false, message: 'Could not resolve your identity' };

  const songId = Number(data.id);
  const liked = Boolean(data.state);

  const ok = await toggleLike(uuid, songId, liked);
  if (!ok) return { success: false, message: 'Song not found' };

  return { success: true };
});

RegisterServerCallback<boolean>('musicapp:logstream', async (_: number, data: LogStreamPayload) => {
  await logStream(Number(data.songId));
  return true;
});

// ---------------------------------------------------------------------------
// Artist Studio
// ---------------------------------------------------------------------------

RegisterServerCallback<SongBasic[]>('musicapp:getArtistSongs', async (src) => {
  const artistId = await getArtistId(src);
  if (!artistId) return [];
  return listSongsByArtist(await getUserUuid(src), artistId);
});

RegisterServerCallback<AlbumBasic[]>('musicapp:getArtistAlbums', async (src) => {
  const artistId = await getArtistId(src);
  if (!artistId) return [];
  return listAlbumsByArtist(await getUserUuid(src), artistId);
});

RegisterServerCallback<SongBasic | null>('musicapp:addSong', async (src, data: CreateSongPayload) => {
  const artistId = await getArtistId(src);
  if (!artistId) return null;
  return createSong(artistId, data);
});

RegisterServerCallback<SongBasic | null>('musicapp:updateSong', async (src, data: EditSongPayload) => {
  const artistId = await getArtistId(src);
  if (!artistId) return null;
  return updateSong(await getUserUuid(src), artistId, data);
});

RegisterServerCallback<boolean>('musicapp:deleteSong', async (src, data: { id: number }) => {
  const artistId = await getArtistId(src);
  if (!artistId) return false;
  return deleteSong(artistId, Number(data.id));
});

RegisterServerCallback<AlbumBasic | null>('musicapp:createAlbum', async (src, data: SaveAlbumPayload) => {
  const artistId = await getArtistId(src);
  if (!artistId) return null;
  return createAlbum(artistId, data);
});

RegisterServerCallback<AlbumBasic | null>('musicapp:updateAlbum', async (src, data: SaveAlbumPayload & { id: string }) => {
  const artistId = await getArtistId(src);
  if (!artistId) return null;
  return updateAlbum(await getUserUuid(src), artistId, data);
});

RegisterServerCallback<boolean>('musicapp:deleteAlbum', async (src, data: { id: string | number }) => {
  const artistId = await getArtistId(src);
  if (!artistId) return false;
  return deleteAlbum(artistId, data.id);
});
