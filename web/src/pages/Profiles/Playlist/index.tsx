import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchNui } from '~/utils/fetchNui';
import type { PlaylistBasic } from '@common/types';
import { ChevronLeft, HeartIcon, Play, PlayIcon, ShareIcon, ShuffleIcon } from 'lucide-react';
import { MOCK_PLAYLISTS } from '~/mockdata';
import { Image } from '~/components/ImageFallback';
import { formatTime, shuffle } from '~/utils/utils';
import { useAudioPlayer } from '~/hooks/useAudioPlayer';
import { useSongLike } from '~/hooks/useSongLike';
import { LoadingPage, NotFoundPage } from '~/components/StatusPages';

export const PlaylistPage: React.FC = () => {
  const { queue } = useAudioPlayer();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawPlaylistId = searchParams.get('playlistId');
  const playlistId = rawPlaylistId ? parseInt(rawPlaylistId) : null;

  const [loading, setLoading] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<PlaylistBasic | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { toggleLike } = useSongLike((songId, liked) => {
    setPlaylist((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        tracks: prev.tracks.map((song) => (song.id === songId ? { ...song, liked } : song)),
      };
    });
  });

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const loadPlaylist = (shuffleTracks: boolean = false, songId: number | false = false) => {
    if (!playlist) return;

    queue.load(playlist.tracks, songId === false, shuffleTracks);

    if (typeof songId === 'number') {
      const idx = playlist.tracks.findIndex((s) => s.id === songId);
      queue.skipTo(idx, true);
    }
  };

  useEffect(() => {
    async function loadPlaylist() {
      if (!playlistId) return;

      try {
        const data = await fetchNui<PlaylistBasic>(
          'musicapp:fetchplaylist',
          { id: playlistId },
          MOCK_PLAYLISTS?.find((p) => p.id === playlistId) || MOCK_PLAYLISTS?.[0],
        );
        if (data) {
          setPlaylist(data);
        }
      } catch (error) {
        console.error('Failed to fetch playlist data', error);
      } finally {
        setLoading(false);
      }
    }
    loadPlaylist();
  }, [playlistId]);

  if (playlistId && loading) return <LoadingPage text='Loading playlist' />;
  if (!playlist) return <NotFoundPage text='Playlist does not exist' />;

  return (
    <div className='page-container' ref={scrollRef}>
      <div className='artist-hero'>
        <Image src={playlist.image || ''} alt={playlist.title} className='hero-image' />
        <div className='hero-overlay' />

        <button onClick={() => navigate(-1)} className='icon-button top-left'>
          <ChevronLeft color='white' />
        </button>
        <button className='icon-button top-right'>
          <ShareIcon color='white' />
        </button>

        <div className='hero-content'>
          <div>
            <h1 className='hero-title'>{playlist.title}</h1>
          </div>
        </div>
      </div>

      <div className='stats-card-group'>
        <div className='stat-box'>
          <div className='value'>{playlist.tracks ? playlist.tracks.length : 0}</div>
          <div className='label'>Tracks</div>
        </div>
      </div>

      {/* Consider for future implementation, having public / private playlists
        <div className='action-row'>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`btn-follow ${isSaved ? 'following' : 'not-following'}`}
        >
          {isSaved ? 'Saved to Library' : 'Save Playlist'}
        </button>
      </div>*/}

      <div className='play-shuffle-row'>
        <button className='btn-primary' onClick={() => loadPlaylist()}>
          <PlayIcon /> Play
        </button>
        <button className='btn-secondary' onClick={() => loadPlaylist(true)}>
          <ShuffleIcon /> Shuffle
        </button>
      </div>

      <div className='content-sections'>
        {playlist.tracks && playlist.tracks.length > 0 ? (
          <div className='track-list'>
            {playlist.tracks.map((track, i) => (
              <div key={track.id || track.name} className='song-list-item'>
                <span className='index'>{i + 1}</span>

                <button
                  className='cover-button'
                  onClick={(e) => handleActionClick(e, () => loadPlaylist(false, track.id))}
                >
                  <Image src={track.image} alt={track.name} className='cover' />
                  <div className='play-overlay'>
                    <Play size={18} fill='currentColor' />
                  </div>
                </button>

                <div className='details'>
                  <p className='title'>{track.name}</p>
                  <p className='meta'>{track.author}</p>
                </div>

                <span className='duration'>{track.duration ? formatTime(track.duration) : '—'}</span>

                <button
                  onClick={(e) => handleActionClick(e, () => toggleLike(track.id, track.liked))}
                  className={`like-button ${track.liked ? 'liked' : ''}`}
                >
                  <HeartIcon fill={track.liked ? 'currentColor' : 'transparent'} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className='about-text'>No tracks available in this playlist.</p>
        )}
      </div>
    </div>
  );
};
