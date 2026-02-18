import { useEffect, useState } from 'react';
import './LoadingState.css';

interface LoadingStateProps {
  stage?: number;
  message?: string;
  show?: boolean;
}

export const LoadingState = ({ stage = 0, message, show = true }: LoadingStateProps) => {
  const [displayStage, setDisplayStage] = useState(stage);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setDisplayStage(stage);
    setFadeOut(false);
  }, [stage]);

  useEffect(() => {
    if (message) return;

    const timer = setTimeout(() => {
      if (displayStage < 3) {
        setFadeOut(true);
        setTimeout(() => {
          setDisplayStage((prev) => Math.min(prev + 1, 3));
          setFadeOut(false);
        }, 300);
      }
    }, 2000);

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
