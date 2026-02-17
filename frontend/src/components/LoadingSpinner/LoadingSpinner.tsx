import { LogoAnimated } from '../Logo/LogoAnimated';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  show: boolean;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean; 
}

const sizeMap = {
  small: 48,
  medium: 64,
  large: 96,
};

export function LoadingSpinner({
  show,
  size = 'medium',
  message,
  overlay = false,
}: LoadingSpinnerProps) {
  if (!show) return null;

  const svgSize = sizeMap[size];

  const content = (
    <div className={`loading-spinner loading-spinner-${size}`} role="status" aria-live="polite" aria-label={message || 'Loading'}>
      <LogoAnimated size={svgSize} showAnimation={true} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay" role="presentation" aria-hidden="false">
        {content}
      </div>
    );
  }

  return content;
}
