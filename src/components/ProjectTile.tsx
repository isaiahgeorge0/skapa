import Link from "next/link";

type ProjectTileProps = {
  href?: string;
  headline: string;
  italic?: string;
  label: string;
  /** Primary fill for the tile — pink, yellow, or blue */
  accent?: "pink" | "yellow" | "blue";
  className?: string;
};

export default function ProjectTile({
  href = "/contact",
  headline,
  italic,
  label,
  accent = "pink",
  className = "",
}: ProjectTileProps) {
  const bg =
    accent === "yellow"
      ? "bg-brand-yellow"
      : accent === "blue"
        ? "bg-brand-blue"
        : "bg-brand-pink";
  const text = accent === "yellow" ? "text-black" : "text-white";
  const labelColor =
    accent === "yellow" ? "text-black/70" : "text-white/80";

  const inner = (
    <div
      className={`${bg} ${text} flex min-h-[280px] flex-col justify-end p-8 md:min-h-[340px] md:p-10 ${className}`}
    >
      <h2 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
        {headline}
        {italic ? (
          <>
            {" "}
            <span className="italic">{italic}</span>
          </>
        ) : null}
      </h2>
      <p
        className={`mt-4 font-mono text-[11px] uppercase tracking-[0.14em] ${labelColor}`}
      >
        {label}
      </p>
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      {inner}
    </Link>
  );
}
