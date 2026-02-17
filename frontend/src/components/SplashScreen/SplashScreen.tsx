import { LogoAnimated } from '../Logo/LogoAnimated';
import './SplashScreen.css';

interface SplashScreenProps {
  show: boolean;
  message?: string;
  subtitle?: string;
  duration?: number;
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
        <div className="splash-logo">
          <LogoAnimated size={80} showAnimation={true} />
        </div>

        {message && (
          <h1 className="splash-message">{message}</h1>
        )}

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
