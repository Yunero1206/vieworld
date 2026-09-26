import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-500.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-700.css';
import '@fontsource/lora/vietnamese-400.css';
import '@fontsource/lora/vietnamese-500.css';
import '@fontsource/lora/vietnamese-600.css';
import '@fontsource/lora/vietnamese-700.css';
import './index.css';
import './styles/fan-world.css';
import './styles/world-v3.css';
import './styles/fonts.css';
import './styles/world-v4.css';
import './styles/world-v5.css';
import './styles/world-v6.css';
import './styles/world-v7.css';
import './styles/world-v8.css';
import './styles/fandom-cheer.css';
import './styles/explore.css';
import './styles/moments.css';
import './styles/notification-board.css';
import './styles/home.css';
import './styles/navigation-rail.css';
import './styles/editorial-pages.css';
import './styles/explore-world-list.css';
import './styles/artist-world-v2.css';
import './styles/artist-context.css';
import './styles/my-space-v2.css';
import './styles/shop-v3.css';
import './styles/appearance.css';
import './styles/experience.css';
import './styles/refinement.css';
import './styles/artist-bulletin.css';
import './styles/home-inbox.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA Service Worker for offline My Space access
if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator && !navigator.userAgent.includes('jsdom')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
