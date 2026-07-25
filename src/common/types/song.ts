/** duration in seconds */
export type SongBasic = {
  id: number;
  name: string;
  author: string;
  liked: boolean;
  url: string;
  image?: string;
  duration?: number;
};

export type ArtistBasic = {
  id: number;
  name: string;
  image?: string;
  genre: string;
  followers: number;
};

export type PlaylistBasic = {
  id: number;
  title: string;
  tracks: number;
  image?: string;
};
