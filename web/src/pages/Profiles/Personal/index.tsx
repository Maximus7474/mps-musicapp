import { Music, Heart, Disc, Bell, Volume2, HardDrive, Shield, UserCircle2, ChevronRight } from 'lucide-react';

export function ProfilePage() {
  const stats = [
    { label: 'Liked', value: '248', icon: Heart },
    { label: 'Artists', value: '34', icon: Disc },
    { label: 'Playlists', value: '12', icon: Music },
  ];

  const preferences = [
    { icon: <Bell size={18} className='icon' />, label: 'Notifications', desc: 'Manage alerts' },
    { icon: <Volume2 size={18} className='icon' />, label: 'Audio Quality', desc: 'Lossless' },
    { icon: <HardDrive size={18} className='icon' />, label: 'Offline Mode', desc: 'Manage downloads' },
    { icon: <Shield size={18} className='icon' />, label: 'Privacy & Data', desc: 'Local session settings' },
  ];

  return (
    <div className='page-container no-dock'>
      <div className='page-header'>
        <h1 className='title'>Your Profile</h1>
        <button className='icon-button'>
          <UserCircle2 />
        </button>
      </div>

      <div className='stats-card-group'>
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className='stat-box'>
            <Icon size={16} className='stat-icon' />
            <p className='value'>{value}</p>
            <p className='label'>{label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className='greeting-label' style={{ marginBottom: '0.75rem' }}>
          App Preferences
        </p>

        <div className='preferences-list'>
          {preferences.map((item) => (
            <button key={item.label} className='setting-row'>
              <div className='row-left'>
                <div className='row-icon-box'>{item.icon}</div>
                <div>
                  <p className='title'>{item.label}</p>
                  <p className='desc'>{item.desc}</p>
                </div>
              </div>

              <ChevronRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
