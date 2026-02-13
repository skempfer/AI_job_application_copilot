import { memo } from 'react';
import './ResultsLoadingFallback.css';

/**
 * ResultsLoadingFallback - Skeleton loader for lazy-loaded result components
 * Used as Suspense fallback while ResultsDisplay, GapAnalysisDisplay, etc. are loading
 */
export const ResultsLoadingFallback = memo(() => {
  return (
    <div className="results-loading-fallback" role="status" aria-label="Loading results">
      <div className="results-loading-fallback__content">
        <div className="results-loading-fallback__header">
          <div className="results-loading-fallback__header-label"></div>
          <div className="results-loading-fallback__header-badge"></div>
        </div>

        <div className="results-loading-fallback__section"></div>

        <div className="results-loading-fallback__text-group">
          <div className="results-loading-fallback__text-line"></div>
          <div className="results-loading-fallback__text-line results-loading-fallback__text-line--short"></div>
          <div className="results-loading-fallback__text-line results-loading-fallback__text-line--shorter"></div>
        </div>

        <div className="results-loading-fallback__footer-group">
          <div className="results-loading-fallback__footer-line results-loading-fallback__footer-line--short"></div>
          <div className="results-loading-fallback__footer-line results-loading-fallback__footer-line--medium"></div>
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
});

ResultsLoadingFallback.displayName = 'ResultsLoadingFallback';
