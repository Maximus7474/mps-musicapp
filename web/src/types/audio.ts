import type { SongBasic } from '@common/types';

export interface QueueSystem {
  list: SongBasic[];
  currentIndex: number;
  isShuffled: boolean;
  isRepeating: boolean;
  skipTo: (idx: number, play?: boolean) => void;
  load: (songs: SongBasic[], autoPlay?: boolean, shuffleQueue?: boolean) => void;
  shuffle: () => void;
  repeat: () => void;
  add: (songOrSongs: SongBasic | SongBasic[]) => void;
  remove: (index: number) => void;
  clear: () => void;
}

export interface AudioContextType {
  currentSong: SongBasic | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playSong: (song: SongBasic) => void;
  clearSong: () => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  skipTo: (time: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  hasErrored: boolean;
  queue: QueueSystem;
}
