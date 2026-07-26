import type { AlbumBasic } from "@common/types";
import { MOCK_SONGS } from "./songs";

export const MOCK_ALBUMS: AlbumBasic[] = [
  {
    id: 'mock-id-0001',
    name: 'Non Stop FM Vol. 1',
    image: '',
    author: {
      id: 202,
      name: 'DJ Cara',
    },
    year: '2013',
    tracks: MOCK_SONGS.filter((s) => s.author.toLowerCase().includes('dj cara')),
  },
  {
    id: 'mock-id-0002',
    name: 'Non Stop FM Vol. 2',
    image: '',
    author: {
      id: 202,
      name: 'DJ Cara',
    },
    year: '2013',
    tracks: MOCK_SONGS.filter((s) => s.author.toLowerCase().includes('dj cara')),
  },
];
