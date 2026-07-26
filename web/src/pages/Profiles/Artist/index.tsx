import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchNui } from '../../../utils/fetchNui';
import type { ArtistProfile } from '@common/types';
import { ChevronLeft, HeartIcon, PlayIcon, ShareIcon, ShuffleIcon, Verified } from 'lucide-react';
import { MOCK_ARTIST_PROFILE } from '../../../mockdata';
import { Image } from '../../../components/ImageFallback';
import { formatNumber } from '../../../utils/utils';

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
      <div className='artist-hero'>
        <Image src={artist.image || ''} alt={artist.name} className='hero-image' />
        <div className='hero-overlay' />
        <button onClick={() => navigate(-1)} className='icon-button top-left'>
          <ChevronLeft color='white' />
        </button>
        <button className='icon-button top-right'>
          <ShareIcon color='white' />
        </button>

        <div className='hero-content'>
          <div>
            {artist.verified && (
              <div className='verified-badge'>
                <div className='badge-icon'>
                  <Verified color='white' size={18} />
                </div>
                <span className='badge-text'>Verified Artist</span>
              </div>
            )}
            <h1 className='hero-title'>{artist.name}</h1>
          </div>
        </div>
      </div>

      <div className='stats-card-group'>
        <div className='stat-box'>
          <div className='value'>{/* artist.monthly || */ '—'}</div>
          <div className='label'>Monthly listeners</div>
        </div>
        <div className='stat-box'>
          <div className='value'>{artist.followers ? formatNumber(artist.followers) : '—'}</div>
          <div className='label'>Followers</div>
        </div>
        <div className='stat-box'>
          <div className='value'>{artist.genre ?? 'Pop'}</div>
          <div className='label'>Genre</div>
        </div>
      </div>

      <div className='action-row'>
        <button
          onClick={() => setFollowed(!followed)}
          className={`btn-follow ${followed ? 'following' : 'not-following'}`}
        >
          {followed ? 'Following' : 'Follow'}
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

      <div className='segmented-tab-switch'>
        {(['tracks', 'albums', 'about'] as const).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={activeSection === s ? 'active' : ''}>
            {s}
          </button>
        ))}
      </div>

      <div className='content-sections'>
        {activeSection === 'tracks' && artist.topTracks && (
          <div className='track-list'>
            {artist.topTracks.map((t, i) => (
              <div key={t.name} className='song-list-item'>
                <span className='index'>{i + 1}</span>
                <div className='cover'>
                  <Image src={artist.image || ''} alt={t.name} />
                </div>
                <div className='details'>
                  <p className='title'>{t.name}</p>
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

        {activeSection === 'albums' && artist.albums && (
          <div className='album-list'>
            {artist.albums.map((album) => (
              <div key={album.id} className='song-list-item'>
                <div className='cover'>
                  <Image src={album.image} alt={album.name} />
                </div>
                <div className='details'>
                  <p className='title'>{album.name}</p>
                  <p className='meta'>Album · {album.year}</p>
                </div>
                <button className='play-btn'>
                  <PlayIcon color='var(--text-primary)' />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'about' && (
          <div className='about-section'>
            <p className='about-text'>{artist.bio || 'No biography available for this artist.'}</p>
          </div>
        )}

        {/* Related Artists */}
        {artist.related && artist.related.length > 0 && (
          <div className='related-section'>
            <p className='section-title'>Fans also like</p>
            <div className='horizontal-scroll-list artists'>
              {artist.related.map((ra) => (
                <button
                  key={ra.id}
                  onClick={() => navigate(`/artist?artistId=${ra.id}`)}
                  className='artist-avatar-card'
                >
                  <div className='avatar-ring'>
                    <Image src={ra.image || ''} alt={ra.name} />
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
