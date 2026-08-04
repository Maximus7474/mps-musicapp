import React from 'react';
import { Trash2, Music2, Volume2, X } from 'lucide-react';
import { useAudioPlayer } from '~/hooks/useAudioPlayer';
import { formatTime } from '~/utils/utils';
import { Image } from './ImageFallback';

import './QueueView.scss'

interface QueueViewProps {
  onClose: () => void;
}

export const QueueView: React.FC<QueueViewProps> = ({ onClose }) => {
  const { currentSong, isPlaying, playSong, queue } = useAudioPlayer();

  const handleTrackClick = (songIndex: number) => {
    const targetSong = queue.list[songIndex];
    if (targetSong) {
      playSong(targetSong);
    }
  };

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    queue.remove(index);
  };

  const upcomingTracks = queue.list.slice(queue.currentIndex + 1);

  return (
    <div className='queue-view-container'>
      <div className='queue-header'>
        <button className='icon-btn' onClick={onClose} aria-label='Close queue'>
          <X size={24} />
        </button>
        <h3>Play Queue</h3>
        {queue.list.length > 0 && (
          <button className='clear-btn' onClick={() => queue.clear()}>
            Clear
          </button>
        )}
      </div>

      <div className='queue-content'>
        {currentSong && (
          <div className='queue-section'>
            <span className='section-title'>Now Playing</span>
            <div className='queue-item active'>
              <div className='cover-wrapper'>
                <Image src={currentSong.image} alt={currentSong.name} className='cover' />
                {isPlaying && (
                  <div className='playing-indicator'>
                    <Volume2 size={16} />
                  </div>
                )}
              </div>
              <div className='details'>
                <p className='title'>{currentSong.name}</p>
                <p className='artist'>{currentSong.author}</p>
              </div>
              <span className='duration'>
                {currentSong.duration ? formatTime(currentSong.duration) : '—'}
              </span>
            </div>
          </div>
        )}

        <div className='queue-section'>
          <span className='section-title'>Up Next</span>
          {upcomingTracks.length > 0 ? (
            <div className='queue-list'>
              {upcomingTracks.map((track, relativeIndex) => {
                const absoluteIndex = queue.currentIndex + 1 + relativeIndex;
                return (
                  <div
                    key={`${track.id}-${absoluteIndex}`}
                    className='queue-item'
                    onClick={() => handleTrackClick(absoluteIndex)}
                  >
                    <span className='index-num'>{relativeIndex + 1}</span>
                    <Image src={track.image} alt={track.name} className='cover' />
                    <div className='details'>
                      <p className='title'>{track.name}</p>
                      <p className='artist'>{track.author}</p>
                    </div>
                    <span className='duration'>
                      {track.duration ? formatTime(track.duration) : '—'}
                    </span>
                    <button
                      className='remove-btn'
                      onClick={(e) => handleRemove(e, absoluteIndex)}
                      aria-label='Remove from queue'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='empty-queue'>
              <Music2 size={32} />
              <p>No upcoming tracks in queue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
