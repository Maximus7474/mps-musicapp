import { createContext, useContext } from 'react';
import type { AudioContextType } from '~/types';

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioProvider');
  }
  return context;
};
