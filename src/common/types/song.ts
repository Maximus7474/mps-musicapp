/** duration in seconds */
export type SongBasic = {
  id: number;
  name: string;
  author: string;
  // ToDo: create an album system
  // album: string;
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

export type ArtistProfile = ArtistBasic & {
  verified?: boolean;
  bio?: string;
  topTracks?: SongBasic[];
  // ToDo: create an album system
  albums?: { title: string; year: string; image: string }[];
  related?: ArtistBasic[];
};

export type PlaylistBasic = {
  id: number;
  title: string;
  tracks: number;
  image?: string;
};
