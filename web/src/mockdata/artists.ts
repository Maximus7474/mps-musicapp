import type { ArtistBasic, ArtistProfile } from '@common/types';
import { MOCK_SONGS } from './songs';
import { MOCK_ALBUMS } from './albums';

export const MOCK_ARTISTS: ArtistBasic[] = [
  {
    id: 201,
    name: 'Love Fist',
    image: '',
    genre: 'Hair Metal / Hard Rock',
    followers: 1250000,
  },
  {
    id: 202,
    name: 'DJ Cara',
    image: '',
    genre: 'Dance-Pop / Electronic',
    followers: 840000,
  },
  {
    id: 203,
    name: 'Dr. Ray De Angelo Harris',
    image: '',
    genre: 'Talk / Spiritual Self-Help',
    followers: 310000,
  },
  {
    id: 204,
    name: 'Pooh Bear',
    image: '',
    genre: 'West Coast Hip-Hop',
    followers: 620000,
  },
  {
    id: 205,
    name: 'OG Loc',
    image: '',
    genre: 'Underground Gangsta Rap',
    followers: 14200,
  },
];

export const MOCK_ARTIST_PROFILE: ArtistProfile = {
  id: 202,
  name: 'DJ Cara',
  verified: true,
  image: '',
  genre: 'Dance-Pop / Electronic',
  followers: 840000,
  bio: 'DJ Cara is the one and only DJ and host of Non-Stop Pop FM.',
  topTracks: MOCK_SONGS.filter((s) => s.author.toLowerCase().includes('dj cara')),
  albums: MOCK_ALBUMS,
  related: MOCK_ARTISTS.filter((a) => a.id !== 202),
};
