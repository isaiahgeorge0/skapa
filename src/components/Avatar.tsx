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
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex ${dims} shrink-0 items-center justify-center rounded-full bg-brand-pink/10 font-mono font-medium text-brand-pink`}
    >
      {getInitials(name)}
    </span>
  );
}
