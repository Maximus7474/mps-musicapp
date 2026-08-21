import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Check, Disc, Music, GripVertical } from 'lucide-react';
import { fetchNui } from '~/utils/fetchNui';
import { Image } from '~/components/ImageFallback';
import { useUser } from '~/hooks/useUser';
import type { SongBasic, AlbumBasic, SaveAlbumPayload } from '@common/types';

interface AlbumEditorProps {
  albumToEdit?: AlbumBasic | null;
  availableSongs: SongBasic[]; // Artist's existing uploaded tracks
  onSave: (savedAlbum: AlbumBasic) => void;
  onCancel: () => void;
}

export const AlbumEditor: React.FC<AlbumEditorProps> = ({ albumToEdit, availableSongs, onSave, onCancel }) => {
  const { user } = useUser();
  const [name, setName] = useState(albumToEdit?.name || '');
  const [image, setImage] = useState(albumToEdit?.image || '');
  const [year, setYear] = useState<string>(albumToEdit?.year || new Date().getFullYear().toString());
  const [albumTracks, setAlbumTracks] = useState<SongBasic[]>(albumToEdit?.tracks || []);
  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add an existing song from user's library into this album
  const handleAddExistingSong = () => {
    if (!selectedSongId) return;
    const songToAdd = availableSongs.find((s) => String(s.id) === selectedSongId);

    // Prevent duplicate additions
    if (songToAdd && !albumTracks.some((t) => t.id === songToAdd.id)) {
      setAlbumTracks((prev) => [...prev, songToAdd]);
      setSelectedSongId('');
    }
  };

  // Remove track from album payload
  const handleRemoveTrack = (index: number) => {
    setAlbumTracks((prev) => prev.filter((_, i) => i !== index));
  };

  // Move track order up/down
  const handleMoveTrack = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= albumTracks.length) return;
    const updated = [...albumTracks];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setAlbumTracks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) return;

    setIsSubmitting(true);

    // id is only sent for updates
    const payload: SaveAlbumPayload = {
      id: albumToEdit?.id,
      name,
      image,
      year: year.toString(),
      tracks: albumTracks,
    };

    try {
      const savedAlbum = await fetchNui<AlbumBasic>(
        albumToEdit ? 'musicapp:updateAlbum' : 'musicapp:createAlbum',
        payload,
        {
          // Dev-mode mock: the server would attribute the id and author.
          id: albumToEdit?.id || `alb-${Date.now()}`,
          name: payload.name,
          image: payload.image,
          year: payload.year.toString(),
          author:
            albumToEdit?.author ||
            (user?.kind === 'artist'
              ? { id: user.artistId, name: user.username }
              : { id: 0, name: user?.kind === 'user' ? user.username : 'Artist' }),
          tracks: payload.tracks,
        },
      );

      onSave(savedAlbum);
    } catch (err) {
      console.error('Failed to save album:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='studio-form-card album-editor-card'>
      <div className='form-header'>
        <button type='button' className='btn-primary' onClick={onCancel}>
          <ChevronLeft size={18} />
        </button>
        <h3 style={{ margin: 0 }}>{albumToEdit ? 'Edit Album' : 'Create New Album'}</h3>
      </div>

      <div className='form-group'>
        <label>Album Title *</label>
        <div className='search-input-box'>
          <input
            type='text'
            placeholder='e.g. After Hours'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className='form-group-row'>
        <div className='form-group flex-2'>
          <label>Cover Artwork URL *</label>
          <div className='search-input-box'>
            <input
              type='url'
              placeholder='https://...'
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </div>
        </div>
        <div className='form-group flex-1'>
          <label>Year</label>
          <div className='search-input-box'>
            <input type='number' value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Artwork Preview */}
      {image && (
        <div className='album-preview-box'>
          <Image src={image} alt='Preview' className='preview-cover' />
          <span>Cover Preview</span>
        </div>
      )}

      {/* Tracks Selection Section */}
      <div className='album-tracks-manager'>
        <div className='section-title-row'>
          <h4>
            <Music size={16} /> Album Tracks ({albumTracks.length})
          </h4>
        </div>

        {/* Add existing song dropdown */}
        <div className='add-track-selector'>
          <div className='search-input-box flex-1'>
            <select value={selectedSongId} onChange={(e) => setSelectedSongId(e.target.value)} className='select-input'>
              <option value=''>-- Select song from library --</option>
              {availableSongs
                .filter((s) => !albumTracks.some((at) => at.id === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.author})
                  </option>
                ))}
            </select>
          </div>
          <button
            type='button'
            className='btn-secondary btn-sm'
            onClick={handleAddExistingSong}
            disabled={!selectedSongId}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Reorderable Track List */}
        <div className='album-track-list'>
          {albumTracks.map((track, index) => (
            <div key={track.id} className='album-track-item'>
              <span className='track-num'>{index + 1}</span>
              <div className='track-info'>
                <p className='title'>{track.name}</p>
              </div>
              <div className='reorder-btns'>
                <button
                  type='button'
                  className='step-btn'
                  disabled={index === 0}
                  onClick={() => handleMoveTrack(index, index - 1)}
                >
                  ▲
                </button>
                <button
                  type='button'
                  className='step-btn'
                  disabled={index === albumTracks.length - 1}
                  onClick={() => handleMoveTrack(index, index + 1)}
                >
                  ▼
                </button>
              </div>
              <button type='button' className='remove-btn' onClick={() => handleRemoveTrack(index)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {albumTracks.length === 0 && <p className='empty-subtext'>No tracks added to this album yet.</p>}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className='play-shuffle-row margin-top'>
        <button type='button' className='btn-secondary' onClick={onCancel}>
          Cancel
        </button>
        <button type='submit' className='btn-primary' disabled={isSubmitting}>
          <Check size={18} /> {albumToEdit ? 'Save Changes' : 'Create Album'}
        </button>
      </div>
    </form>
  );
};
