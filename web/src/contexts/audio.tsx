import type { SongBasic } from '@common/types';
import React, { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchNui } from '~/utils/fetchNui';
import { AudioContext } from '~/hooks/useAudioPlayer';

/** The percentage of the track that must be played to register a "stream" */
const STREAM_LOG_THRESHOLD = 0.6; // 60%

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasLoggedStream = useRef<boolean>(false);
  const [currentSong, setCurrentSong] = useState<SongBasic | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasErrored, setErrored] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [prevVolume, setPrevVolume] = useState<number>(1);
  const [queueList, setQueueList] = useState<SongBasic[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const safePlay = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setErrored(false);
      setIsPlaying(true);
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('[AUDIO] Playback Error:', err);
      setErrored(true);
      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const mediaError = e.currentTarget.error;

    // mediaError.code values:
    // 1 = MEDIA_ERR_ABORTED
    // 2 = MEDIA_ERR_NETWORK
    // 3 = MEDIA_ERR_DECODE
    // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
    console.error('[AUDIO] Media Element Error:', {
      code: mediaError?.code,
      message: mediaError?.message,
    });

    setErrored(true);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playSong = (song: SongBasic) => {
    setErrored(false);

    if (currentSong?.id === song.id) {
      safePlay();
      return;
    }

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 0);
    hasLoggedStream.current = false;

    const foundIndex = queueList.findIndex((item) => item.id === song.id);
    if (foundIndex !== -1) {
      setCurrentIndex(foundIndex);
    }
  };

  const playNext = useCallback(() => {
    if (hasErrored) return;

    if (queueList.length > 0 && currentIndex + 1 < queueList.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playSong(queueList[nextIndex]);
    } else {
      setIsPlaying(false);
    }
  }, [queueList, currentIndex, hasErrored]);

  const playPrevious = () => {
    if (hasErrored) return;

    // restart track if 5+ seconds were played
    if (currentTime > 5) {
      skipTo(0);
      return;
    }

    if (queueList.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queueList[prevIndex]);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong || hasErrored) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      safePlay();
    }
  };

  const skipTo = (time: number) => {
    if (audioRef.current && !hasErrored) {
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
    if (!audioRef.current || hasErrored) return;

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

  const handleEnded = () => {
    setIsPlaying(false);
    if (hasErrored) return;
    playNext();
  };

  const queue = {
    list: queueList,
    currentIndex,
    skipTo: (idx: number, play: boolean = false) => {
      if (idx < 0 || idx >= queueList.length) return;

      setCurrentIndex(idx);
      if (play) playSong(queueList[idx]);
    },
    load: (songs: SongBasic[], autoPlay = true) => {
      setErrored(false);
      setQueueList(songs);

      if (songs.length > 0) {
        setCurrentIndex(0);
        if (autoPlay) {
          playSong(songs[0]);
        }
      } else {
        setCurrentIndex(-1);
        setCurrentSong(null);
      }
    },

    add: (songOrSongs: SongBasic | SongBasic[]) => {
      const newItems = Array.isArray(songOrSongs) ? songOrSongs : [songOrSongs];

      setQueueList((prev) => {
        const updated = [...prev, ...newItems];

        // If queue was previously empty and nothing is playing, start playback
        if (prev.length === 0 && !currentSong && newItems.length > 0) {
          setCurrentIndex(0);
          playSong(newItems[0]);
        }
        return updated;
      });
    },

    remove: (index: number) => {
      if (index < 0 || index >= queueList.length) return;

      setQueueList((prev) => prev.filter((_, i) => i !== index));

      if (index < currentIndex) {
        setCurrentIndex((prev) => prev - 1);
      } else if (index === currentIndex) {
        if (queueList.length > 1) {
          const nextIndex = index < queueList.length - 1 ? index : 0;
          setCurrentIndex(nextIndex);
          playSong(queueList[nextIndex]);
        } else {
          setCurrentIndex(-1);
          setCurrentSong(null);
        }
      }
    },

    clear: () => {
      setQueueList([]);
      setCurrentIndex(-1);
    },
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  useEffect(() => {
    if (currentSong && audioRef.current && !hasErrored) {
      safePlay();
    }
  }, [currentSong]);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        hasErrored,
        playSong,
        playNext,
        playPrevious,
        togglePlayPause,
        skipTo,
        setVolume,
        toggleMute,
        queue,
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
        onPlay={() => {
          if (!hasErrored) setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={handleAudioError}
      />
    </AudioContext.Provider>
  );
};
