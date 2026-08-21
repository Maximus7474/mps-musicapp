import { TrendingUp } from 'lucide-react';

export const MetricsTab = () => {
  return (
    <div className='metrics-tab-content'>
      <div className='empty-state'>
        <TrendingUp size={36} />
        <p>Metrics coming soon.</p>
      </div>
    </div>
  );

  // return (
  //   <div className='metrics-tab-content'>
  //     <div className='stats-card-group'>
  //       <div className='stat-box'>
  //         <div className='value'>{metrics?.totalStreams.toLocaleString() ?? 0}</div>
  //         <div className='label'>Total Streams</div>
  //       </div>
  //       <div className='stat-box'>
  //         <div className='value'>{metrics?.monthlyListeners.toLocaleString() ?? 0}</div>
  //         <div className='label'>Listeners</div>
  //       </div>
  //     </div>

  //     {metrics?.topTrack && (
  //       <div className='top-track-card'>
  //         <span className='card-badge'>
  //           <TrendingUp size={14} /> Top Performing
  //         </span>
  //         <div className='track-info'>
  //           <Image src={metrics.topTrack.image || ''} alt={metrics.topTrack.name} className='cover' />
  //           <div>
  //             <p className='title'>{metrics.topTrack.name}</p>
  //             <p className='streams'>{metrics.topTrack.streams.toLocaleString()} total streams</p>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     <div className='metrics-list'>
  //       <h4 className='section-title'>Song Performance</h4>
  //       {metrics?.recentTracks.map((track) => (
  //         <div key={track.id} className='metric-row-item'>
  //           <Image src={track.image || ''} alt={track.name} className='mini-cover' />
  //           <div className='details'>
  //             <p className='title'>{track.name}</p>
  //             <p className='meta'>{track.streams.toLocaleString()} plays</p>
  //           </div>
  //           <span className='growth-tag'>
  //             +{track.weeklyChangePercent}%
  //           </span>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // )
};
