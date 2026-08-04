import React, { useEffect, useRef } from 'react';
import { Trash2, Music2, Volume2, X } from 'lucide-react';
import { useAudioPlayer } from '~/hooks/useAudioPlayer';
import { formatTime } from '~/utils/utils';
import { Image } from './ImageFallback';

import './QueueView.scss';

export const QueueView: React.FC = () => {
  const { isPlaying, clearSong, queue } = useAudioPlayer();
  const activeTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTrackRef.current) {
      activeTrackRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [queue.currentIndex]);

  const handleTrackClick = (songIndex: number) => {
    if (typeof queue.skipTo === 'function') {
      queue.skipTo(songIndex, true);
    }
  };

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    queue.remove(index);
  };

  const handleClear = () => {
    clearSong();
    queue.clear();
  };

  return (
    <div className='queue-view-container'>
      <div className='queue-header'>
        <h3>Play Queue</h3>
        {queue.list.length > 0 && (
          <button className='clear-btn' onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      <div className='queue-content'>
        {queue.list.length > 0 ? (
          <div className='queue-list'>
            {queue.list.map((track, index) => {
              const isActive = index === queue.currentIndex;

              return (
                <div
                  key={`${track.id}-${index}`}
                  ref={isActive ? activeTrackRef : null}
                  className={`queue-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTrackClick(index)}
                >
                  <span className='index-num'>{index + 1}</span>

                  <div className='cover-wrapper'>
                    <Image src={track.image} alt={track.name} className='cover' />
                    {isActive && isPlaying && (
                      <div className='playing-indicator'>
                        <Volume2 size={16} />
                      </div>
                    )}
                  </div>

                  <div className='details'>
                    <p className='title'>{track.name}</p>
                    <p className='artist'>{track.author}</p>
                  </div>

                  <span className='duration'>{track.duration ? formatTime(track.duration) : '—'}</span>

                  <button className='remove-btn' onClick={(e) => handleRemove(e, index)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='empty-queue'>
            <Music2 size={32} />
            <p>Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};
