import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { NowPlayingBar } from './NowPlaying';

import './PageLayout.scss';

const HIDE_PLAYING = ['/profile', '/studio'];

export const PageLayout: React.FC = () => {
  const { pathname } = useLocation();
  const showPlaying = !HIDE_PLAYING.includes(pathname);

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
