import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { devMode } from './utils/utils';
import { AudioProvider } from './contexts/audio';
import App from './App';

const root = createRoot(document.getElementById('root')!);

if (window.name === '' || devMode) {
  const renderApp = () => {
    root.render(
      <HashRouter>
        <AudioProvider>
          <App />
        </AudioProvider>
      </HashRouter>,
    );
  };

  if (devMode) {
    renderApp();
  } else {
    window.addEventListener('message', (event) => {
      if (event.data === 'componentsLoaded') renderApp();
    });
  }
}
