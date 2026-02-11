/**
 * Viora Logo Monochromatic Component
 * Minimal, single-color version for print, documentation, and minimal contexts
 * 
 * Use when:
 * - Printing
 * - Documents / PDFs
 * - Minimal/minimalist contexts
 * - Dark/light without gradient backgrounds
 */

interface LogoMonoProps {
  width?: number;
  height?: number;
  className?: string;
  isDark?: boolean; // If true, light variant for dark backgrounds (white text, dark inner circle)
}

export function LogoMono({
  width = 200,
  height = 56,
  className = '',
  isDark = false,
}: LogoMonoProps) {
  // Color scheme based on background
  const outerColor = isDark ? '#ffffff' : '#0f172a';
  const innerColor = isDark ? '#0f172a' : '#ffffff';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Viora logo monochromatic"
      role="img"
      className={className}
    >
      {/* Icon */}
      <g transform="translate(0, 4)">
        {/* Outer circle (vision) */}
        <circle cx="24" cy="24" r="24" fill={outerColor} />

        {/* Inner focus (clarity point) */}
        <circle cx="24" cy="24" r="6" fill={innerColor} />
      </g>

      {/* Wordmark */}
      <text
        x="64"
        y="40"
        fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="34"
        fontWeight="600"
        fill={outerColor}
        letterSpacing="-0.02em"
      >
        Viora
      </text>
    </svg>
  );
}
