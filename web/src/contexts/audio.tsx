import type { SongBasic } from '@common/types';
import React, { useRef, useState, useEffect, type ReactNode } from 'react';
import { AudioContext } from '../hooks/useAudio';

/** The percentage of the track that must be played to register a "stream" */
const STREAM_LOG_THRESHOLD = 0.6; // 50%

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<SongBasic | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hasLoggedStream = useRef<boolean>(false);

  const playSong = (song: SongBasic) => {
    if (currentSong?.id === song.id) {
      audioRef.current?.play();
      return;
    }

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 0);
    hasLoggedStream.current = false;
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Playback failed:', err);
      });
    }
  };

  const skipTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.play().catch((err) => console.error('Playback failed:', err));
    }
  }, [currentSong]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;

    setCurrentTime(current);

    // Stream logging logic
    if (total > 0 && !hasLoggedStream.current) {
      const percentagePlayed = current / total;

      if (percentagePlayed >= STREAM_LOG_THRESHOLD) {
        hasLoggedStream.current = true;

        fetchNui('musicapp:logstream', {
          songId: currentSong?.id,
        }).catch((err) => console.error('[AUDIO] Failed to log stream', err.message));

        console.log(`[Stream Logged] Song: ${currentSong?.name}`);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playSong,
        togglePlayPause,
        skipTo,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </AudioContext.Provider>
  );
};
