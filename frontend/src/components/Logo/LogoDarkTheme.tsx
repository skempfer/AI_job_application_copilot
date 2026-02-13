/**
 * Viora Logo Dark Theme Component
 * Vibrant, colorful version optimized for real dark backgrounds (#0a0a0a, #0f172a, etc.)
 * Uses cyan accent (#60a5fa) for strong contrast and modern aesthetic
 * 
 * Use when:
 * - Dark theme contexts
 * - Black/very dark backgrounds
 * - Dark mode UI
 */

interface LogoDarkThemeProps {
  width?: number;
  height?: number;
  className?: string;
}

export function LogoDarkTheme({
  width = 200,
  height = 56,
  className = '',
}: LogoDarkThemeProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Viora logo dark theme"
      role="img"
      className={className}
    >
      {/* Icon */}
      <g transform="translate(0, 4)">
        {/* Outer circle (cyan accent) */}
        <circle cx="24" cy="24" r="24" fill="#60a5fa" />

        {/* Inner focus (dark clarity point) */}
        <circle cx="24" cy="24" r="6" fill="#0f172a" />
      </g>

      {/* Wordmark */}
      <text
        x="64"
        y="40"
        fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="34"
        fontWeight="600"
        fill="#f1f5f9"
        letterSpacing="-0.02em"
      >
        Viora
      </text>
    </svg>
  );
}
