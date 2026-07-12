/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, History, TrendingUp, Compass, Award, Star, ArrowUpRight } from 'lucide-react';
import { AppModel, CategoryType } from '../types';
import AppCard from '../components/AppCard';
import AppSlider from '../components/AppSlider';
import SkeletonCard from '../components/SkeletonCard';

interface HomeViewProps {
  apps: AppModel[];
  isLoading: boolean;
  searchQuery: string;
  onAppClick: (id: string) => void;
  onDownloadClick: (app: AppModel, e: React.MouseEvent) => void;
}

const CATEGORIES: ('All' | CategoryType)[] = [
  'All',
  'Bible',
  'Music',
  'Games',
  'Tools',
  'Lifestyle',
  'Education',
  'Books'
];

export default function HomeView({
  apps,
  isLoading,
  searchQuery,
  onAppClick,
  onDownloadClick
}: HomeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryType>('All');

  // Filter application list based on search and category selections
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory === 'All' || app.category === selectedCategory;

      return matchSearch && matchCategory && app.status === 'published';
    });
  }, [apps, searchQuery, selectedCategory]);

  // Extract special grouping subsets
  const featuredApps = useMemo(() => {
    return apps.filter(app => app.featured && app.status === 'published');
  }, [apps]);

  const trendingApps = useMemo(() => {
    return filteredApps.filter(app => app.downloads > 500).slice(0, 4);
  }, [filteredApps]);

  const latestApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [filteredApps]);

  const topDownloads = useMemo(() => {
    return [...filteredApps].sort((a, b) => b.downloads - a.downloads);
  }, [filteredApps]);

  const topCategories = [
    { name: 'Bible', count: apps.filter(a => a.category === 'Bible').length, color: 'from-amber-500 to-yellow-400' },
    { name: 'Music', count: apps.filter(a => a.category === 'Music').length, color: 'from-blue-500 to-indigo-400' },
    { name: 'Games', count: apps.filter(a => a.category === 'Games').length, color: 'from-purple-500 to-pink-400' },
    { name: 'Tools', count: apps.filter(a => a.category === 'Tools').length, color: 'from-emerald-500 to-green-400' },
  ];

  return (
    <div className="space-y-10 pb-20 animate-fade-in" id="home-view-container">
      
      {/* Category Pills Slider / Filter Rail */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 sticky top-16 z-30 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Dynamic Header state when searching */}
        {searchQuery || selectedCategory !== 'All' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-green-500" />
                  <span>
                    {searchQuery ? `Search Results for "${searchQuery}"` : `${selectedCategory} Applications`}
                  </span>
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  We found {filteredApps.length} published applications
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, idx) => <SkeletonCard key={idx} />)}
              </div>
            ) : filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredApps.map((app) => (
                  <AppCard 
                    key={app.id} 
                    app={app} 
                    onClick={onAppClick} 
                    onDownloadClick={onDownloadClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Compass className="w-16 h-16 text-zinc-300 dark:text-zinc-700 animate-pulse mb-4" />
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No applications matched your filters</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
                  Try adjusting your keywords, expanding your selection, or viewing other categories!
                </p>
                <button 
                  onClick={() => { setSelectedCategory('All'); }}
                  className="mt-5 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-green-500/15"
                >
                  Reset Category
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Normal Play Store Layout */
          <>
            {/* 1. Featured App Banner Carousel */}
            {featuredApps.length > 0 && !isLoading && (
              <section className="space-y-4">
                <AppSlider featuredApps={featuredApps} onAppClick={onAppClick} />
              </section>
            )}

            {/* Loading default list display */}
            {isLoading ? (
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-48 animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, idx) => <SkeletonCard key={idx} />)}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 2. Popular Categories Bento Grid */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Popular Categories</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {topCategories.map((cat) => (
                      <div
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name as CategoryType)}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${cat.color} text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group select-none`}
                      >
                        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15 group-hover:scale-125 transition-transform">
                          <Award className="w-24 h-24 stroke-[1.5]" />
                        </div>
                        <h3 className="font-bold text-lg tracking-tight">{cat.name}</h3>
                        <p className="text-white/80 text-xs mt-1 font-medium">{cat.count} total apps</p>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase">
                          <span>Explore</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Latest App Releases Section */}
                {latestApps.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Latest Releases</h2>
                      </div>
                      <button 
                        onClick={() => setSelectedCategory('All')} 
                        className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {latestApps.map((app) => (
                        <AppCard 
                          key={app.id} 
                          app={app} 
                          onClick={onAppClick} 
                          onDownloadClick={onDownloadClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Trending Block */}
                {trendingApps.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Trending on Campus</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {trendingApps.map((app) => (
                        <AppCard 
                          key={app.id} 
                          app={app} 
                          onClick={onAppClick} 
                          onDownloadClick={onDownloadClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Complete Top Downloads Listing Grid */}
                <section className="space-y-6 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5.5 h-5.5 text-green-500" />
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Top Downloaded Apps</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">The most popular utility and entertainment resources on campus</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {topDownloads.map((app) => (
                      <AppCard 
                        key={app.id} 
                        app={app} 
                        onClick={onAppClick} 
                        onDownloadClick={onDownloadClick}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* Google Play Style Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 py-12 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold">U</div>
              <span className="font-bold text-zinc-900 dark:text-white">UMN App Store</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              The premium, community-driven application and resource archive for Android. Explore, host, and publish custom academic, musical, study, and religious tools.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Supported Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <button onClick={() => setSelectedCategory('Bible')} className="hover:text-green-500 text-left cursor-pointer">Bible</button>
              <button onClick={() => setSelectedCategory('Music')} className="hover:text-green-500 text-left cursor-pointer">Music</button>
              <button onClick={() => setSelectedCategory('Games')} className="hover:text-green-500 text-left cursor-pointer">Games</button>
              <button onClick={() => setSelectedCategory('Tools')} className="hover:text-green-500 text-left cursor-pointer">Tools</button>
              <button onClick={() => setSelectedCategory('Lifestyle')} className="hover:text-green-500 text-left cursor-pointer">Lifestyle</button>
              <button onClick={() => setSelectedCategory('Education')} className="hover:text-green-500 text-left cursor-pointer">Education</button>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Publisher Portal</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Are you an active campus developer or group? Join our Console and release your APKs via GitHub Releases directly.
            </p>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              &copy; 2026 UMN Ministry Devs. Designed in adherence with Google Material Design 3.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
