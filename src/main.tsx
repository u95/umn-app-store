import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker with auto-update & cache-busting
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Clear legacy service worker caches programmatically to resolve blank/black screens immediately
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    navigator.serviceWorker.register('/sw.js')
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

