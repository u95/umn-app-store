import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker with auto-update & cache-busting
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = '/sw.js';

    navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
      .then((reg) => {
        console.log('Service Worker registered successfully:', reg.scope);
        // Force update check
        reg.update();
      })
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

