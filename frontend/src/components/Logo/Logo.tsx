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
      <g transform="translate(0, 8)">
        <circle cx="24" cy="24" r="24" fill="#2563eb" />

        <circle cx="24" cy="24" r="6" fill="#ffffff" />
      </g>

      <text
        x="64"
        y="42"
        fill="#1a1a1a"
        fontSize="36"
        fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        Viora
      </text>
    </svg>
  );
}
