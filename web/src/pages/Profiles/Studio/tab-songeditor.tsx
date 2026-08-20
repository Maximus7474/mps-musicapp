import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import type { SongEditorTabProps } from './types';

export const SongEditorTab = ({ editingSong, onCancel, onSave }: SongEditorTabProps) => {
  const [songName, setSongName] = useState(editingSong?.name || '');
  const [songAuthor, setSongAuthor] = useState(editingSong?.author || '');
  const [songUrl, setSongUrl] = useState(editingSong?.url || '');
  const [songImage, setSongImage] = useState(editingSong?.image || '');
  const [songDuration, setSongDuration] = useState<number>(editingSong?.duration || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingSong?.id,
      name: songName,
      author: songAuthor,
      url: songUrl,
      image: songImage,
      duration: songDuration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='studio-form-card'>
      <div className='form-header'>
        <h3>{editingSong ? 'Edit Track' : 'Upload New Track'}</h3>
      </div>

      <div className='form-group'>
        <label>Track Title *</label>
        <div className='search-input-box'>
          <input
            type='text'
            placeholder='e.g. Gospel'
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className='form-group'>
        <label>Artist Name</label>
        <div className='search-input-box'>
          <input
            type='text'
            placeholder='e.g. Dr Dre'
            value={songAuthor}
            onChange={(e) => setSongAuthor(e.target.value)}
          />
        </div>
      </div>

      <div className='form-group'>
        <label>Audio Stream URL (.mp3 / .ogg) *</label>
        <div className='search-input-box'>
          <input
            type='url'
            placeholder='https://...'
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            required
          />
        </div>
      </div>

      <div className='form-group'>
        <label>Cover Image URL</label>
        <div className='search-input-box'>
          <input
            type='url'
            placeholder='https://...'
            value={songImage}
            onChange={(e) => setSongImage(e.target.value)}
          />
        </div>
      </div>

      <div className='form-group'>
        <label>Duration (Seconds)</label>
        <div className='search-input-box'>
          <input
            type='number'
            placeholder='210'
            value={songDuration || ''}
            onChange={(e) => setSongDuration(Number(e.target.value))}
          />
        </div>
      </div>

      <div className='play-shuffle-row margin-top'>
        <button type='button' className='btn-secondary' onClick={onCancel}>
          Cancel
        </button>
        <button type='submit' className='btn-primary'>
          <Check size={18} /> {editingSong ? 'Update Track' : 'Publish Song'}
        </button>
      </div>
    </form>
  );
};
