import { Bell, Volume2, HardDrive, Shield, ChevronRight } from 'lucide-react';

const PREFERENCES = [
  { icon: <Bell size={18} className='icon' />, label: 'Notifications', desc: 'Manage alerts' },
  { icon: <Volume2 size={18} className='icon' />, label: 'Audio Quality', desc: 'Lossless' },
  { icon: <HardDrive size={18} className='icon' />, label: 'Offline Mode', desc: 'Manage downloads' },
  { icon: <Shield size={18} className='icon' />, label: 'Privacy & Data', desc: 'Local session settings' },
];

/** The App Preferences section of the profile page. */
export function PreferencesList() {
  return (
    <div>
      <p className='greeting-label' style={{ marginBottom: '0.75rem' }}>
        App Preferences
      </p>

      <div className='preferences-list'>
        {PREFERENCES.map((item) => (
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
  );
}
