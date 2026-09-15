function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function Avatar({
  name,
  size = "md",
  tone = "brand",
}: {
  name: string;
  size?: "sm" | "md";
  /** brand = pink (admin default); portal = client accent; neutral = charcoal. */
  tone?: "brand" | "portal" | "neutral";
}) {
  const dims = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  const colors =
    tone === "portal"
      ? "bg-portal-accent/10 font-mono font-medium text-portal-accent"
      : tone === "neutral"
        ? "bg-neutral-200 font-mono font-medium text-neutral-700"
        : "bg-brand-pink/10 font-mono font-medium text-brand-pink";
  return (
    <span
      className={`inline-flex ${dims} shrink-0 items-center justify-center rounded-full ${colors}`}
    >
      {getInitials(name)}
    </span>
  );
}
