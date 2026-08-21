import { Music, Heart, Disc } from 'lucide-react';

const STATS = [
  { label: 'Liked', value: '248', icon: Heart },
  { label: 'Artists', value: '34', icon: Disc },
  { label: 'Playlists', value: '12', icon: Music },
];

/** The three-column liked / artists / playlists stats bar. */
export function StatsRow() {
  return (
    <div className='stats-card-group'>
      {STATS.map(({ label, value, icon: Icon }) => (
        <div key={label} className='stat-box'>
          <Icon size={16} className='stat-icon' />
          <p className='value'>{value}</p>
          <p className='label'>{label}</p>
        </div>
      ))}
    </div>
  );
}
