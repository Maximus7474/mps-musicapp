import { type ReactNode, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import Frame from './components/dev/Frame';
import { Routes, Route } from 'react-router-dom';
import ThemeToggler from './components/dev/Theming';
import { PageLayout } from './components/PageLayout';
import { AlbumPage, ArtistPage, HomePage, LibraryPage, PlaylistPage, ProfilePage, SearchPage } from './pages';

import './styles/App.scss';
import './pages/pages.scss';

const devMode = !window?.['invokeNative'];

const App = () => {
  const appDiv = useRef(null);

  useEffect(() => {
    if (devMode) {
      document.body.style.visibility = 'visible';
      document.body.setAttribute('devmode', 'true');
      return;
    }
  }, []);

  return (
    <AppProvider>
      <div className='app' ref={appDiv}>
        <Routes>
          <Route path='/' element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path='library' element={<LibraryPage />} />
            <Route path='profile' element={<ProfilePage />} />
            <Route path='search' element={<SearchPage />} />
            <Route path='artist' element={<ArtistPage />} />
            <Route path='album' element={<AlbumPage />} />
            <Route path='playlist' element={<PlaylistPage />} />

            {/* Redirect if accessing an unknown or unauthorised page */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Route>
        </Routes>
      </div>
      {devMode && <ThemeToggler />}
    </AppProvider>
  );
};

const AppProvider = ({ children }: { children: ReactNode }) => {
  if (devMode) {
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;

      const aspectRatio = innerWidth / innerHeight;
      const phoneAspectRatio = 27.6 / 59;

      if (phoneAspectRatio < aspectRatio) {
        document.documentElement.style.fontSize = '1.66vh';
      } else {
        document.documentElement.style.fontSize = '3.4vw';
      }
    };

    useEffect(() => {
      window.addEventListener('resize', handleResize);

      if (devMode) {
        document.body.style.visibility = 'visible';
        return;
      }

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    handleResize();

    return (
      <div className='dev-wrapper'>
        <Frame>{children}</Frame>
      </div>
    );
  } else return children;
};

export default App;
