import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-800/80 rounded-md" />
          <div className="h-8 w-64 bg-slate-800/80 rounded-xl" />
        </div>
        <div className="h-10 w-36 bg-slate-800/80 rounded-xl" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="glass-panel p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-20 h-20 rounded-full bg-slate-800/80 shrink-0" />
            <div className="space-y-2 flex-1 max-w-md">
              <div className="h-4 w-28 bg-slate-800/80 rounded-md" />
              <div className="h-6 w-3/4 bg-slate-800/80 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-800/80 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="h-16 w-28 bg-slate-800/80 rounded-xl" />
            <div className="h-16 w-28 bg-slate-800/80 rounded-xl" />
            <div className="h-16 w-28 bg-slate-800/80 rounded-xl col-span-2 sm:col-span-1" />
          </div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Checklist Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-slate-800/80 rounded-lg" />
            <div className="h-6 w-24 bg-slate-800/80 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel p-5 border border-slate-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-slate-800/80 rounded" />
                    <div className="h-3 w-24 bg-slate-800/80 rounded" />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Metrics Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-slate-800/60 space-y-4">
            <div className="h-5 w-36 bg-slate-800/80 rounded" />
            <div className="h-16 w-full bg-slate-800/80 rounded-xl" />
          </div>
          <div className="glass-panel p-6 border border-slate-800/60 space-y-4">
            <div className="h-5 w-40 bg-slate-800/80 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-slate-800/80 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
