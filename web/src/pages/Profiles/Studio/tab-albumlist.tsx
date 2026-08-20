import { useState } from 'react';
import { Plus, Edit3, Trash2, Disc } from 'lucide-react';
import { Image } from '~/components/ImageFallback';
import type { AlbumBasic } from '@common/types';
import { AlbumEditor } from './albumeditor';
import type { AlbumListTabProps } from './types';

export const AlbumListTab = ({ albums, songs, onSaveAlbum, onDeleteAlbum }: AlbumListTabProps) => {
  // null = closed, 'new' = creating (server attributes id + author),
  // AlbumBasic = editing an existing album
  const [editingAlbum, setEditingAlbum] = useState<AlbumBasic | 'new' | null>(null);
  const editorOpen = editingAlbum !== null;

  return (
    <div className='content-sections'>
      {editorOpen ? (
        <AlbumEditor
          albumToEdit={editingAlbum === 'new' ? null : editingAlbum}
          availableSongs={songs}
          onCancel={() => setEditingAlbum(null)}
          onSave={(savedAlbum) => {
            onSaveAlbum(savedAlbum);
            setEditingAlbum(null);
          }}
        />
      ) : (
        <>
          <div className='tab-action-bar'>
            <button className='btn-primary' onClick={() => setEditingAlbum('new')}>
              <Plus size={16} /> New Album
            </button>
          </div>

          {albums.length > 0 ? (
            <div className='album-grid-portrait'>
              {albums.map((album) => (
                <div key={album.id} className='album-card-portrait'>
                  <Image src={album.image || ''} alt={album.name} className='cover' />
                  <div className='details'>
                    <p className='title'>{album.name}</p>
                    <p className='meta'>{album.year} • {album.tracks.length} Tracks</p>
                  </div>
                  <div className='card-actions'>
                    <button className='icon-button-sm' onClick={() => setEditingAlbum(album)}>
                      <Edit3 size={14} />
                    </button>
                    <button className='icon-button-sm delete' onClick={() => onDeleteAlbum(album.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='empty-state'>
              <Disc size={36} />
              <p>No albums published yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
