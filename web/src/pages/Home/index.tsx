import { HeartIcon, HeartPlusIcon, PlayIcon, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionHeader } from '../../components/SectionHeader';
import { fetchNui } from '../../utils/fetchNui';
import { Image } from '../../components/ImageFallback';
import type { ArtistBasic, BasicResponse, PlaylistBasic, SongBasic } from '@common/types';
import { MOCK_SONGS, MOCK_ARTISTS, MOCK_PLAYLISTS } from '../../mockdata/index';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const [latestSongs, setLatestSongs] = useState<SongBasic[]>([]);
  const [recentArtists, setRecentArtists] = useState<ArtistBasic[]>([]);
  const [recentPlaylists, setRecentPlaylists] = useState<PlaylistBasic[]>([]);

  const likeSong = async (id: SongBasic['id'], state: SongBasic['liked']) => {
    const idx = latestSongs.findIndex((s) => s.id === id);
    if (idx === -1) return;

    const result = await fetchNui<BasicResponse>('musicapp:likesong', { id, state }, { success: true });

    if (result.success) {
      setLatestSongs((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], liked: state };
        return list;
      });
    } else {
      sendNotification({
        title: 'Unable to like song',
        content: result.message,
      });
    }
  };

  useEffect(() => {
    fetchNui<{
      latestsongs: SongBasic[];
      recentartists: ArtistBasic[];
      recentplaylists: PlaylistBasic[];
    }>(
      'musicapp:homescreendata',
      {},
      {
        latestsongs: MOCK_SONGS,
        recentartists: MOCK_ARTISTS,
        recentplaylists: MOCK_PLAYLISTS.slice(3),
      },
    ).then((data) => {
      setLatestSongs(data.latestsongs);
      setRecentArtists(data.recentartists);
      setRecentPlaylists(data.recentplaylists);
    });
  }, []);

  return (
    <div className='page-container'>
      <div className='page-header'>
        <div>
          <h1 className='title'>Welcome back</h1>
        </div>
        <button className='icon-button'>
          <UserCircle2 className='icon' />
        </button>
      </div>

      {/* playlists */}
      <div>
        <SectionHeader
          title='Recent Playlists'
          action='See all'
          onActionClick={() => navigate('/library?tab=playlists')}
        />
        <div className='horizontal-scroll-list'>
          {recentPlaylists.map((p) => (
            <div key={p.id} className='playlist-card'>
              <div className='image-wrapper'>
                <Image src={p.image} alt={p.title} />
                <div className='overlay'>
                  <button className='play-btn'>
                    <PlayIcon />
                  </button>
                </div>
              </div>
              <p className='playlist-title'>{p.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* recent artists */}
      <div>
        <SectionHeader title='Listening To' action='See all' onActionClick={() => navigate('/library?tab=artists')} />
        <div className='horizontal-scroll-list artists'>
          {recentArtists.map((a) => (
            <div key={a.id} className='artist-avatar-card'>
              <div className='avatar-ring'>
                <Image src={a.image} alt={a.name} />
              </div>
              <p className='artist-name'>{a.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* new additions to the platform */}
      <div>
        <SectionHeader title='Latest Added' action='See all' />
        <div>
          {latestSongs.map((s, i) => (
            <div key={s.id} className='song-list-item'>
              <span className='index'>{i + 1}</span>
              <Image src={s.image} alt={s.name} className='cover' />
              <div className='details'>
                <p className='title'>{s.name}</p>
                <p className='meta'>{s.author}</p>
              </div>
              <p className='duration'>{s.duration}</p>
              <button onClick={() => likeSong(s.id, !s.liked)} className={`like-button ${s.liked ? 'liked' : ''}`}>
                {s.liked ? <HeartIcon /> : <HeartPlusIcon />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
