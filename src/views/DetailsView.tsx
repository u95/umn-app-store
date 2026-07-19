/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, Download, ShieldCheck, Share2, Check, MessageSquare, Sparkles, Box, FileText, AlertCircle, Calendar, Cpu, PenTool } from 'lucide-react';
import { AppModel, ReviewModel } from '../types';
import { INITIAL_APPS, MOCK_REVIEWS } from '../data/initialApps';
import AppCard from '../components/AppCard';
import { dbService } from '../lib/db';
import { AppTranslations } from '../data/translations';

interface DetailsViewProps {
  appId: string;
  apps: AppModel[];
  isLoading?: boolean;
  onBack: () => void;
  onAppClick: (id: string) => void;
  onDownloadClick: (app: AppModel) => void;
  language: 'en' | 'ta';
  t: AppTranslations;
}

export default function DetailsView({
  appId,
  apps,
  isLoading = false,
  onBack,
  onAppClick,
  onDownloadClick,
  language,
  t
}: DetailsViewProps) {
  const [copied, setCopied] = useState(false);
  const [dynamicApp, setDynamicApp] = useState<AppModel | null>(null);
  const [isFetchingDynamicApp, setIsFetchingDynamicApp] = useState(false);

  // Download simulation state
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  // Review submission state
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Retrieve current app details with self-healing dynamic fallback
  const app = useMemo(() => {
    const found = apps.find(a => a.id === appId);
    if (found) return found;
    if (dynamicApp && dynamicApp.id === appId) return dynamicApp;
    return INITIAL_APPS.find(a => a.id === appId) || null;
  }, [apps, appId, dynamicApp]);

  // Reset states on app change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDownloadProgress(null);
    setIsInstalling(false);
    setShowInstallHelp(false);
    setReviewSuccess(false);
    setReviewComment('');
    setReviewName('');
    setReviewRating(5);

    // Check if we need to fetch the app dynamically because it is missing in the props list
    const foundInProps = apps.find(a => a.id === appId);
    const foundInBaseline = INITIAL_APPS.find(a => a.id === appId);

    if (!foundInProps && !foundInBaseline && appId) {
      setIsFetchingDynamicApp(true);
      dbService.getAppById(appId)
        .then((fetched) => {
          if (fetched) {
            setDynamicApp(fetched);
          } else {
            setDynamicApp(null);
          }
        })
        .catch((err) => {
          console.error("Failed to dynamically fetch app details as fallback:", err);
          setDynamicApp(null);
        })
        .finally(() => {
          setIsFetchingDynamicApp(false);
        });
    } else {
      setDynamicApp(null);
    }
  }, [appId, apps]);

  // Load reviews dynamically from database service
  useEffect(() => {
    if (!app) return;
    setIsLoadingReviews(true);
    dbService.getReviews(app.id)
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
      })
      .finally(() => {
        setIsLoadingReviews(false);
      });
  }, [app]);

  // Compute average rating and count
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: app ? app.rating : 4.8, total: 0 };
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: totalRating / reviews.length,
      total: reviews.length
    };
  }, [reviews, app]);

  // Gather related apps of same category (excluding current app)
  const relatedApps = useMemo(() => {
    if (!app) return [];
    return apps
      .filter(a => a.category === app.category && a.id !== app.id && a.status === 'published')
      .slice(0, 4);
  }, [apps, app]);

  if (isLoading || isFetchingDynamicApp) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{t.loadingDetails}</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">!</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t.appNotFound}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          {t.appNotFoundDesc}
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToStore}</span>
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
    if (language === 'ta') {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + ' மில்லியன்+';
      if (num >= 1000) return (num / 1000).toFixed(1) + ' ஆயிரம்+';
      return num.toString() + ' பதிவிறக்கங்கள்';
    }
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    return num.toString();
  };

  // Simulated Download Progress Launcher
  const handleSimulateDownload = () => {
    if (downloadProgress !== null) return; // Already running
    setDownloadProgress(0);
    setIsInstalling(true);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          // Trigger actual external link download
          onDownloadClick(app);
          setTimeout(() => {
            setIsInstalling(false);
            setShowInstallHelp(true);
          }, 800);
          return 100;
        }
        return prev + 10;
      });
    }, 180);
  };

  // Review submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim() || !app) return;

    try {
      const newRev = await dbService.addReview(app.id, {
        userName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: new Date().toISOString().split('T')[0]
      });

      setReviews(prev => [newRev, ...prev]);
      setReviewSuccess(true);
      setReviewComment('');
      setReviewName('');
      setReviewRating(5);
      
      // If parent has exposed app loading, refresh the global catalog stats
      if (typeof window !== "undefined" && (window as any).loadApps) {
        try {
          (window as any).loadApps();
        } catch (err) {
          console.warn("Could not reload parent apps listing:", err);
        }
      }

      // Clear success banner after 5 seconds
      setTimeout(() => {
        setReviewSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Failed to submit review via database service:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 pb-24 animate-slide-up font-sans" id={`details-view-${app.id}`}>
      
      {/* Back Button Rail */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-zinc-100 dark:border-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToStore}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-zinc-100 dark:border-zinc-800"
          title="Copy direct share URL"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? (language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link Copied!') : (language === 'ta' ? 'செயலியைப் பகிர்' : 'Share App')}</span>
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
                {language === 'ta' ? (app.category === 'Bible' ? 'பைபிள் / வேதாகமம்' : app.category === 'Music' ? 'பாடல்கள் / இசை' : app.category) : app.category}
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
              <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.ratingAverage}</span>
              <span className="inline-flex items-center gap-0.5 text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {stats.avg.toFixed(1)} <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mb-0.5" />
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">{stats.total} {t.reviewsCount}</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.downloads}</span>
              <span className="block text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {formatDownloadsCount(app.downloads)}
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">{t.activeInstalls}</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.size}</span>
              <span className="block text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                {app.size}
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">{t.apkPayload}</span>
            </div>
          </div>

          {/* Action Download / Install Triggers with simulation and progress */}
          <div className="space-y-3 pt-2">
            {downloadProgress === null ? (
              <button
                onClick={handleSimulateDownload}
                className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 active:scale-98 text-white font-bold flex items-center justify-center gap-2.5 shadow-md shadow-green-500/15 cursor-pointer hover:shadow-lg hover:shadow-green-500/20 transition-all text-sm tracking-tight"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>{t.downloadApk}</span>
              </button>
            ) : (
              <div className="w-full bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-4 border border-green-500/20 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    {downloadProgress < 100 
                      ? t.downloading.replace('{progress}', downloadProgress.toString())
                      : (language === 'ta' ? 'பதிவிறக்கம் முடிந்தது!' : 'Download Complete!')}
                  </span>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{downloadProgress}%</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {t.verifySecure}
              </span>
            </div>
          </div>

          {/* Android Installation Interactive Help Guide */}
          {showInstallHelp && (
            <div className="p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs space-y-2.5 animate-slide-up">
              <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{language === 'ta' ? 'ஆண்ட்ராய்டு APK நிறுவும் முறை' : 'How to install this downloaded APK?'}</span>
              </h4>
              <ol className="list-decimal pl-4.5 space-y-1.5 text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                <li>{language === 'ta' ? 'பதிவிறக்கம் செய்யப்பட்ட .apk கோப்பை அழுத்தவும்.' : 'Click and open the downloaded .apk file.'}</li>
                <li>{language === 'ta' ? 'கேட்கப்பட்டால், "Allow from this source" அல்லது "அறியப்படாத ஆதாரங்கள்" என்பதை அனுமதிக்கவும்.' : 'If prompted, authorize installation from "Unknown Sources" or your web browser.'}</li>
                <li>{language === 'ta' ? '"Install" பொத்தானை அழுத்தி வெற்றிகரமாக இயக்கவும்.' : 'Hit "Install" to complete and run the utility smoothly!'}</li>
              </ol>
            </div>
          )}

          <hr className="border-zinc-100 dark:border-zinc-800/60" />

          {/* App Metadata Specs Checklist */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 dark:text-zinc-500 font-semibold">{t.version}</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{app.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 dark:text-zinc-500 font-semibold">{t.publishedOn}</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {new Date(app.createdAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            {app.updatedAt && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 dark:text-zinc-500 font-semibold">{t.lastUpdated}</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {new Date(app.updatedAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 dark:text-zinc-500 font-semibold">{t.targetRuntime}</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">Android 8.0+ (Oreo)</span>
            </div>
          </div>

        </div>

        {/* Right Column - Rich description, screenshots, and review form */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Screenshots Gallery */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-green-500" />
                <span>{t.screenshots}</span>
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
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              <span>{t.aboutApp}</span>
            </h2>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {app.description}
            </div>
          </div>

          {/* 3. Community Reviews & Submit New Review */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 space-y-8">
            
            {/* Form Title & Review Submission */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-green-500" />
                <span>{t.writeReview}</span>
              </h2>

              <form onSubmit={handleAddReview} className="space-y-4">
                {reviewSuccess && (
                  <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-xl border border-green-500/20">
                    {t.successReview}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500">{t.yourNameLabel}</label>
                    <input 
                      type="text" 
                      placeholder={language === 'ta' ? "உதாரணம்: அன்பரசன் / அருப்புக்கோட்டை" : "e.g. John Doe / Bethesda"}
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:border-green-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500">{t.starRating}</label>
                    <div className="flex gap-1 items-center h-11">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer transition-transform active:scale-90"
                        >
                          <Star 
                            className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500">{t.reviewCommentLabel}</label>
                  <textarea 
                    rows={3}
                    placeholder={t.reviewPlaceholder}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:border-green-500 outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {t.submitReview}
                </button>
              </form>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800/60" />

            {/* List of Reviews */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <span>{language === 'ta' ? 'அனைத்து மதிப்புரைகள் & கருத்துகள்' : 'All Community Reflections'}</span>
              </h2>

              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-900/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{r.userName}</h4>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          {new Date(r.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US')}
                        </p>
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

      </div>

      {/* Related Apps Grid Row */}
      {relatedApps.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5.5 h-5.5 text-green-500" />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">{t.relatedApps}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {language === 'ta' ? `தொடர்புடையப் பிரிவில் உள்ள பிற பயனுள்ள செயலிகள்` : `Other helpful integrations in same category`}
              </p>
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
