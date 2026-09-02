/** Stacked "skapa" wordmark in cream / pink / yellow — brand deck closing motif. */
export default function SkapaWordmarkStack({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "text-4xl md:text-5xl"
      : size === "sm"
        ? "text-xl md:text-2xl"
        : "text-2xl md:text-3xl";

  return (
    <p
      aria-hidden="true"
      className={`font-serif leading-[0.95] tracking-tight select-none ${sizeClass} ${className}`}
    >
      <span className="block text-brand-cream">skapa</span>
      <span className="block text-brand-pink">skapa</span>
      <span className="block text-brand-yellow">skapa</span>
    </p>
  );
}
