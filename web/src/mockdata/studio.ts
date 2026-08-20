import type { AlbumBasic, SongBasic } from '@common/types';

const COVER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Sounds_of_Earth_-_GPN-2000-001976.jpg/330px-The_Sounds_of_Earth_-_GPN-2000-001976.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail';

export const MOCK_STUDIO_SONGS: SongBasic[] = [
  {
    id: 201,
    name: 'Golden Hour',
    author: 'Nova Eclipse',
    liked: true,
    url: 'https://example.com/audio/golden-hour.mp3',
    image: COVER_IMAGE,
    duration: 214,
  },
  {
    id: 202,
    name: 'Starlight Drive',
    author: 'Nova Eclipse',
    liked: false,
    url: 'https://example.com/audio/starlight-drive.mp3',
    image: COVER_IMAGE,
    duration: 198,
  },
  {
    id: 203,
    name: 'Neon Rain',
    author: 'Nova Eclipse',
    liked: true,
    url: 'https://example.com/audio/neon-rain.mp3',
    image: COVER_IMAGE,
    duration: 226,
  },
  {
    id: 204,
    name: 'Paper Moons',
    author: 'Nova Eclipse',
    liked: false,
    url: 'https://example.com/audio/paper-moons.mp3',
    image: COVER_IMAGE,
    duration: 187,
  },
  {
    id: 205,
    name: 'Afterglow',
    author: 'Nova Eclipse',
    liked: false,
    url: 'https://example.com/audio/afterglow.mp3',
    image: COVER_IMAGE,
    duration: 240,
  },
];

export const MOCK_STUDIO_ALBUMS: AlbumBasic[] = [
  {
    id: 'studio-album-1',
    name: 'The Sounds of Earth',
    image: COVER_IMAGE,
    author: { id: 300, name: 'Nova Eclipse' },
    year: '2024',
    tracks: MOCK_STUDIO_SONGS.slice(0, 3),
  },
  {
    id: 'studio-album-2',
    name: 'Echoes of Dawn',
    image: COVER_IMAGE,
    author: { id: 300, name: 'Nova Eclipse' },
    year: '2022',
    tracks: MOCK_STUDIO_SONGS.slice(3),
  },
  {
    id: 'studio-album-3',
    name: 'Neon Horizons',
    image: COVER_IMAGE,
    author: { id: 300, name: 'Nova Eclipse' },
    year: '2020',
    tracks: [],
  },
];
