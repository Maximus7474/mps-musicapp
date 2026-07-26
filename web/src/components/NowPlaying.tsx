import { useEffect, useState } from 'react';
import { HeartIcon, Pause, Play, PlayOff } from 'lucide-react';
import { fetchNui } from '../utils/fetchNui';
import { Image } from './ImageFallback';
import { useAudioPlayer } from '../hooks/useAudio';

import type { BasicResponse } from '@common/types';

import './NowPlaying.scss';

export const NowPlayingBar = () => {
  const { currentSong, isPlaying, currentTime, duration, togglePlayPause } = useAudioPlayer();
  const [isLiked, setIsLiked] = useState(false);

  const likeSong = async () => {
    if (!currentSong) return;
    const newState = currentSong.liked;

    const result = await fetchNui<BasicResponse>(
      'musicapp:likesong',
      { id: currentSong.id, state: newState },
      { success: true },
    );

    if (result.success) {
      setIsLiked(newState);
    } else {
      sendNotification({
        title: 'Unable to like song',
        content: result.message,
      });
    }
  };

  useEffect(() => {
    setIsLiked(currentSong?.liked ?? false);
  }, [currentSong]);

  const safeCurrentTime = currentTime ?? 0;
  const safeDuration = duration ?? 0;
  const progressPercent = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;

  return (
    <div className={`now-playing-bar ${!currentSong ? 'is-empty' : ''}`}>
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
          onClick={togglePlayPause}
          disabled={!currentSong}
          className='play-pause-btn'
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {currentSong ? isPlaying ? <Pause size={16} /> : <Play size={16} /> : <PlayOff size={16} />}
        </button>

        <button
          onClick={() => currentSong && likeSong()}
          disabled={!currentSong}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          aria-label='Like track'
        >
          <HeartIcon size={20} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};
