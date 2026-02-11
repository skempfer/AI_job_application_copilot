/**
 * Viora Animated Logo Component
 * Subtle, premium animation: ring draw + core pulse
 * 
 * Use cases:
 * - Splash screen on app load
 * - Loading state indicator
 * - Hero animation during first interaction
 * 
 * Animations:
 * - Ring: Smooth stroke draw (1.2s)
 * - Core: Subtle pulse effect (1.5s infinite)
 */

import './LogoAnimated.css';

interface LogoAnimatedProps {
  size?: number; // SVG size (default: 64px)
  strokeColor?: string; // Ring color (default: #2563eb)
  coreColor?: string; // Core color (default: #2563eb)
  showAnimation?: boolean; // Enable animation (default: true)
  className?: string;
}

export function LogoAnimated({
  size = 64,
  strokeColor = '#2563eb',
  coreColor = '#2563eb',
  showAnimation = true,
  className = '',
}: LogoAnimatedProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={`viora-logo ${showAnimation ? '' : 'viora-logo-static'} ${className}`}
      aria-label="Viora animated logo"
      role="img"
    >
      {/* Ring - Drawn animation */}
      <circle
        cx="24"
        cy="24"
        r="22"
        className="viora-ring"
        style={{ stroke: strokeColor }}
      />

      {/* Core - Pulse animation */}
      <circle
        cx="24"
        cy="24"
        r="6"
        className="viora-core"
        style={{ fill: coreColor }}
      />
    </svg>
  );
}
