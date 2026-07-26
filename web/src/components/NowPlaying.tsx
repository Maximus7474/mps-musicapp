import { useState, useEffect } from 'react';
import { Play, Pause, PlayOff, HeartIcon, ChevronDown, VolumeX, Volume2, CloudAlert } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/utils';
import { fetchNui } from '../utils/fetchNui';
import type { BasicResponse, SongBasic } from '@common/types';
import { Image } from './ImageFallback';

import './NowPlaying.scss';

export const NowPlayingBar = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    skipTo,
    toggleMute,
    volume,
    setVolume,
    hasErrored,
  } = useAudioPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsLiked(currentSong?.liked ?? false);
  }, [currentSong]);

  useEffect(() => {
    if (!currentSong) setIsExpanded(false);
  }, [currentSong]);

  const likeSong = async (id: SongBasic['id'], newState: boolean) => {
    if (!currentSong) return;
    const result = await fetchNui<BasicResponse>('musicapp:likesong', { id, state: newState }, { success: true });
    if (result.success) {
      setIsLiked(newState);
    } else {
      sendNotification({ title: 'Unable to like song', content: result.message });
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const safeCurrentTime = currentTime ?? 0;
  const safeDuration = duration ?? 0;
  const progressPercent = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;
  const volumePercent = `${volume * 100}%`;

  if (isExpanded) {
    return (
      <div className='now-playing-fullscreen'>
        <div className='fullscreen-header'>
          <button className='close-btn' onClick={() => setIsExpanded(false)}>
            <ChevronDown size={28} />
          </button>
          <span>Now Playing</span>
          <div style={{ width: 28 }} />
        </div>

        <div className='fullscreen-art'>
          <Image src={currentSong?.image} alt={currentSong?.name} className='large-cover' fallbackLabel='' />
        </div>

        <div className='fullscreen-info'>
          <div className='text-wrapper'>
            <h2 className='title'>{currentSong?.name}</h2>
            <p className='artist'>{currentSong?.author}</p>
          </div>
          <button
            onClick={() => currentSong && likeSong(currentSong.id, !isLiked)}
            className={`fullscreen-like ${isLiked ? 'liked' : ''}`}
          >
            <HeartIcon size={28} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className='fullscreen-progress'>
          <input
            type='range'
            min={0}
            max={safeDuration || 100}
            value={safeCurrentTime}
            onChange={(e) => skipTo(Number(e.target.value))}
            className='scrubber'
            style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
          />
          <div className='time-labels'>
            <span>{formatTime(safeCurrentTime)}</span>
            <span>{formatTime(safeDuration)}</span>
          </div>
        </div>

        <div className='fullscreen-volume'>
          <button className='mute-btn' onClick={toggleMute}>
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type='range'
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className='volume-slider'
            style={{ '--volume': volumePercent } as React.CSSProperties}
          />
        </div>

        <div className='fullscreen-controls'>
          <button onClick={togglePlayPause} className='play-pause-btn large'>
            {hasErrored ? (
              <CloudAlert size={32} />
            ) : isPlaying ? (
              <Pause size={32} />
            ) : (
              <Play size={32} />
            )}
          </button>
        </div>

        {hasErrored && <p className='playback-error'>An error occured when initiating playback of the song.</p>}
      </div>
    );
  }

  return (
    <div
      className={`now-playing-bar ${!currentSong ? 'is-empty' : ''}`}
      onClick={() => currentSong && setIsExpanded(true)}
    >
      {currentSong && <Image src={currentSong.image} alt={currentSong.name} className='album-art' fallbackLabel='' />}

      <div className='track-info'>
        <p className='track-title'>{currentSong ? currentSong.name : 'Nothing playing'}</p>
        <p className='artist-name'>{currentSong ? currentSong.author : 'Select a song to start'}</p>

        <div className='progress-bar-container'>
          <div className='progress-bar-fill' style={{ width: currentSong ? `${progressPercent}%` : '0%' }} />
        </div>
      </div>

      <div className='bar-actions'>
        <button
          onClick={(e) => handleActionClick(e, togglePlayPause)}
          disabled={!currentSong || hasErrored}
          className='play-pause-btn'
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {!currentSong ? (
            <PlayOff size={16} />
          ) : hasErrored ? (
            <CloudAlert size={16} />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>

        <button
          onClick={(e) => handleActionClick(e, () => currentSong && likeSong(currentSong.id, !isLiked))}
          disabled={!currentSong || hasErrored}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          aria-label='Like track'
        >
          <HeartIcon size={20} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};
