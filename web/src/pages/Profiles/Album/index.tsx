import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchNui } from '~/utils/fetchNui';
import type { AlbumBasic } from '@common/types';
import { ChevronLeft, HeartIcon, Play, PlayIcon, ShareIcon, ShuffleIcon } from 'lucide-react';
import { MOCK_ALBUMS } from '~/mockdata';
import { Image } from '~/components/ImageFallback';
import { formatTime } from '~/utils/utils';
import { useAudioPlayer } from '~/hooks/useAudioPlayer';
import { useSongLike } from '~/hooks/useSongLike';
import { LoadingPage, NotFoundPage } from '~/components/StatusPages';

export const AlbumPage: React.FC = () => {
  const { playSong } = useAudioPlayer();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const albumId = searchParams.get('albumId');

  const [loading, setLoading] = useState<boolean>(true);
  const [album, setAlbum] = useState<AlbumBasic | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { toggleLike } = useSongLike((songId, liked) => {
    setAlbum((prev) => {
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

  useEffect(() => {
    async function loadAlbum() {
      if (!albumId) return;
      try {
        const data = await fetchNui<AlbumBasic>(
          'musicapp:fetchalbum',
          { id: albumId },
          MOCK_ALBUMS.find((a) => a.id === albumId) || MOCK_ALBUMS[0],
        );
        if (data) {
          setAlbum(data);
        }
      } catch (error) {
        console.error('Failed to fetch album data', error);
      } finally {
        setLoading(false);
      }
    }
    loadAlbum();
  }, [albumId]);

  if (albumId && loading) return <LoadingPage text='Loading album' />;
  if (!album) return <NotFoundPage text='Album does not exist' />;

  const authorName = typeof album.author === 'string' ? 'Various Artists' : album.author.name;

  const handleArtistClick = () => {
    if (typeof album.author === 'object' && album.author.id) {
      navigate(`/artist?artistId=${album.author.id}`);
    }
  };

  return (
    <div className='page-container' ref={scrollRef}>
      <div className='artist-hero'>
        <Image src={album.image || ''} alt={album.name} className='hero-image' />
        <div className='hero-overlay' />

        <button onClick={() => navigate(-1)} className='icon-button top-left'>
          <ChevronLeft color='white' />
        </button>
        <button className='icon-button top-right'>
          <ShareIcon color='white' />
        </button>

        <div className='hero-content'>
          <div>
            <h1 className='hero-title'>{album.name}</h1>

            <div className='album-author-row'>
              {typeof album.author === 'object' ? (
                <span className='badge-text'>{authorName}</span>
              ) : (
                <button
                  onClick={handleArtistClick}
                  className='artist-link-button'
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-secondary, #ccc)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '1rem',
                  }}
                >
                  {authorName}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='stats-card-group'>
        <div className='stat-box'>
          <div className='value'>{album.year || '—'}</div>
          <div className='label'>Released</div>
        </div>
        <div className='stat-box'>
          <div className='value'>{album.tracks ? album.tracks.length : 0}</div>
          <div className='label'>Tracks</div>
        </div>
      </div>

      <div className='action-row'>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`btn-follow ${isSaved ? 'following' : 'not-following'}`}
        >
          {isSaved ? 'Saved to Library' : 'Save Album'}
        </button>
      </div>

      <div className='play-shuffle-row'>
        <button className='btn-primary'>
          <PlayIcon /> Play
        </button>
        <button className='btn-secondary'>
          <ShuffleIcon /> Shuffle
        </button>
      </div>

      <div className='content-sections'>
        {album.tracks && album.tracks.length > 0 ? (
          <div className='track-list'>
            {album.tracks.map((t, i) => (
              <button key={t.id || t.name} onClick={() => playSong(t)} className='song-list-item'>
                <span className='index'>{i + 1}</span>
                <button className='cover-button' onClick={() => playSong(t)}>
                  <Image src={t.image} alt={t.name} className='cover' />
                  <div className='play-overlay'>
                    <Play size={18} fill='currentColor' />
                  </div>
                </button>
                <div className='details'>
                  <p className='title'>{t.name}</p>
                  <p className='meta'>{t.author}</p>
                </div>
                <span className='duration'>{t.duration ? formatTime(t.duration) : '—'}</span>
                <button
                  onClick={(e) => handleActionClick(e, () => toggleLike(t.id, t.liked))}
                  className={`like-button ${t.liked ? 'liked' : ''}`}
                >
                  <HeartIcon fill={t.liked ? 'currentColor' : 'transparent'} />
                </button>
              </button>
            ))}
          </div>
        ) : (
          <p className='about-text'>No tracks available in this album.</p>
        )}
      </div>
    </div>
  );
};
