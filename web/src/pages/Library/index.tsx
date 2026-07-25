import { HeartIcon, Library, MoreHorizontal, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchNui } from '../../utils/fetchNui';
import { generateGradient } from '../../utils/utils';
import { Image } from '../../components/ImageFallback';
import type { ArtistBasic, PlaylistBasic } from '@common/types';
import { MOCK_ARTISTS, MOCK_PLAYLISTS } from '../../mockdata';

export function LibraryPage() {
  const [tab, setTab] = useState<'playlists' | 'artists'>('playlists');
  const [artists, setArtists] = useState<ArtistBasic[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistBasic[]>([]);

  useEffect(() => {
    fetchNui<{ artists: ArtistBasic[]; playlists: PlaylistBasic[] }>(
      'musicapp:fetchlibrary',
      {},
      {
        artists: MOCK_ARTISTS,
        playlists: MOCK_PLAYLISTS,
      },
    ).then((data) => {
      setArtists(data.artists);
      setPlaylists(data.playlists);
    });
  }, []);

  return (
    <div className='page-container'>
      <div className='page-header'>
        <h1 className='title'>Your Library</h1>
        <button className='icon-button'>
          <Library />
        </button>
      </div>

      <div className='segmented-tab-switch'>
        {(['playlists', 'artists'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'playlists' && (
        <div>
          {playlists.map((p) => (
            <div key={p.id} className='song-list-item'>
              {p.image ? (
                <div className='cover' style={{ background: `linear-gradient(${generateGradient(p.id)})` }}>
                  <Image src={p.image} alt={p.title} style={{ objectFit: 'contain', padding: 2 }} />
                </div>
              ) : (
                <div className='cover icon' style={{ background: `linear-gradient(${generateGradient(p.id)})` }}>
                  <Music size={28} />
                </div>
              )}
              <div className='details'>
                <p className='title'>{p.title}</p>
                <p className='meta'>Playlist · {p.tracks} songs</p>
              </div>
              <button className='like-button'>
                <MoreHorizontal />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'artists' && (
        <div>
          {artists.map((a) => (
            <div key={a.id} className='song-list-item'>
              <Image src={a.image} alt={a.name} className='cover' style={{ borderRadius: '50%' }} />
              <div className='details'>
                <p className='title'>{a.name}</p>
                <p className='meta'>
                  {a.genre} · {a.followers} followers
                </p>
              </div>
              <button className='like-button liked'>
                <HeartIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
