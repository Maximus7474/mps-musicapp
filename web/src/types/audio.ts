import type { SongBasic } from '@common/types';

export interface AudioContextType {
  currentSong: SongBasic | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playSong: (song: SongBasic) => void;
  togglePlayPause: () => void;
  skipTo: (time: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}
