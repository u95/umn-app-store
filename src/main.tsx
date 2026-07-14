import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker with auto-update & cache-busting
if ('serviceWorker' in navigator) {
  const isPreview = 
    window.location.hostname.includes('ais-dev') || 
    window.location.hostname.includes('ais-pre') || 
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1');

  // In AI Studio development or preview, completely bypass/unregister the Service Worker
  // and clear all caches to guarantee immediate updates and prevent blank screens.
  if (isPreview) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('Unregistered Service Worker during preview:', registration.scope);
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
      console.log('Cleared all Service Worker caches in preview.');
    }
  } else {
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
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

