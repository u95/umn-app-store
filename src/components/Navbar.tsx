/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Sun, Moon, LogIn, LayoutDashboard, LogOut, Terminal, X, Languages } from 'lucide-react';
import { AppTranslations } from '../data/translations';

interface NavbarProps {
  currentSearch: string;
  onSearchChange: (val: string) => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
  currentUser: { uid: string; email: string } | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  showInstallBtn?: boolean;
  onInstallApp?: () => void;
  language: 'en' | 'ta';
  onToggleLanguage: () => void;
  t: AppTranslations;
}

export default function Navbar({
  currentSearch,
  onSearchChange,
  onNavigate,
  currentPage,
  currentUser,
  onLogout,
  isDarkMode,
  onToggleTheme,
  showInstallBtn = false,
  onInstallApp,
  language,
  onToggleLanguage,
  t
}: NavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFirebaseInfo, setShowFirebaseInfo] = useState(false);

  // Sync title depending on page
  useEffect(() => {
    const isTa = language === 'ta';
    document.title = currentPage === 'admin' 
      ? (isTa ? 'UMN பிளே கன்சோல் - டாஷ்போர்டு' : 'UMN Play Console - Dashboard')
      : currentPage === 'login'
      ? (isTa ? 'UMN பிளே கன்சோல் - உள்நுழைக' : 'UMN Play Console - Sign In')
      : (isTa ? 'உமன்ஸ் பிளே ஸ்டோர் - ஆண்ட்ராய்டு ஆப் ஸ்டோர்' : 'UMN App Store - Android Play Store');
  }, [currentPage, language]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
          id="navbar-logo"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 via-green-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
            {/* Custom Google Play styled triangle icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.25 3.5C5.07 3.5 4.91 3.56 4.78 3.67L13.19 12.08L17.7 7.57C17.02 7.14 11.23 3.82 5.25 3.5Z" opacity="0.85"/>
              <path d="M4.05 4.96C4.02 5.12 4 5.3 4 5.5V18.5C4 18.7 4.02 18.88 4.05 19.04L12.5 10.59L4.05 4.96Z" opacity="0.95"/>
              <path d="M4.78 20.33C4.91 20.44 5.07 20.5 5.25 20.5C11.23 20.18 17.02 16.86 17.7 16.43L13.19 11.92L4.78 20.33Z" opacity="0.85"/>
              <path d="M18.42 15.17L14.28 12.65L14.26 12.64L14.12 12.5L14.26 12.36L14.28 12.35L18.42 9.83C19.22 9.34 19.8 9.92 19.53 10.8L18.83 12.5L19.53 14.2C19.8 15.08 19.22 15.66 18.42 15.17Z"/>
            </svg>
          </div>
          <div className="hidden sm:block select-none">
            <span className="font-bold tracking-tight text-zinc-900 dark:text-white text-lg">{language === 'ta' ? 'உமன்ஸ் ' : 'UMN '}</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold text-[15px] ml-0.5">{language === 'ta' ? 'ஆப் ஸ்டோர்' : 'App Store'}</span>
          </div>
        </div>

        {/* Dynamic Center Search Bar (Only shown on home page or search pages) */}
        <div className={`flex-1 max-w-xl transition-all duration-300 ${currentPage === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none hidden md:block'}`}>
          <div className={`relative flex items-center h-10 px-3.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border transition-all ${
            isSearchFocused 
              ? 'border-green-500 bg-white dark:bg-zinc-950 ring-2 ring-green-500/10' 
              : 'border-transparent'
          }`}>
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={currentSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-transparent border-0 outline-none pl-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
              id="search-input"
            />
            {currentSearch && (
              <button 
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* PWA / APK Install Button */}
          {showInstallBtn && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/15 transition-all select-none cursor-pointer"
              title={language === 'ta' ? "செயலியை நிறுவுக" : "Install App Store as Mobile App / APK"}
              id="install-pwa-btn"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V3m0 12l-4-4m4 4l4-4M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
              </svg>
              <span className="hidden md:inline">{language === 'ta' ? 'செயலியை நிறுவு' : 'Install App Store (APK)'}</span>
              <span className="md:hidden font-bold text-xs">{language === 'ta' ? 'நிறுவு' : 'Install'}</span>
            </button>
          )}
          
          {/* Database Mode Pill */}
          <div 
            onClick={() => setShowFirebaseInfo(!showFirebaseInfo)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.2 rounded-full text-xs font-semibold cursor-pointer select-none transition-all border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${(import.meta as any).env.VITE_FIREBASE_API_KEY ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-zinc-600 dark:text-zinc-400">
              {(import.meta as any).env.VITE_FIREBASE_API_KEY ? 'Firebase DB' : (language === 'ta' ? 'உள்ளூர் தற்காலிக தளம்' : 'Local Sandbox')}
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors flex items-center gap-1 hover:text-green-500 cursor-pointer"
            title={language === 'en' ? "தமிழ் மொழிக்கு மாற்றுக (Switch to Tamil)" : "Switch to English"}
            id="language-toggle"
          >
            <Languages className="w-5 h-5 text-green-500" />
            <span className="hidden sm:inline text-xs font-bold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors"
            title="Toggle theme"
            id="theme-toggle"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin / Portal Section */}
          {currentUser ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  currentPage === 'admin'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                title="Google Play Console"
                id="console-btn"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Play Console</span>
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Sign Out of Console"
                id="sign-out-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                currentPage === 'login'
                  ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-500/5'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
              id="sign-in-btn"
            >
              <LogIn className="w-4 h-4 text-green-500" />
              <span>Console Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Floating Firebase Info Banner */}
      {showFirebaseInfo && (
        <div className="absolute right-4 top-16 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 max-w-sm text-xs text-zinc-600 dark:text-zinc-400 animate-slide-up space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-green-500" /> Database Status
            </span>
            <button 
              onClick={() => setShowFirebaseInfo(false)} 
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {(import.meta as any).env.VITE_FIREBASE_API_KEY ? (
            <div className="space-y-1">
              <p className="text-emerald-500 font-semibold">● Connected to live Firestore</p>
              <p>Project ID: <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-red-500">{(import.meta as any).env.VITE_FIREBASE_PROJECT_ID}</code></p>
              <p>Your apps, uploads, and download counters are actively synchronizing with live Firebase Cloud databases.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-amber-500 font-semibold">● Operating in Local Sandbox Mode</p>
              <p>Data is persisted inside your browser cache (`localStorage`). Any apps you upload, edit, delete, or download will save automatically.</p>
              <p className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded text-[11px] leading-relaxed">
                <span className="font-bold block text-zinc-800 dark:text-zinc-200 mb-0.5">How to link real Firebase:</span>
                Declare standard <code className="text-green-500 font-bold">VITE_FIREBASE_*</code> keys in your <code className="text-green-500">.env</code> file (see `.env.example`). When Vite rebuilds, it will automatically connect to your Firestore database collection securely!
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
