export default function PortalSectionHeading({
  children,
  as: Tag = "h2",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? "text-xl tracking-tight"
      : "text-2xl tracking-tight md:text-[1.65rem]";

  return (
    <Tag
      className={`flex items-center gap-3 font-serif text-black ${sizeClass} ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-portal-accent"
      />
      {children}
    </Tag>
  );
}
