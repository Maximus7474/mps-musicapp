import type { SongBasic } from '@common/types';
import React, { useRef, useState, useEffect, type ReactNode } from 'react';
import { AudioContext } from '../hooks/useAudioPlayer';

/** The percentage of the track that must be played to register a "stream" */
const STREAM_LOG_THRESHOLD = 0.6; // 50%

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<SongBasic | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [prevVolume, setPrevVolume] = useState<number>(1);
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

  const setVolume = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 1);
    }
  };

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
        }
      }
    };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.play().catch((err) => console.error('Playback failed:', err));
    }
  }, [currentSong]);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playSong,
        togglePlayPause,
        skipTo, setVolume, toggleMute, volume,
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
