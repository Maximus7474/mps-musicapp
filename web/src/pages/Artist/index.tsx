import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchNui } from '../../utils/fetchNui';
import type { ArtistProfile } from '@common/types';
import { ChevronLeft, HeartIcon, MoreHorizontal, PlayIcon, ShareIcon, ShuffleIcon } from 'lucide-react';
import { MOCK_ARTIST_PROFILE } from '../../mockdata';
import { Image } from '../../components/ImageFallback';

// import "../styles/artist.scss";

export const ArtistPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('artistId');

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [followed, setFollowed] = useState(false);
  const [likedTrack, setLikedTrack] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'tracks' | 'albums' | 'about'>('tracks');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadArtist() {
      if (!artistId) return;
      try {
        const data = await fetchNui<ArtistProfile>(
          'musicapp:fetchartist',
          { id: Number(artistId) },
          MOCK_ARTIST_PROFILE,
        );
        if (data) {
          setArtist(data);
        }
      } catch (error) {
        console.error('Failed to fetch artist data', error);
      }
    }
    loadArtist();
  }, [artistId]);

  if (!artist) {
    return <div className='page-container'>Loading artist...</div>;
  }

  return (
    <div className='page-container' ref={scrollRef}>
      {/* Hero Header */}
      <div className='page-header'>
        <Image src={artist.image || ''} alt={artist.name} className='w-full h-full object-cover' />
        <div
          className='absolute inset-0'
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,1) 100%)',
          }}
        />
        <button onClick={() => navigate(-1)} className='absolute top-4 left-4 icon-button'>
          <ChevronLeft />
        </button>
        <button className='absolute top-4 right-4 icon-button'>
          <ShareIcon />
        </button>
        <div className='absolute bottom-3 left-4 right-4 flex items-end justify-between'>
          <div>
            <div className='flex items-center gap-1.5 mb-0.5'>
              <div className='w-4 h-4 rounded-full bg-[var(--color-brand)] flex items-center justify-center'>
                <svg width='8' height='8' viewBox='0 0 24 24' fill='white'>
                  <polyline
                    points='20 6 9 17 4 12'
                    strokeWidth='3'
                    stroke='white'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
              <span className='text-white/70 text-xs font-semibold'>Verified Artist</span>
            </div>
            <h1 className='text-white text-2xl font-extrabold leading-tight drop-shadow-lg'>{artist.name}</h1>
          </div>
        </div>
      </div>

      {/* Stats + Actions */}
      <div className='stats-card-group'>
        <div className='stat-box'>
          <div className='value'>{/* artist.monthly || */ '—'}</div>
          <div className='label'>Monthly listeners</div>
        </div>
        <div className='stat-box'>
          <div className='value'>{artist.followers ?? '—'}</div>
          <div className='label'>Followers</div>
        </div>
        <div className='stat-box'>
          <div className='value'>{artist.genre ?? 'Pop'}</div>
          <div className='label'>Genre</div>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <button
          onClick={() => setFollowed(!followed)}
          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
            followed
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-color)]'
              : 'bg-[var(--color-brand)] text-white border-transparent'
          }`}
        >
          {followed ? 'Following' : 'Follow'}
        </button>
        <button className='icon-button'>
          <MoreHorizontal />
        </button>
      </div>

      {/* Play / Shuffle row */}
      <div className='flex items-center gap-3'>
        <button className='flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm shadow-lg'>
          <PlayIcon /> Play
        </button>
        <button className='flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]'>
          <ShuffleIcon /> Shuffle
        </button>
      </div>

      {/* Section tabs */}
      <div className='segmented-tab-switch'>
        {(['tracks', 'albums', 'about'] as const).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={activeSection === s ? 'active' : ''}>
            {s}
          </button>
        ))}
      </div>

      <div className='space-y-6 pb-6'>
        {/* Top Tracks */}
        {activeSection === 'tracks' && artist.topTracks && (
          <div className='space-y-1'>
            {artist.topTracks.map((t, i) => (
              <div key={t.name} className='song-list-item'>
                <span className='index'>{i + 1}</span>
                <div className='cover'>
                  <Image src={artist.image || ''} alt={t.name} />
                </div>
                <div className='details'>
                  <p className='title'>{t.name}</p>
                  <p className='meta'>{"t.plays"} plays</p>
                </div>
                <span className='duration'>{t.duration}</span>
                <button
                  onClick={() => setLikedTrack(likedTrack === i ? null : i)}
                  className={`like-button ${likedTrack === i ? 'liked' : ''}`}
                >
                  <HeartIcon fill={likedTrack === i ? 'currentColor' : 'transparent'} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* albums */}
        {activeSection === 'albums' && artist.albums && (
          <div className='space-y-3'>
            {artist.albums.map((album) => (
              <div key={album.title} className='song-list-item'>
                <div className='cover'>
                  <img src={album.imgSuffix} alt={album.title} />
                </div>
                <div className='details'>
                  <p className='title'>{album.title}</p>
                  <p className='meta'>Album · {album.year}</p>
                </div>
                <button className='icon-button bg-[var(--color-brand)] text-white'>
                  <PlayIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {activeSection === 'about' && (
          <div className='space-y-5'>
            <div className='rounded-2xl overflow-hidden h-44'>
              <img src={artist.image || ''} alt={artist.name} className='w-full h-full object-cover' />
            </div>
            <p className='text-sm leading-relaxed text-[var(--text-secondary)]'>
              {artist.bio || 'No biography available for this artist.'}
            </p>
          </div>
        )}

        {/* related artists */}
        {artist.related && artist.related.length > 0 && (
          <div>
            <p className='text-sm font-extrabold mb-3 text-[var(--text-primary)]'>Fans also like</p>
            <div className='horizontal-scroll-list artists'>
              {artist.related.map((ra) => (
                <button
                  key={ra.id}
                  onClick={() => navigate(`/artist?artistId=${ra.id}`)}
                  className='artist-avatar-card'
                >
                  <div className='avatar-ring'>
                    <img src={ra.image || ''} alt={ra.name} />
                  </div>
                  <p className='artist-name'>{ra.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
