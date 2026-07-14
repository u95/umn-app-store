/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { dbService } from './lib/db';
import { AppModel } from './types';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import DetailsView from './views/DetailsView';
import LoginView from './views/LoginView';
import AdminDashboardView from './views/AdminDashboardView';
import AIChatBot from './components/AIChatBot';

export default function App() {
  // Sync state managers
  const [apps, setApps] = useState<AppModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  
  // Custom router state matching client requirements
  const [currentPage, setCurrentPage] = useState<string>('home'); // 'home', 'app', 'login', 'admin'
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  // PWA installer support (Install App Store as native app / APK)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(true); // Default true to allow manual instructions fallback

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
      // Fallback instructions in elegant dialog or alert
      alert("UMN App Store-ஐ செயலியைப் போல நிறுவ, உங்கள் மொபைல் கூகுள் குரோம் (Chrome) பிரவுசரின் மெனுவை அழுத்தி, 'Add to Home screen' (முகப்புத் திரையில் சேர்) என்பதைத் தேர்ந்தெடுக்கவும்.");
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
      setApps(activeApps);
    } catch (e) {
      console.error("Failed to load apps list", e);
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
    try {
      // 1. Run async database counter increments
      await dbService.incrementDownloads(app.id);
      
      // 2. Trigger browser download redirect
      window.open(app.apk, '_blank', 'noopener,noreferrer');
      
      // 3. Fast-reload list from source to increment stats counters in UI immediately
      const updatedApps = await dbService.getApps();
      setApps(updatedApps);
    } catch (e) {
      console.error("Failed to execute APK download routine", e);
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
          />
        )}

        {currentPage === 'app' && (
          <DetailsView
            appId={selectedAppId}
            apps={apps}
            onBack={() => handleNavigate('home')}
            onAppClick={(id) => handleNavigate('app', { id })}
            onDownloadClick={handleDownloadApk}
          />
        )}

        {currentPage === 'login' && (
          <LoginView
            onLoginSuccess={(user) => setCurrentUser(user)}
            onNavigate={handleNavigate}
            onLoginSubmit={dbService.login.bind(dbService)}
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
            />
          )
        )}
      </main>
      
      {/* Floating Tamil AI Assistant Chatbot */}
      <AIChatBot />
    </div>
  );
}
