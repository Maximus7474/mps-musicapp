import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { SectionHeader } from '../../components/SectionHeader';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const genres = [
    { name: 'Pop', color: 'linear-gradient(to bottom right, #ec4899, #e11d48)' },
    { name: 'Hip-Hop', color: 'linear-gradient(to bottom right, #f97316, #d97706)' },
    { name: 'Electronic', color: 'linear-gradient(to bottom right, #06b6d4, #2563eb)' },
    { name: 'R&B', color: 'linear-gradient(to bottom right, #a855f7, #7c3aed)' },
    { name: 'Rock', color: 'linear-gradient(to bottom right, #ef4444, #be123c)' },
    { name: 'Jazz', color: 'linear-gradient(to bottom right, #eab308, #ea580c)' },
    { name: 'Classical', color: 'linear-gradient(to bottom right, #14b8a6, #16a34a)' },
    { name: 'Podcasts', color: 'linear-gradient(to bottom right, #6366f1, #6b21a8)' },
  ];

  return (
    <div className='page-container'>
      <h1 className='page-title'>Search</h1>

      <div className='search-input-box'>
        <SearchIcon />
        <input
          type='text'
          placeholder='Artists, songs, podcasts...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        <SectionHeader title='Browse All' />
        <div className='genre-grid'>
          {genres.map((g) => (
            <div key={g.name} className='genre-card' style={{ background: g.color }}>
              <p className='genre-title'>{g.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
