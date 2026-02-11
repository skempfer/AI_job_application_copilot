import { memo } from 'react';

/**
 * ResultsLoadingFallback - Skeleton loader for lazy-loaded result components
 * Used as Suspense fallback while ResultsDisplay, GapAnalysisDisplay, etc. are loading
 */
export const ResultsLoadingFallback = memo(() => {
  return (
    <div className="card animate-pulse" role="status" aria-label="Loading results">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>

        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        </div>

        <div className="space-y-2 mt-6">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
});

ResultsLoadingFallback.displayName = 'ResultsLoadingFallback';
