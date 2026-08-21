import type { AlbumBasic, SongBasic } from '@common/types';

export type SongFormPayload = {
  id?: number;
  name: string;
  author: string;
  url: string;
  image: string;
  duration: number;
};

export interface SongListTabProps {
  songs: SongBasic[];
  onPlay: (song: SongBasic) => void;
  onEdit: (song: SongBasic) => void;
  onDelete: (songId: number) => void;
  onUpload: () => void;
}

export interface SongEditorTabProps {
  editingSong: SongBasic | null;
  onCancel: () => void;
  onSave: (payload: SongFormPayload) => void;
}

export interface AlbumListTabProps {
  albums: AlbumBasic[];
  songs: SongBasic[];
  onSaveAlbum: (album: AlbumBasic) => void;
  onDeleteAlbum: (albumId: string | number) => void;
}
