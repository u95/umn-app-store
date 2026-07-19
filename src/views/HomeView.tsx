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
import { AppTranslations } from '../data/translations';

interface HomeViewProps {
  apps: AppModel[];
  isLoading: boolean;
  searchQuery: string;
  onAppClick: (id: string) => void;
  onDownloadClick: (app: AppModel, e: React.MouseEvent) => void;
  language: 'en' | 'ta';
  t: AppTranslations;
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
  onDownloadClick,
  language,
  t
}: HomeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryType>('All');

  // Multi-language category helper
  const getCategoryLabel = (cat: string) => {
    if (language !== 'ta') return cat;
    switch (cat) {
      case 'All': return 'அனைத்தும்';
      case 'Bible': return 'பைபிள் / வேதாகமம்';
      case 'Music': return 'பாடல்கள் / இசை';
      case 'Games': return 'விளையாட்டுகள்';
      case 'Tools': return 'கருவிகள்';
      case 'Lifestyle': return 'வாழ்க்கை முறை';
      case 'Education': return 'கல்வி';
      case 'Books': return 'புத்தகங்கள்';
      default: return cat;
    }
  };

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
                {getCategoryLabel(cat)}
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
                    {searchQuery 
                      ? (language === 'ta' ? `"${searchQuery}" க்கான தேடல் முடிவுகள்` : `Search Results for "${searchQuery}"`) 
                      : (language === 'ta' ? `${getCategoryLabel(selectedCategory)} செயலிகள்` : `${selectedCategory} Applications`)}
                  </span>
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  {language === 'ta' 
                    ? `நாங்கள் ${filteredApps.length} வெளியிடப்பட்ட செயலிகளைக் கண்டறிந்துள்ளோம்` 
                    : `We found ${filteredApps.length} published applications`}
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
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{t.noAppsFound}</h3>
                <button 
                  onClick={() => { setSelectedCategory('All'); }}
                  className="mt-5 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-green-500/15"
                >
                  {language === 'ta' ? 'வகைகளை மீட்டமைக்கவும்' : 'Reset Category'}
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
                    <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">{t.popularCategories}</h2>
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
                        <h3 className="font-bold text-lg tracking-tight">{getCategoryLabel(cat.name)}</h3>
                        <p className="text-white/80 text-xs mt-1 font-medium">
                          {cat.count} {language === 'ta' ? 'செயலிகள்' : 'total apps'}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase">
                          <span>{language === 'ta' ? 'ஆராய்ந்து பார்' : 'Explore'}</span>
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
                        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">{t.latestReleases}</h2>
                      </div>
                      <button 
                        onClick={() => setSelectedCategory('All')} 
                        className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline"
                      >
                        {t.viewAll}
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
                        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">{t.trendingOnCampus}</h2>
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
                        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">{t.topDownloadedApps}</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.categoriesSubtitle}</p>
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
    </div>
  );
}
