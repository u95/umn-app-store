/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { AppModel } from '../types';

interface AppSliderProps {
  featuredApps: AppModel[];
  onAppClick: (id: string) => void;
}

export default function AppSlider({ featuredApps, onAppClick }: AppSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play timer for slide rotations
  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredApps]);

  if (featuredApps.length === 0) return null;

  const currentApp = featuredApps[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  };

  return (
    <div 
      onClick={() => onAppClick(currentApp.id)}
      className="relative w-full h-[260px] sm:h-[320px] rounded-3xl overflow-hidden cursor-pointer group shadow-lg border border-zinc-100 dark:border-zinc-900 select-none"
      id="featured-slider"
    >
      {/* Background Graphic Overlay */}
      <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-zinc-950/15 transition-all duration-350 z-10" />
      
      {/* Blurred background backup for aesthetics */}
      <div className="absolute inset-0 bg-cover bg-center scale-105 blur-lg opacity-40 select-none pointer-events-none" style={{ backgroundImage: `url(${currentApp.icon})` }} />

      {/* Visual background (Gradients + Icon theme) */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-transparent z-10" />
      
      {/* Absolute slider image container */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 h-full z-0 overflow-hidden">
        <div className="w-full h-full relative">
          <img 
            src={currentApp.screenshots[0] || currentApp.icon} 
            alt={currentApp.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center translate-x-12 scale-105 group-hover:scale-110 group-hover:translate-x-6 transition-all duration-700 opacity-60"
          />
          {/* Edge smoothing overlay */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-900/90 to-transparent hidden sm:block" />
        </div>
      </div>

      {/* Slide Details Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-8 md:p-10 text-white">
        
        {/* Upper Tag */}
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full uppercase">
            ★ Featured App
          </span>
        </div>

        {/* Core details */}
        <div className="max-w-md space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md shrink-0 border border-white/20">
              <img 
                src={currentApp.icon} 
                alt={currentApp.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentApp.name)}`;
                }}
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight line-clamp-1">
                {currentApp.name}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-300">
                {currentApp.developer}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {currentApp.description}
          </p>

          <div className="flex items-center gap-4 text-xs sm:text-sm pt-1">
            <div className="flex items-center gap-1 font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <span>{currentApp.rating.toFixed(1)}</span>
            </div>
            <span className="text-zinc-400">•</span>
            <span className="font-semibold text-zinc-200">{currentApp.category}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-300">{currentApp.size}</span>
          </div>
        </div>

        {/* Interactive Dots and Buttons */}
        <div className="flex items-center justify-between pt-2">
          {/* Slide Dots Indicator */}
          <div className="flex items-center gap-1.5 z-30">
            {featuredApps.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-green-500' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-2 z-30">
            {featuredApps.length > 1 && (
              <div className="flex gap-1.5 mr-2">
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 transition-all text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 transition-all text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => onAppClick(currentApp.id)}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs sm:text-sm font-bold bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-md shadow-green-600/20 transition-all"
            >
              <span>Explore App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
