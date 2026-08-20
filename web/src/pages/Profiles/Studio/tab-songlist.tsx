import { Music, Edit3, Trash2, Play } from 'lucide-react';
import { Image } from '~/components/ImageFallback';
import { formatTime } from '~/utils/utils';
import type { SongListTabProps } from './types';

export const SongListTab = ({ songs, onPlay, onEdit, onDelete, onUpload }: SongListTabProps) => {
  return (
    <div className='content-sections'>
      {songs.length > 0 ? (
        <div className='track-list'>
          {songs.map((song) => (
            <div key={song.id} className='song-list-item studio-track-item'>
              <div className='cover-button' onClick={() => onPlay(song)}>
                <Image src={song.image || ''} alt={song.name} className='cover' />
                <div className='play-overlay'>
                  <Play size={18} fill='currentColor' />
                </div>
              </div>

              <div className='details'>
                <p className='title'>{song.name}</p>
                <p className='meta'>{song.author}</p>
              </div>

              <span className='duration'>{song.duration ? formatTime(song.duration) : '—'}</span>

              <div className='action-buttons'>
                <button className='icon-button-sm' onClick={() => onEdit(song)} title='Edit Track'>
                  <Edit3 size={16} />
                </button>
                <button className='icon-button-sm delete' onClick={() => onDelete(song.id)} title='Delete Track'>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='empty-state'>
          <Music size={36} />
          <p>No songs published yet.</p>
          <button className='btn-primary' onClick={onUpload}>
            Upload First Song
          </button>
        </div>
      )}
    </div>
  );
};
