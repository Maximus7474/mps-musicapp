import type { SongBasic } from '@common/types';

export const MOCK_SONGS: SongBasic[] = [
  {
    id: 101,
    name: 'Midnight City (LS Remix)',
    author: 'M83 ft. DJ Cara',
    liked: true,
    url: 'https://example.com/audio/midnight-city.mp3',
    image: '',
    duration: 243,
  },
  {
    id: 102,
    name: 'El Sonidito',
    author: 'Hechiceros Band',
    liked: false,
    url: 'https://example.com/audio/el-sonidito.mp3',
    image: '',
    duration: 195,
  },
  {
    id: 103,
    name: 'ADHD',
    author: 'Kendrick Lamar',
    liked: true,
    url: 'https://example.com/audio/adhd.mp3',
    image: '',
    duration: 215,
  },
  {
    id: 104,
    name: 'Garbage',
    author: 'Tyler, The Creator',
    liked: false,
    url: 'https://example.com/audio/garbage.mp3',
    image: '',
    duration: 208,
  },
  {
    id: 105,
    name: 'Lock & Load',
    author: 'Love Fist',
    liked: false,
    url: 'https://example.com/audio/lock-and-load.mp3',
    image: '',
    duration: 180,
  },
];
