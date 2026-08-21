import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { fetchNui } from '~/utils/fetchNui';
import { useAudioPlayer } from '~/hooks/useAudioPlayer';
import type { SongBasic, AlbumBasic } from '@common/types';
import { MOCK_STUDIO_ALBUMS, MOCK_STUDIO_SONGS } from '~/mockdata/studio';
import { SongListTab } from './tab-songlist';
import { SongEditorTab } from './tab-songeditor';
import { AlbumListTab } from './tab-albumlist';
import { MetricsTab } from './tab-metrics';
import type { SongFormPayload } from './types';

type TabType = 'songs' | 'albums' | 'add' | 'metrics';

interface ArtistStudioPageProps {
  onBack?: () => void;
}

export const ArtistStudioPage: React.FC<ArtistStudioPageProps> = ({ onBack }) => {
  const { playSong } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<TabType>('songs');

  // Track & Album States
  const [songs, setSongs] = useState<SongBasic[]>([]);
  const [editingSong, setEditingSong] = useState<SongBasic | null>(null);

  const [albums, setAlbums] = useState<AlbumBasic[]>([]);

  // Fetch initial content
  useEffect(() => {
    async function loadArtistData() {
      try {
        const fetchedSongs = await fetchNui<SongBasic[]>('musicapp:getArtistSongs', {}, MOCK_STUDIO_SONGS);
        setSongs(fetchedSongs);
      } catch (err) {
        console.error('Failed to load artist data', err);
      }
    }
    loadArtistData();
  }, []);

  useEffect(() => {
    async function loadAlbums() {
      const data = await fetchNui<AlbumBasic[]>('musicapp:getArtistAlbums', {}, MOCK_STUDIO_ALBUMS);
      setAlbums(data);
    }
    loadAlbums();
  }, []);

  const startEditingSong = (song: SongBasic) => {
    setEditingSong(song);
    setActiveTab('add');
  };

  const handleSaveSong = async (payload: SongFormPayload) => {
    if (!payload.name || !payload.url) return;

    if (payload.id && editingSong) {
      // Update Song
      const updated = await fetchNui<SongBasic>('musicapp:updateSong', payload, {
        ...editingSong,
        ...payload,
      });

      setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      // Add New Single Song
      const newSong = await fetchNui<SongBasic>('musicapp:addSong', payload, {
        id: Date.now(),
        liked: false,
        ...payload,
      });

      setSongs((prev) => [newSong, ...prev]);
    }

    setEditingSong(null);
    setActiveTab('songs');
  };

  const handleDeleteSong = async (songId: number) => {
    await fetchNui('musicapp:deleteSong', { id: songId }, true);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handleSaveAlbum = (savedAlbum: AlbumBasic) => {
    setAlbums((prev) =>
      prev.some((a) => a.id === savedAlbum.id)
        ? prev.map((a) => (a.id === savedAlbum.id ? savedAlbum : a))
        : [savedAlbum, ...prev],
    );
  };

  const handleDeleteAlbum = async (albumId: string | number) => {
    await fetchNui('musicapp:deleteAlbum', { id: albumId }, true);
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  };

  return (
    <div className='page-container no-dock studio-page'>
      <div className='page-header'>
        {onBack && (
          <button className='icon-button' onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <span className='greeting-label'>Creator Suite</span>
          <h1 className='title'>Artist Studio</h1>
        </div>
      </div>

      <div className='segmented-tab-switch'>
        <button className={activeTab === 'songs' ? 'active' : ''} onClick={() => setActiveTab('songs')}>
          Songs
        </button>
        <button className={activeTab === 'albums' ? 'active' : ''} onClick={() => setActiveTab('albums')}>
          Albums
        </button>
        <button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>
          + Single
        </button>
        <button className={activeTab === 'metrics' ? 'active' : ''} onClick={() => setActiveTab('metrics')}>
          Metrics
        </button>
      </div>

      {activeTab === 'songs' && (
        <SongListTab
          songs={songs}
          onPlay={playSong}
          onEdit={startEditingSong}
          onDelete={handleDeleteSong}
          onUpload={() => setActiveTab('add')}
        />
      )}

      {activeTab === 'albums' && (
        <AlbumListTab albums={albums} songs={songs} onSaveAlbum={handleSaveAlbum} onDeleteAlbum={handleDeleteAlbum} />
      )}

      {activeTab === 'add' && (
        <SongEditorTab
          editingSong={editingSong}
          onCancel={() => {
            setEditingSong(null);
            setActiveTab('songs');
          }}
          onSave={handleSaveSong}
        />
      )}

      {activeTab === 'metrics' && <MetricsTab />}
    </div>
  );
};
