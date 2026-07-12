/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 animate-pulse flex flex-col h-full shadow-xs">
      <div className="flex gap-4 items-center">
        {/* App Icon placeholder */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        
        {/* Details placeholder */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-3/4" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-1/2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-1/3" />
        </div>
      </div>
      
      {/* Lower specs placeholder */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-16" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-12" />
      </div>
      
      {/* Button placeholder */}
      <div className="mt-4 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full" />
    </div>
  );
}
