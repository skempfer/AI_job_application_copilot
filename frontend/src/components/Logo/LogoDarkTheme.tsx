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
      <g transform="translate(0, 4)">
        <circle cx="24" cy="24" r="24" fill="#60a5fa" />

        <circle cx="24" cy="24" r="6" fill="#0f172a" />
      </g>

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
