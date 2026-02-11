/**
 * Loading Spinner - Viora branded loading state
 * Uses animated logo for visual feedback
 * 
 * Use cases:
 * - API requests in progress
 * - Data processing
 * - Background tasks
 */

import { LogoAnimated } from './LogoAnimated';
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
    <div className={`loading-spinner loading-spinner-${size}`}>
      <LogoAnimated size={svgSize} showAnimation={true} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
}
