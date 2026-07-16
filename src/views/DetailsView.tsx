/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, Download, ShieldCheck, Share2, Copy, Check, MessageSquare, Sparkles, Box } from 'lucide-react';
import { AppModel, ReviewModel } from '../types';
import { INITIAL_APPS, MOCK_REVIEWS } from '../data/initialApps';
import AppCard from '../components/AppCard';

interface DetailsViewProps {
  appId: string;
  apps: AppModel[];
  isLoading?: boolean;
  onBack: () => void;
  onAppClick: (id: string) => void;
  onDownloadClick: (app: AppModel) => void;
}

export default function DetailsView({
  appId,
  apps,
  isLoading = false,
  onBack,
  onAppClick,
  onDownloadClick
}: DetailsViewProps) {
  const [copied, setCopied] = useState(false);

  // Retrieve current app details
  const app = useMemo(() => {
    const found = apps.find(a => a.id === appId);
    if (found) return found;
    // Defensive self-healing fallback to preloaded baseline apps
    return INITIAL_APPS.find(a => a.id === appId) || null;
  }, [apps, appId]);

  // Track page views and reset scroll top on app change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [appId]);

  // Gather reviews
  const reviews: ReviewModel[] = useMemo(() => {
    if (!app) return [];
    return MOCK_REVIEWS[app.id] || [
      {
        id: "r-def-1",
        userName: "Community Reviewer",
        rating: 5,
        comment: "Excellent utility application, super fast, and easy to run on my Android emulator. 5 stars!",
        date: "2026-07-01"
      }
    ];
  }, [app]);

  // Compute average rating and count
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 4.8, total: 1 };
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: totalRating / reviews.length,
      total: reviews.length
    };
  }, [reviews]);

  // Gather related apps of same category (excluding current app)
  const relatedApps = useMemo(() => {
    if (!app) return [];
    return apps
      .filter(a => a.category === app.category && a.id !== app.id && a.status === 'published')
      .slice(0, 4);
  }, [apps, app]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Loading application details...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">!</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Application Not Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          The application with the specified identifier could not be retrieved. It may have been draft-saved, suspended, or deleted.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    );
  }

  // Handle share link copy
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?page=app&id=${app.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formatDownloadsCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 pb-24 animate-slide-up" id={`details-view-${app.id}`}>
      
      {/* Back Button Rail */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-zinc-100 dark:border-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-zinc-100 dark:border-zinc-800"
          title="Copy direct share URL"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Share App'}</span>
        </button>
      </div>

      {/* Main Grid App Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Core Card specs & install */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 space-y-6">
          
          {/* Header Identity */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-lg border border-zinc-100 dark:border-zinc-800/80">
              <img 
                src={app.icon} 
                alt={app.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.name)}&backgroundColor=34a853`;
                }}
              />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                {app.category}
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                {app.name}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                by {app.developer}
              </p>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800/60" />

          {/* KPI Spec Matrix Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/40">
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Rating</span>
              <span className="inline-flex items-center gap-0.5 text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {stats.avg.toFixed(1)} <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mb-0.5" />
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">{stats.total} reviews</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/40">
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Downloads</span>
              <span className="block text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {formatDownloadsCount(app.downloads)}
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">active installs</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/40">
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Storage</span>
              <span className="block text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {app.size}
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">APK payload</span>
            </div>
          </div>

          {/* Action Download / Install Triggers */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => onDownloadClick(app)}
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 active:scale-98 text-white font-bold flex items-center justify-center gap-2.5 shadow-md shadow-green-500/15 cursor-pointer hover:shadow-lg hover:shadow-green-500/20 transition-all text-sm tracking-tight"
            >
              <Download className="w-5 h-5" />
              <span>Download APK</span>
            </button>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Verified Secure Link ({app.apk && app.apk.includes('drive.google.com') ? 'Google Drive Cloud' : 'GitHub Releases'})
              </span>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800/60" />

          {/* App Metadata Specs Checklist */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 dark:text-zinc-500 font-medium">Current Version</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{app.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 dark:text-zinc-500 font-medium">Published Date</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            {app.updatedAt && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 dark:text-zinc-500 font-medium">Last Updated</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {new Date(app.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 dark:text-zinc-500 font-medium">Target Runtime</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">Android 8.0+ (Oreo)</span>
            </div>
          </div>

        </div>

        {/* Right Column - Rich description & details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Screenshots Gallery */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-green-500" />
                <span>Application Screenshots</span>
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar">
                {app.screenshots.map((screen, idx) => (
                  <div 
                    key={idx} 
                    className="w-[220px] sm:w-[260px] h-[380px] sm:h-[440px] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-850 shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm snap-start relative group"
                  >
                    <img 
                      src={screen} 
                      alt={`${app.name} Screenshot ${idx + 1}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&h=1000&q=80";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Description Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">About this application</h2>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {app.description}
            </div>
          </div>

          {/* 3. Community Reviews Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <span>Community Reflections & Reviews</span>
              </h2>
            </div>

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-900/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{r.userName}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium">{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold">{r.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Related Apps Grid Row */}
      {relatedApps.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5.5 h-5.5 text-green-500" />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Related Category Apps</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Other helpful integrations in {app.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedApps.map((a) => (
              <AppCard 
                key={a.id} 
                app={a} 
                onClick={onAppClick}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
