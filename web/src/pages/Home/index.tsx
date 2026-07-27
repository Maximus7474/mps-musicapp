import { HeartIcon, HeartPlusIcon, Play, PlayIcon, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionHeader } from '~/components/SectionHeader';
import { fetchNui } from '~/utils/fetchNui';
import { Image } from '~/components/ImageFallback';
import type { ArtistBasic, BasicResponse, PlaylistBasic, SongBasic } from '@common/types';
import { MOCK_SONGS, MOCK_ARTISTS, MOCK_PLAYLISTS } from '~/mockdata/index';
import { useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '~/hooks/useAudioPlayer';
import { useSongLike } from '~/hooks/useSongLike';

export function HomePage() {
  const navigate = useNavigate();
  const audioPlayer = useAudioPlayer();
  const [latestSongs, setLatestSongs] = useState<SongBasic[]>([]);
  const [recentArtists, setRecentArtists] = useState<ArtistBasic[]>([]);
  const [recentPlaylists, setRecentPlaylists] = useState<PlaylistBasic[]>([]);

  const { toggleLike } = useSongLike((songId, liked) => {
    setLatestSongs((prev) => prev.map((song) => (song.id === songId ? { ...song, liked } : song)));
  });

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
            <button key={a.id} onClick={() => navigate(`/artist?artistId=${a.id}`)} className='artist-avatar-card'>
              <div className='avatar-ring'>
                <Image src={a.image} alt={a.name} />
              </div>
              <p className='artist-name'>{a.name}</p>
            </button>
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
              <button className='cover-button' onClick={() => audioPlayer.playSong(s)}>
                <Image src={s.image} alt={s.name} className='cover' />
                <div className='play-overlay'>
                  <Play size={18} fill='currentColor' />
                </div>
              </button>
              <div className='details'>
                <p className='title'>{s.name}</p>
                <p className='meta'>{s.author}</p>
              </div>
              <p className='duration'>{s.duration}</p>
              <button onClick={() => toggleLike(s.id, s.liked)} className={`like-button ${s.liked ? 'liked' : ''}`}>
                {s.liked ? <HeartIcon /> : <HeartPlusIcon />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
