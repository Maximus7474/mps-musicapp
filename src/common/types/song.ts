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

export type SongLikedPayload = {
  id: SongBasic['id'];
  liked: boolean;
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
  albums?: AlbumBasic[];
  related?: ArtistBasic[];
};

export type PlaylistBasic = {
  id: number;
  title: string;
  tracks: SongBasic[];
  image?: string;
};

export type PlaylistRecap = {
  id: number;
  title: string;
  tracks: number;
  image?: string;
};

export type AlbumBasic = {
  id: string;
  name: string;
  year: string;
  image?: string;
  author:
    | {
        id: ArtistBasic['id'];
        name: ArtistBasic['name'];
      }
    | 'various_artists';
  tracks: SongBasic[];
};

export type SongMetric = SongBasic & {
  streams: number;
  weeklyChangePercent: number;
};

export type ArtistMetrics = {
  totalStreams: number;
  monthlyListeners: number;
  topTrack: SongMetric | null;
  recentTracks: SongMetric[];
};

export type CreateSongPayload = {
  name: string;
  author: string;
  url: string;
  image?: string;
  duration?: number;
};

export type SaveAlbumPayload = {
  id?: string;
  name: string;
  image: string;
  year: string;
  tracks: SongBasic[];
}

/** Client -> server create-album. The server attributes the id and author. */
export type CreateAlbumPayload = {
  name: string;
  image: string;
  year: string;
  tracks: CreateSongPayload[];
};

export type EditSongPayload = Partial<Omit<SongBasic, 'id'>> & { id: number };
export type EditAlbumPayload = Partial<Omit<AlbumBasic, 'id'>> & { id: number };

export type HomeScreenData = {
  latestsongs: SongBasic[];
  recentartists: ArtistBasic[];
  recentplaylists: PlaylistRecap[];
};

export type LibraryData = {
  artists: ArtistBasic[];
  playlists: PlaylistBasic[];
};

/** Payload for `musicapp:likesong` (the broadcast uses { id, liked }). */
export type LikeSongPayload = {
  id: SongBasic['id'];
  state: boolean;
};

export type LogStreamPayload = {
  songId: SongBasic['id'];
};
