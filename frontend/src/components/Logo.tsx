/**
 * Viora Logo Component
 * Used in header, footer, and branding contexts
 */

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 240, height = 64, className = '' }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Viora logo"
      role="img"
      className={className}
    >
      {/* Icon */}
      <g transform="translate(0, 8)">
        {/* Outer shape (vision / clarity) */}
        <path
          d="M24 0C10.745 0 0 10.745 0 24C0 37.255 10.745 48 24 48C37.255 48 48 37.255 48 24C48 10.745 37.255 0 24 0Z"
          fill="url(#vioraGradient)"
        />

        {/* Inner focus (clarity point) */}
        <circle cx="24" cy="24" r="6" fill="#ffffff" />
      </g>

      {/* Wordmark */}
      <text
        x="64"
        y="42"
        fill="#0f172a"
        fontSize="36"
        fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        Viora
      </text>

      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="vioraGradient"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
