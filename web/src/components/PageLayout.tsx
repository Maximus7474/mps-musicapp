import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { NowPlayingBar } from './NowPlaying';

import './PageLayout.scss';

export const PageLayout: React.FC = () => {
  const { pathname } = useLocation();
  const showPlaying = pathname !== '/profile';

  return (
    <div className='app-wrapper'>
      <main className='app-content'>
        <Outlet />
      </main>

      <div className='app-bottom-dock'>
        {showPlaying && <NowPlayingBar />}
        <Footer />
      </div>
    </div>
  );
};
