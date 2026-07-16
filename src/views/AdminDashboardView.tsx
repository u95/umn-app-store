/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, Plus, Search, LogOut, Trash2, Edit2, Download, Star, 
  Layers, Database, Calendar, AppWindow, FileText, CheckCircle, 
  X, HelpCircle, ArrowUpRight, AlertCircle, RefreshCw, Zap, Sparkles
} from 'lucide-react';
import { AppModel, CategoryType } from '../types';
import { getApiUrl } from '../lib/db';

interface AdminDashboardViewProps {
  apps: AppModel[];
  onLogout: () => void;
  onAddApp: (app: Omit<AppModel, 'id'>) => Promise<string>;
  onUpdateApp: (id: string, app: Partial<AppModel>) => Promise<void>;
  onDeleteApp: (id: string) => Promise<void>;
  currentUser: { uid: string; email: string } | null;
}

const CATEGORIES: CategoryType[] = ['Bible', 'Music', 'Games', 'Tools', 'Lifestyle', 'Education', 'Books'];

export default function AdminDashboardView({
  apps,
  onLogout,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
  currentUser
}: AdminDashboardViewProps) {
  // Console state tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryType>('All');
  
  // Drawer/Modal Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null); // null = Creating, string = Editing
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [appName, setAppName] = useState('');
  const [appDeveloper, setAppDeveloper] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [appCategory, setAppCategory] = useState<CategoryType>('Tools');
  const [appDescription, setAppDescription] = useState('');
  const [appApkUrl, setAppApkUrl] = useState('');
  const [appIconUrl, setAppIconUrl] = useState('');
  const [appScreenshots, setAppScreenshots] = useState(''); // Comma-separated
  const [appRating, setAppRating] = useState('4.5');
  const [appSize, setAppSize] = useState('12.5 MB');
  const [appStatus, setAppStatus] = useState<'published' | 'draft' | 'suspended'>('published');
  const [isFeatured, setIsFeatured] = useState(false);

  // AI description generator states and handler
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleAiGenerateDescription = async () => {
    if (!appName.trim()) {
      alert("தயவுசெய்து முதலில் செயலியின் பெயரை (App Name) உள்ளிடவும்.");
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const res = await fetch(getApiUrl("/api/ai/generate-description"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: appName,
          category: appCategory,
          features: appDescription,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setAppDescription(data.description);
    } catch (e) {
      alert("AI விளக்கம் உருவாக்க முடியவில்லை. உங்கள் .env கோப்பில் GEMINI_API_KEY உள்ளதா என சரிபார்க்கவும்.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Computed Console Stats
  const stats = useMemo(() => {
    const total = apps.length;
    const totalDownloads = apps.reduce((sum, a) => sum + (a.downloads || 0), 0);
    const avgRating = total > 0 ? apps.reduce((sum, a) => sum + (a.rating || 0), 0) / total : 0;
    const publishedCount = apps.filter(a => a.status === 'published').length;
    const draftCount = apps.filter(a => a.status === 'draft').length;
    
    // Distribution for charts
    const catDistribution = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = apps.filter(a => a.category === cat).length;
      return acc;
    }, {} as Record<CategoryType, number>);

    return {
      total,
      totalDownloads,
      avgRating,
      publishedCount,
      draftCount,
      catDistribution
    };
  }, [apps]);

  // Filter list inside management grid
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || app.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [apps, searchQuery, selectedCategory]);

  // Open form for Create
  const handleOpenCreate = () => {
    setEditingAppId(null);
    setAppName('');
    setAppDeveloper('');
    setAppVersion('1.0.0');
    setAppCategory('Tools');
    setAppDescription('');
    setAppApkUrl('');
    setAppIconUrl('');
    setAppScreenshots('');
    setAppRating('4.5');
    setAppSize('12.5 MB');
    setAppStatus('published');
    setIsFeatured(false);
    setFormError(null);
    setFormSuccess(false);
    setIsFormOpen(true);
  };

  // Open form for Edit
  const handleOpenEdit = (app: AppModel) => {
    setEditingAppId(app.id);
    setAppName(app.name);
    setAppDeveloper(app.developer);
    setAppVersion(app.version);
    setAppCategory(app.category as CategoryType);
    setAppDescription(app.description);
    setAppApkUrl(app.apk);
    setAppIconUrl(app.icon);
    setAppScreenshots(app.screenshots ? app.screenshots.join(', ') : '');
    setAppRating(app.rating.toString());
    setAppSize(app.size);
    setAppStatus(app.status);
    setIsFeatured(!!app.featured);
    setFormError(null);
    setFormSuccess(false);
    setIsFormOpen(true);
  };

  // Auto-fill mock visuals helper
  const handleAutoFillMockMedia = () => {
    const unsplashIcons = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&h=150&q=80'
    ];
    const unsplashScreens = [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&h=1000&q=80',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&h=1000&q=80',
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=600&h=1000&q=80'
    ];

    const randomIcon = unsplashIcons[Math.floor(Math.random() * unsplashIcons.length)];
    setAppIconUrl(randomIcon);
    setAppScreenshots(unsplashScreens.join(', '));
    
    // Inject a sample APK download URL based on name or defaults
    const idSlug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'app-slug';
    setAppApkUrl(`https://github.com/umnministry/${idSlug}/releases/download/v${appVersion}/${idSlug}.apk`);
  };

  // Form Submit Execution
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appDeveloper || !appApkUrl || !appIconUrl) {
      setFormError("All fields with asterisks (*) are strictly required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // Format Screenshots list
    const screenshotList = appScreenshots
      ? appScreenshots.split(',').map(s => s.trim()).filter(Boolean)
      : [appIconUrl]; // fallback icon as screenshot

    const payload = {
      name: appName,
      developer: appDeveloper,
      version: appVersion,
      category: appCategory,
      description: appDescription || `Explore the core features of ${appName} designed by ${appDeveloper}.`,
      apk: appApkUrl,
      icon: appIconUrl,
      screenshots: screenshotList,
      downloads: editingAppId ? apps.find(a => a.id === editingAppId)?.downloads || 0 : 0,
      rating: parseFloat(appRating) || 4.5,
      size: appSize,
      status: appStatus,
      featured: isFeatured,
      trending: false,
      createdAt: editingAppId ? apps.find(a => a.id === editingAppId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    try {
      if (editingAppId) {
        await onUpdateApp(editingAppId, payload);
      } else {
        await onAddApp(payload);
      }
      setFormSuccess(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setFormSuccess(false);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit database entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action Trigger
  const handleDeleteTrigger = async (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete the "${name}" application? This cannot be undone.`)) {
      try {
        await onDeleteApp(id);
      } catch (err: any) {
        alert("Failed to delete application from database: " + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in" id="console-workspace-container">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden select-none">
        {/* Background vector */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
          <Database className="w-96 h-96" />
        </div>

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-green-400">Play Console Working Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight">UMN Publisher Portal</h1>
          <p className="text-xs text-zinc-400 max-w-xl font-medium leading-relaxed">
            Welcome back, <span className="text-green-400 font-bold">{currentUser?.email || 'admin@umn.edu'}</span>. Manage store catalogs, review real-time download parameters, and publish verified application files directly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 pt-2 md:pt-0">
          <button
            onClick={handleOpenCreate}
            className="h-11 px-5 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-zinc-950 font-bold flex items-center gap-1.5 shadow-md shadow-green-500/10 cursor-pointer transition-all text-xs sm:text-sm"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Publish New App</span>
          </button>
          
          <button
            onClick={onLogout}
            className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:text-red-400 text-zinc-300 font-semibold flex items-center justify-center gap-2 transition-colors border border-zinc-700/60"
            title="Log out of play console"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Subnavigation Tab Tabs */}
      <div className="flex border-b border-zinc-150 dark:border-zinc-850 gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-bold text-sm tracking-tight border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-green-500 text-green-600 dark:text-green-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <LayoutGrid className="w-4.5 h-4.5" />
          <span>Dashboard Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 font-bold text-sm tracking-tight border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-green-500 text-green-600 dark:text-green-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Database className="w-4.5 h-4.5" />
          <span>App Inventory ({apps.length})</span>
        </button>
      </div>

      {/* VIEW 1: Dashboard Overview Panel */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Console Catalog</span>
                <AppWindow className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.total}</span>
                <span className="text-xs text-zinc-400 block mt-1 font-semibold">Total registered applications</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Downloads</span>
                <Download className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {stats.totalDownloads.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400 block mt-1 font-semibold">Accumulated global downloads</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Worship Quality</span>
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {stats.avgRating.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400 block mt-1 font-semibold">Average rating score</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Catalog Status</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.publishedCount}</span>
                <span className="text-xs text-zinc-400 block mt-1 font-semibold">{stats.draftCount} drafts pending release</span>
              </div>
            </div>
          </div>

          {/* Deep Analytics Graph Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* SVG Categories Chart Column */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
              <div className="pb-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Application Category Distribution</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Visual mapping of publications grouped by functional genres</p>
              </div>

              {/* Elegant SVG bar chart */}
              <div className="h-[200px] flex items-end justify-between gap-3 pt-6 border-b border-zinc-100 dark:border-zinc-800 px-4">
                {CATEGORIES.map((cat) => {
                  const val = stats.catDistribution[cat] || 0;
                  const maxVal = Math.max(...(Object.values(stats.catDistribution) as number[]), 1);
                  const percentage = (val / maxVal) * 100;
                  return (
                    <div key={cat} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      {/* Bar Value Tooltip */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-850 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md mb-1 select-none pointer-events-none">
                        {val}
                      </span>
                      {/* SVG Bar */}
                      <div 
                        className="w-full bg-green-500/10 hover:bg-green-500 dark:bg-green-500/15 dark:hover:bg-green-400 rounded-t-lg transition-all duration-300"
                        style={{ height: `${Math.max(percentage, 5)}%` }}
                      />
                      <span className="text-[10px] font-bold text-zinc-400 truncate w-full text-center">
                        {cat}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Panel Column */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-1.5">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Developer Quick Actions</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Convenience operations for catalog administrators</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleOpenCreate}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-50 hover:bg-green-500/5 dark:bg-zinc-950 dark:hover:bg-green-500/5 border border-zinc-150 dark:border-zinc-850 hover:border-green-500/30 rounded-2xl text-left cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">Release App Update</span>
                      <span className="block text-[10px] text-zinc-400">Publish APK, description, or version updates</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-green-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>

                <button
                  onClick={() => { setActiveTab('inventory'); }}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-50 hover:bg-green-500/5 dark:bg-zinc-950 dark:hover:bg-green-500/5 border border-zinc-150 dark:border-zinc-850 hover:border-green-500/30 rounded-2xl text-left cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">Catalog Inventory</span>
                      <span className="block text-[10px] text-zinc-400">Audit {apps.length} published or draft entries</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-green-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                <strong>Console Security Reminder:</strong> Avoid distributing production console credentials. Always use secure GitHub Release endpoints for binary APK downloads.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: App Inventory Management Panel */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6">
          
          {/* Search/Filter Controls Rail */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
            
            {/* Left Filter Row */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Internal Search */}
              <div className="relative flex items-center h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 w-full sm:w-64">
                <Search className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search app inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none pl-2.5 text-xs text-zinc-850 dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as 'All' | CategoryType)}
                className="h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer focus:border-green-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Right publish quick button */}
            <button
              onClick={handleOpenCreate}
              className="h-10 px-4.5 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register Application</span>
            </button>
          </div>

          {/* Core App Listing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-zinc-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Application Details</th>
                  <th className="py-3 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Storage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/40 transition-colors">
                      {/* Identity Column */}
                      <td className="py-4 px-4 flex items-center gap-3.5 min-w-[200px]">
                        <img 
                          src={app.icon} 
                          alt={app.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-100 dark:border-zinc-800"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.name)}`;
                          }}
                        />
                        <div className="min-w-0">
                          <span className="block font-bold text-zinc-900 dark:text-zinc-100 truncate text-sm">
                            {app.name}
                          </span>
                          <span className="block text-[10px] text-zinc-400 font-mono">
                            {app.version} • by {app.developer}
                          </span>
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                          {app.category}
                        </span>
                      </td>

                      {/* Downloads Column */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {app.downloads.toLocaleString()}
                        </span>
                      </td>

                      {/* Size Column */}
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="font-mono text-zinc-500">{app.size}</span>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'published' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : app.status === 'suspended'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-zinc-150 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.status === 'published' ? 'bg-emerald-500' : app.status === 'suspended' ? 'bg-red-500' : 'bg-zinc-400'
                          }`} />
                          <span>{app.status}</span>
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(app)}
                            className="p-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800 hover:border-green-500/30 text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                            title="Edit App Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(app.id, app.name)}
                            className="p-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      <AlertCircle className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                      <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">No applications found inside management directory</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Adjust your search parameters or register a new app above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* DYNAMIC FORM DRAWER: Upload / Edit Application Panel */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none animate-fade-in" id="form-drawer-overlay">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative space-y-6">
            
            {/* Drawer Header */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                    {editingAppId ? <Edit2 className="w-5.5 h-5.5 text-green-500" /> : <Plus className="w-5.5 h-5.5 text-green-500" />}
                    <span>{editingAppId ? 'Modify Application Console' : 'Register Application'}</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Provide verified Google Play metadata and deployment endpoints.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Autocomplete Helper Trigger */}
              {!editingAppId && (
                <button
                  type="button"
                  onClick={handleAutoFillMockMedia}
                  className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-500/20 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/60"
                  title="Auto-completes mock icon and screenshot URLs for fast evaluation"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>⚡ Quick Demo Autocomplete</span>
                </button>
              )}
            </div>

            {/* Error / Success Banners */}
            {formError && (
              <div className="flex gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="flex gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold leading-relaxed">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 animate-bounce" />
                <span>Success! Application catalog database entry has been saved successfully.</span>
              </div>
            )}

            {/* Core Scroll Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 space-y-5 overflow-y-auto pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* App Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    App Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UMN Bible Daily"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                  />
                </div>

                {/* Developer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    Developer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UMN Ministry Devs"
                    value={appDeveloper}
                    onChange={(e) => setAppDeveloper(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Version */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    Version Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.0.0"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    Category *
                  </label>
                  <select
                    value={appCategory}
                    onChange={(e) => setAppCategory(e.target.value as CategoryType)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-semibold text-zinc-750 dark:text-zinc-300 outline-none cursor-pointer focus:border-green-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Payload Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    Storage Size *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="15.4 MB"
                    value={appSize}
                    onChange={(e) => setAppSize(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* APK Download URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                  APK Host URL (GitHub Release) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/umnministry/bible-app/releases/download/v1.0.0/app-release.apk"
                  value={appApkUrl}
                  onChange={(e) => setAppApkUrl(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                />
              </div>

              {/* Icon Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                  App Launcher Icon URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-... (or other direct link)"
                  value={appIconUrl}
                  onChange={(e) => setAppIconUrl(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                />
              </div>

              {/* Screenshots List */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                  Screenshots Gallery (Optional - Comma separated URLs)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                  value={appScreenshots}
                  onChange={(e) => setAppScreenshots(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500 leading-normal"
                />
              </div>

              {/* Rating and Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    Initial Star Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    placeholder="4.5"
                    value={appRating}
                    onChange={(e) => setAppRating(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-0.5">
                    Release Status *
                  </label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as 'published' | 'draft' | 'suspended')}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-semibold text-zinc-750 dark:text-zinc-300 outline-none cursor-pointer focus:border-green-500"
                  >
                    <option value="published">Published (Visible in store)</option>
                    <option value="draft">Draft (Visible only in console)</option>
                    <option value="suspended">Suspended (Offline)</option>
                  </select>
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center justify-start h-11 pt-5">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-zinc-650 dark:text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-green-500 focus:ring-green-500/25 border-zinc-350 dark:border-zinc-800"
                    />
                    <span>Flag as Featured (Home Banner)</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-0.5 pr-1">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Google Play Description *
                  </label>
                  <button
                    type="button"
                    disabled={isGeneratingDescription}
                    onClick={handleAiGenerateDescription}
                    className="flex items-center gap-1 text-[10px] font-black tracking-tight text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-2.5 py-1 rounded-lg cursor-pointer shadow shadow-green-500/10 disabled:opacity-50 transition-all select-none"
                    title="Generate description with Gemini AI"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                    <span>{isGeneratingDescription ? "AI Writing..." : "Gemini AI மூலம் எழுதுக"}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed app summary, release notes, or instructions..."
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs font-medium text-zinc-850 dark:text-zinc-100 outline-none focus:border-green-500 leading-relaxed"
                />
              </div>

            </form>

            {/* Bottom Form Actions Drawer Footer */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 justify-end bg-white dark:bg-zinc-900 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-650 dark:text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={isSubmitting || formSuccess}
                className="h-11 px-6 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronizing database...</span>
                  </>
                ) : (
                  <span>{editingAppId ? 'Save Console Changes' : 'Release Application'}</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
