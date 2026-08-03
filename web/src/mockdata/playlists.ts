import type { PlaylistBasic, PlaylistRecap } from '@common/types';
import { MOCK_SONGS } from './songs';

export const MOCK_PLAYLISTS: PlaylistBasic[] = [
  {
    id: 301,
    title: 'Non-Stop-Pop FM Hits',
    tracks: [...MOCK_SONGS],
    image: 'https://static.wikia.nocookie.net/gta/images/6/67/Non-stop-pop-FM-GTAV.png',
  },
  {
    id: 302,
    title: 'Vinewood Night Drive',
    tracks: [...MOCK_SONGS],
    image: '',
  },
  {
    id: 303,
    title: 'Radio Los Santos Bangers',
    tracks: [MOCK_SONGS[2], MOCK_SONGS[3]],
    image: '',
  },
  {
    id: 304,
    title: 'Blaine County Highway Classics',
    tracks: [MOCK_SONGS[0], MOCK_SONGS[4]],
    image: '',
  },
  {
    id: 305,
    title: 'West Coast Talk Highlights',
    tracks: [MOCK_SONGS[1]],
    image: '',
  },
  {
    id: 306,
    title: 'Chumash Mashup',
    tracks: [MOCK_SONGS[0], MOCK_SONGS[1]],
    image: '',
  },
];

export const MOCK_PLAYLISTS_RECAP: PlaylistRecap[] = MOCK_PLAYLISTS.map((p) => ({
  ...p,
  tracks: p.tracks.length,
}));
