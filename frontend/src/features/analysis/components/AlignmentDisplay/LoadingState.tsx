import { useEffect, useState } from 'react';
import './LoadingState.css';

interface LoadingStateProps {
  /**
   * Current loading stage (0-3)
   * 0: Parsing CV
   * 1: Analyzing requirements
   * 2: Generating insights
   * 3: Complete
   */
  stage?: number;
  /**
   * Optional custom message to show instead of staged messages
   */
  message?: string;
  /**
   * Show loading state
   */
  show?: boolean;
}

/**
 * Loading state component with staged messages
 *
 * Shows different messages as analysis progresses:
 * Stage 0: "Parsing your CV..."
 * Stage 1: "Analyzing job requirements..."
 * Stage 2: "Generating insights..."
 * Stage 3: "Complete"
 *
 * Messages automatically progress through stages if no custom message provided
 */
export const LoadingState = ({ stage = 0, message, show = true }: LoadingStateProps) => {
  const [displayStage, setDisplayStage] = useState(stage);
  const [fadeOut, setFadeOut] = useState(false);

  // Update stage when prop changes
  useEffect(() => {
    setDisplayStage(stage);
    setFadeOut(false);
  }, [stage]);

  // Auto-progress through stages when no custom message
  useEffect(() => {
    if (message) return; // Don't auto-progress if custom message

    const timer = setTimeout(() => {
      if (displayStage < 3) {
        setFadeOut(true);
        setTimeout(() => {
          setDisplayStage((prev) => Math.min(prev + 1, 3));
          setFadeOut(false);
        }, 300); // Match CSS transition
      }
    }, 2000); // Show each stage for 2 seconds

    return () => clearTimeout(timer);
  }, [displayStage, message]);

  if (!show) return null;

  const stagedMessages = [
    {
      emoji: '📄',
      text: 'Parsing your CV...',
      subtext: 'Extracting skills and experience',
    },
    {
      emoji: '🔍',
      text: 'Analyzing job requirements...',
      subtext: 'Matching your profile to the role',
    },
    {
      emoji: '✨',
      text: 'Generating insights...',
      subtext: 'Creating personalized recommendations',
    },
    {
      emoji: '✅',
      text: 'Analysis complete',
      subtext: 'Your results are ready',
    },
  ];

  const currentMessage =
    message || stagedMessages[displayStage] || stagedMessages[0];

  return (
    <div className={`loading-state ${fadeOut ? 'loading-state--fade-out' : ''}`}>
      <div className="loading-state__container">
        <div className="loading-state__spinner">
          <div className="spinner-ring"></div>
        </div>

        <div className="loading-state__content">
          {typeof currentMessage === 'string' ? (
            <p className="loading-state__message">{currentMessage}</p>
          ) : (
            <>
              <div className="loading-state__emoji">{currentMessage.emoji}</div>
              <h3 className="loading-state__message">{currentMessage.text}</h3>
              <p className="loading-state__subtext">{currentMessage.subtext}</p>
            </>
          )}
        </div>

        {!message && displayStage < 3 && (
          <div className="loading-state__progress">
            <div className="progress-bar">
              <div
                className="progress-bar__fill"
                style={{ width: `${((displayStage + 1) / 4) * 100}%` }}
              ></div>
            </div>
            <p className="progress-bar__label">
              {displayStage + 1} of 3 steps
            </p>
          </div>
        )}

        {displayStage === 3 && (
          <p className="loading-state__complete">Analysis is ready!</p>
        )}
      </div>
    </div>
  );
};
