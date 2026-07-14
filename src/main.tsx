import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker with auto-update & cache-busting
if ('serviceWorker' in navigator) {
  // In AI Studio development or preview, completely bypass/unregister the Service Worker
  // and clear all caches to guarantee immediate updates and prevent blank screens.
  if ((import.meta as any).env?.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('Unregistered Service Worker during development:', registration.scope);
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
      console.log('Cleared all Service Worker caches in development.');
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

