/**
 * Splash Screen - First impression for Viora
 * Displays animated logo with message during app initialization
 * 
 * Use cases:
 * - App startup/loading
 * - Brand introduction
 * - Loading state with feedback
 */

import { LogoAnimated } from './LogoAnimated';
import './SplashScreen.css';

interface SplashScreenProps {
  show: boolean; // Control visibility
  message?: string; // Optional loading message
  subtitle?: string; // Optional subtitle
  duration?: number; // Auto-hide after duration (ms), 0 = no auto-hide
}

export function SplashScreen({
  show,
  message = 'Loading...',
  subtitle = 'Clarity for smarter career decisions',
  duration = 0,
}: SplashScreenProps) {
  if (!show) return null;

  return (
    <div className="splash-screen" role="status" aria-label={message || 'Loading application'}>
      {/* Fade out animation after duration */}
      {duration > 0 && (
        <style>{`
          .splash-screen {
            animation: splash-fade-out ${duration}ms ease-out forwards;
          }
          @keyframes splash-fade-out {
            0% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; pointer-events: none; }
          }
        `}</style>
      )}

      <div className="splash-content">
        {/* Animated Logo */}
        <div className="splash-logo">
          <LogoAnimated size={80} showAnimation={true} />
        </div>

        {/* Message */}
        {message && (
          <h1 className="splash-message">{message}</h1>
        )}

        {/* Subtitle - Words appear one by one */}
        {subtitle && (
          <p className="splash-subtitle">
            {subtitle.split(' ').map((word, index) => (
              <span
                key={index}
                className="subtitle-word"
                style={{
                  animationDelay: `${0.5 + index * 0.15}s`,
                }}
              >
                {word}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
