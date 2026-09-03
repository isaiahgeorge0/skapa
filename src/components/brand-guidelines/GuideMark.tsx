/** Compact fictional mark used only as a guidelines demonstration system. */
export default function GuideMark({
  className = "h-8 w-8",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill={color}
    >
      <rect x="6" y="6" width="36" height="36" rx="2" />
      <rect x="14" y="14" width="8" height="20" fill="#efeeea" />
      <rect x="26" y="20" width="8" height="8" fill="#efeeea" />
    </svg>
  );
}
