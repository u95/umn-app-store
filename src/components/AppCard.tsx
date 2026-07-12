/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Download, Eye } from 'lucide-react';
import { AppModel } from '../types';

interface AppCardProps {
  key?: string;
  app: AppModel;
  onClick: (id: string) => void;
  onDownloadClick?: (app: AppModel, e: React.MouseEvent) => void;
}

export default function AppCard({ app, onClick, onDownloadClick }: AppCardProps) {
  
  // Format downloads to look professional (e.g., 1.2K, 500k, etc)
  const formatDownloads = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <div 
      onClick={() => onClick(app.id)}
      className="group relative flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-green-500/30 dark:hover:border-green-500/30 hover:shadow-lg dark:hover:shadow-green-950/5 rounded-2xl p-4 cursor-pointer transition-all duration-300"
      id={`app-card-${app.id}`}
    >
      <div className="flex gap-4">
        {/* App Icon */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-800 group-hover:scale-105 transition-transform duration-300">
          <img 
            src={app.icon} 
            alt={`${app.name} Icon`} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Custom graphic design fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.name)}&backgroundColor=34a853,2e7d32,1b5e20&chars=2`;
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full mb-1">
            {app.category}
          </span>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tracking-tight leading-snug truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate mb-1">
            by {app.developer}
          </p>
          
          {/* Version / Size indicator */}
          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            {app.version} • {app.size}
          </p>
        </div>
      </div>

      {/* Ratings and Downloads info strip */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          <span className="font-bold text-zinc-700 dark:text-zinc-300">{app.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1 font-medium">
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>{formatDownloads(app.downloads)} downloads</span>
        </div>
      </div>

      {/* Responsive View / Install trigger */}
      <div className="mt-4 flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick(app.id);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
        {onDownloadClick && (
          <button 
            onClick={(e) => onDownloadClick(app, e)}
            className="flex items-center justify-center w-10 h-9 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-xs hover:shadow-md transition-all active:scale-95"
            title="Download APK"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
