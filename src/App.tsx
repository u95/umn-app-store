/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { dbService } from './lib/db';
import { AppModel } from './types';
import { INITIAL_APPS } from './data/initialApps';
import { TRANSLATIONS } from './data/translations';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import DetailsView from './views/DetailsView';
import LoginView from './views/LoginView';
import AdminDashboardView from './views/AdminDashboardView';
import LegalPagesView from './views/LegalPagesView';
import AIChatBot from './components/AIChatBot';
import InstallGuideModal from './components/InstallGuideModal';

// Helper utility to convert a Google Drive file viewer/sharing link into a direct download link
function convertDriveLink(url: string): string {
  if (!url) return '';
  const fileDRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const openIdRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const ucIdRegex = /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/;
  
  let fileId = '';
  if (fileDRegex.test(url)) {
    const match = url.match(fileDRegex);
    if (match) fileId = match[1];
  } else if (openIdRegex.test(url)) {
    const match = url.match(openIdRegex);
    if (match) fileId = match[1];
  } else if (ucIdRegex.test(url)) {
    const match = url.match(ucIdRegex);
    if (match) fileId = match[1];
  }

  if (fileId) {
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

export default function App() {
  // Sync state managers
  const [apps, setApps] = useState<AppModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  
  // Language translation selection (English or Tamil)
  const [language, setLanguage] = useState<'en' | 'ta'>(() => {
    try {
      const saved = localStorage.getItem('UMN_APP_STORE_LANG');
      if (saved === 'en' || saved === 'ta') return saved;
    } catch (e) {}
    return 'ta'; // Default to Tamil for localized preference!
  });

  useEffect(() => {
    try {
      localStorage.setItem('UMN_APP_STORE_LANG', language);
    } catch (e) {}
  }, [language]);

  const handleToggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  };

  const t = TRANSLATIONS[language];
  
  // Custom router state matching client requirements
  const [currentPage, setCurrentPage] = useState<string>('home'); // 'home', 'app', 'login', 'admin'
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  // PWA installer support (Install App Store as native app / APK)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(true); // Default true to allow manual instructions fallback
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // Fallback instructions in elegant dialog modal instead of browser alert
      setShowInstallGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };
  
  // Dark mode selector
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('UMN_APP_STORE_THEME');
      if (saved) return saved === 'dark';
    } catch (e) {
      console.warn("localStorage is not accessible for theme preferences.");
    }
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  // 1. Core theme applicator
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('UMN_APP_STORE_THEME', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('UMN_APP_STORE_THEME', 'light');
      } catch (e) {}
    }
  }, [isDarkMode]);

  // 2. Fetch inventory catalog
  const loadApps = async () => {
    setIsLoading(true);
    try {
      const activeApps = await dbService.getApps();
      if (activeApps) {
        setApps(activeApps);
      } else {
        console.warn("Retrieved null/undefined apps list, falling back to static INITIAL_APPS catalog.");
        setApps(INITIAL_APPS);
      }
    } catch (e) {
      console.error("Failed to load apps list from database, using INITIAL_APPS fallback.", e);
      setApps(INITIAL_APPS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
    
    // Subscribe to admin sessions
    const unsubscribe = dbService.subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // 3. Dual Route syncing (Parses browser URLs and state to support deep linking)
  useEffect(() => {
    const parseUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page') || 'home';
      const id = params.get('id') || '';

      setCurrentPage(page);
      if (id) {
        setSelectedAppId(id);
      }
    };

    // Parse on load
    parseUrlParams();

    // Listen to browser forward/back clicks
    window.addEventListener('popstate', parseUrlParams);
    return () => window.removeEventListener('popstate', parseUrlParams);
  }, []);

  // Custom client navigation dispatcher
  const handleNavigate = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setSearchQuery(''); // Clear search on explicit navigation

    let newUrl = `${window.location.pathname}?page=${page}`;
    if (params.id) {
      setSelectedAppId(params.id);
      newUrl += `&id=${encodeURIComponent(params.id)}`;
    } else {
      setSelectedAppId('');
    }

    // Push standard history state to coordinate url sharing
    window.history.pushState({ page, ...params }, '', newUrl);
  };

  // 4. Download Execution Counter (Downloads APK file & increments Firestore/localStorage logs)
  const handleDownloadApk = async (app: AppModel) => {
    if (!app || !app.apk) {
      console.error("Invalid app or missing APK link");
      return;
    }

    const rawUrl = app.apk;
    const isGoogleDrive = rawUrl.includes('drive.google.com');
    const processedUrl = isGoogleDrive ? convertDriveLink(rawUrl) : rawUrl;

    try {
      // 1. Trigger browser download synchronously.
      // In standalone PWAs on Android, direct assignment is the most robust way to prompt 
      // the system's native download manager or open the link in the native browser.
      // If it is a Google Drive link, a non-APK website URL, or we are currently embedded in an iframe (AI Studio preview),
      // we open in a new window/tab to prevent iframe blockage and allow direct system download prompts.
      if (isGoogleDrive || !processedUrl.toLowerCase().endsWith('.apk') || window.self !== window.top) {
        window.open(processedUrl, '_blank');
      } else {
        window.location.href = processedUrl;
      }

      // 2. Increment database count in the background (non-blocking)
      dbService.incrementDownloads(app.id)
        .then(async () => {
          // 3. Fast-reload list from source to update download statistics in the UI immediately
          const updatedApps = await dbService.getApps();
          setApps(updatedApps);
        })
        .catch((err) => {
          console.error("Failed to increment download count in background:", err);
        });
    } catch (e) {
      console.error("Failed to execute direct APK download routine, using anchor fallback:", e);
      try {
        const link = document.createElement('a');
        link.href = processedUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Anchor fallback also failed:", err);
      }
    }
  };

  // 5. Console modification callbacks
  const handleAddAppToDB = async (appData: Omit<AppModel, 'id'>) => {
    const newId = await dbService.addApp(appData);
    await loadApps();
    return newId;
  };

  const handleUpdateAppInDB = async (id: string, updatedData: Partial<AppModel>) => {
    await dbService.updateApp(id, updatedData);
    await loadApps();
  };

  const handleDeleteAppFromDB = async (id: string) => {
    await dbService.deleteApp(id);
    await loadApps();
  };

  const handleLogout = async () => {
    await dbService.logout();
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      
      {/* Top Google Play themed navbar */}
      <Navbar
        currentSearch={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        showInstallBtn={showInstallBtn}
        onInstallApp={handleInstallApp}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        t={t}
      />

      {/* Main workspace layout router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomeView
            apps={apps}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onAppClick={(id) => handleNavigate('app', { id })}
            onDownloadClick={handleDownloadApk}
            language={language}
            t={t}
          />
        )}

        {currentPage === 'app' && (
          <DetailsView
            appId={selectedAppId}
            apps={apps}
            isLoading={isLoading}
            onBack={() => handleNavigate('home')}
            onAppClick={(id) => handleNavigate('app', { id })}
            onDownloadClick={handleDownloadApk}
            language={language}
            t={t}
          />
        )}

        {currentPage === 'login' && (
          <LoginView
            onLoginSuccess={(user) => setCurrentUser(user)}
            onNavigate={handleNavigate}
            onLoginSubmit={dbService.login.bind(dbService)}
            onRegisterSubmit={dbService.register.bind(dbService)}
          />
        )}

        {currentPage === 'admin' && (
          currentUser ? (
            <AdminDashboardView
              apps={apps}
              onLogout={handleLogout}
              onAddApp={handleAddAppToDB}
              onUpdateApp={handleUpdateAppInDB}
              onDeleteApp={handleDeleteAppFromDB}
              currentUser={currentUser}
            />
          ) : (
            /* Redirect to login if user attempts to bypass auth console directly */
            <LoginView
              onLoginSuccess={(user) => setCurrentUser(user)}
              onNavigate={handleNavigate}
              onLoginSubmit={dbService.login.bind(dbService)}
              onRegisterSubmit={dbService.register.bind(dbService)}
            />
          )
        )}

        {['about', 'privacy', 'terms', 'disclaimer', 'dmca', 'contact'].includes(currentPage) && (
          <LegalPagesView
            page={currentPage}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Modern responsive Google Play-themed Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <span className="font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 text-lg">UMN App Store</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xs">
                A beautiful, high-performance secure Android APK distribution repository built for the UMN Ministry and college community.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Store pages</h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><button onClick={() => handleNavigate('home')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">All Apps Catalog</button></li>
                <li><button onClick={() => handleNavigate('login')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">Publisher Login</button></li>
                <li><button onClick={() => handleNavigate('admin')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">Play Console</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Legal & Compliance</h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><button onClick={() => handleNavigate('privacy')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">Privacy Policy</button></li>
                <li><button onClick={() => handleNavigate('terms')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">Terms & Conditions</button></li>
                <li><button onClick={() => handleNavigate('disclaimer')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">Disclaimer Statement</button></li>
                <li><button onClick={() => handleNavigate('dmca')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">DMCA & Copyright</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Information</h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><button onClick={() => handleNavigate('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">About Us</button></li>
                <li><button onClick={() => handleNavigate('contact')} className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left">Contact Us</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800/80 mt-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] text-zinc-400">
            <span>© 2026 UMN Ministry & Tech Labs. All Rights Reserved.</span>
            <div className="flex items-center gap-4">
              <span>Google Play Inspired Design</span>
              <span>•</span>
              <span>PWA Ready Offline Cache</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating Tamil AI Assistant Chatbot */}
      <AIChatBot />

      {/* Modern, visually beautiful, animated Install Instructions Modal */}
      <InstallGuideModal 
        isOpen={showInstallGuide} 
        onClose={() => setShowInstallGuide(false)} 
      />
    </div>
  );
}
