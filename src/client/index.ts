import { triggerServerCallback } from './utils/callbacks';
import type {
  AppUser,
  AuthResult,
  AlbumBasic,
  ArtistProfile,
  HomeScreenData,
  LibraryData,
  PlaylistBasic,
  SongBasic,
  BasicResponse,
} from '@common/types';

import './init';

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

RegisterNuiCallback('musicapp:getUser', async (_: unknown, cb: (user: AppUser | null) => void) => {
  const user = await triggerServerCallback<AppUser | null>('musicapp:getUser');
  cb(user);
});

RegisterNuiCallback('musicapp:logout', async (_: unknown, cb: (done: boolean) => void) => {
  const done = await triggerServerCallback<boolean>('musicapp:logout');
  cb(done);
});

RegisterNuiCallback(
  'musicapp:login',
  async (data: { username: string; password: string }, cb: (result: AuthResult) => void) => {
    cb(await triggerServerCallback<AuthResult>('musicapp:login', data));
  }
);

RegisterNuiCallback(
  'musicapp:register',
  async (data: { username: string; password: string }, cb: (result: AuthResult) => void) => {
    cb(await triggerServerCallback<AuthResult>('musicapp:register', data));
  }
);

// ---------------------------------------------------------------------------
// Browse
// ---------------------------------------------------------------------------

RegisterNuiCallback('musicapp:homescreendata', async (_: unknown, cb: (data: HomeScreenData) => void) => {
  cb(await triggerServerCallback<HomeScreenData>('musicapp:homescreendata'));
});

RegisterNuiCallback('musicapp:fetchlibrary', async (_: unknown, cb: (data: LibraryData) => void) => {
  cb(await triggerServerCallback<LibraryData>('musicapp:fetchlibrary'));
});

RegisterNuiCallback('musicapp:fetchartist', async (data: { id: number }, cb: (artist: ArtistProfile | null) => void) => {
  cb(await triggerServerCallback<ArtistProfile | null>('musicapp:fetchartist', data));
});

RegisterNuiCallback('musicapp:fetchalbum', async (data: { id: string | number }, cb: (album: AlbumBasic | null) => void) => {
  cb(await triggerServerCallback<AlbumBasic | null>('musicapp:fetchalbum', data));
});

RegisterNuiCallback('musicapp:fetchplaylist', async (data: { id: number }, cb: (playlist: PlaylistBasic | null) => void) => {
  cb(await triggerServerCallback<PlaylistBasic | null>('musicapp:fetchplaylist', data));
});

// ---------------------------------------------------------------------------
// Likes / streams
// ---------------------------------------------------------------------------

RegisterNuiCallback('musicapp:likesong', async (data: { id: number; state: boolean }, cb: (result: BasicResponse) => void) => {
  cb(await triggerServerCallback<BasicResponse>('musicapp:likesong', data));
});

RegisterNuiCallback('musicapp:logstream', async (data: { songId: number }, cb: (done: boolean) => void) => {
  cb(await triggerServerCallback<boolean>('musicapp:logstream', data));
});

// ---------------------------------------------------------------------------
// Artist Studio
// ---------------------------------------------------------------------------

RegisterNuiCallback('musicapp:getArtistSongs', async (_: unknown, cb: (songs: SongBasic[]) => void) => {
  cb(await triggerServerCallback<SongBasic[]>('musicapp:getArtistSongs'));
});

RegisterNuiCallback('musicapp:getArtistAlbums', async (_: unknown, cb: (albums: AlbumBasic[]) => void) => {
  cb(await triggerServerCallback<AlbumBasic[]>('musicapp:getArtistAlbums'));
});

RegisterNuiCallback('musicapp:addSong', async (data: unknown, cb: (song: SongBasic | null) => void) => {
  cb(await triggerServerCallback<SongBasic | null>('musicapp:addSong', data));
});

RegisterNuiCallback('musicapp:updateSong', async (data: unknown, cb: (song: SongBasic | null) => void) => {
  cb(await triggerServerCallback<SongBasic | null>('musicapp:updateSong', data));
});

RegisterNuiCallback('musicapp:deleteSong', async (data: { id: number }, cb: (done: boolean) => void) => {
  cb(await triggerServerCallback<boolean>('musicapp:deleteSong', data));
});

RegisterNuiCallback('musicapp:createAlbum', async (data: unknown, cb: (album: AlbumBasic | null) => void) => {
  cb(await triggerServerCallback<AlbumBasic | null>('musicapp:createAlbum', data));
});

RegisterNuiCallback('musicapp:updateAlbum', async (data: unknown, cb: (album: AlbumBasic | null) => void) => {
  cb(await triggerServerCallback<AlbumBasic | null>('musicapp:updateAlbum', data));
});

RegisterNuiCallback('musicapp:deleteAlbum', async (data: { id: string | number }, cb: (done: boolean) => void) => {
  cb(await triggerServerCallback<boolean>('musicapp:deleteAlbum', data));
});
