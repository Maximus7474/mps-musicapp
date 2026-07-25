import { useState } from 'react';
import { HeartIcon, Pause, Play, PlayOff } from 'lucide-react';
import { fetchNui } from '../utils/fetchNui';
import { Image } from './ImageFallback';
import { useNuiEvent } from '../hooks/useNuiEvent';

import type { BasicResponse, SongBasic } from '@common/types';

import './NowPlaying.scss';

export const NowPlayingBar = () => {
  const [song, setSong] = useState<SongBasic | null>(null);
  const [playing, setPlaying] = useState(true);

  const likeSong = async (id: SongBasic['id'], state: SongBasic['liked']) => {
    if (!song) return;

    const result = await fetchNui<BasicResponse>('musicapp:likesong', { id, state }, { success: true });

    if (result.success) {
      setSong((prev) => ({ ...prev!, liked: state }));
    } else {
      sendNotification({
        title: 'Unable to like song',
        content: result.message,
      });
    }
  };

  useNuiEvent<{ song: SongBasic | null; play?: boolean }>('musicapp:setplaying', ({ song, play = null }) => {
    setSong(song);
    if (typeof play === 'boolean') setPlaying(play);
  });

  return (
    <div className={`now-playing-bar ${!song ? 'is-empty' : ''}`}>
      {song && <Image src={song.image} alt={song.name} className='album-art' fallbackLabel='' />}

      <div className='track-info'>
        <p className='track-title'>{song ? song.name : 'Nothing playing'}</p>
        <p className='artist-name'>{song ? song.author : 'Select a song to start'}</p>

        <div className='progress-bar-container'>
          <div className='progress-bar-fill' style={{ width: song ? undefined : '0%' }} />
        </div>
      </div>

      <div className='bar-actions'>
        <button
          onClick={() => setPlaying(!playing)}
          disabled={!song}
          className='play-pause-btn'
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {song ? playing ? <Pause size={16} /> : <Play size={16} /> : <PlayOff size={16} />}
        </button>

        <button
          onClick={() => song && likeSong(song.id, song.liked)}
          disabled={!song}
          className={`like-btn ${song?.liked ? 'liked' : ''}`}
          aria-label='Like track'
        >
          <HeartIcon size={20} fill={song?.liked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};
