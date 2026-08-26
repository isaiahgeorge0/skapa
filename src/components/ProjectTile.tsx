import Link from "next/link";

type ProjectTileProps = {
  href?: string;
  headline: string;
  italic?: string;
  label: string;
  /** Single accent per tile — pink or yellow, never both */
  accent?: "pink" | "yellow";
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
  const bg = accent === "pink" ? "bg-brand-pink" : "bg-brand-yellow";
  const text = accent === "pink" ? "text-white" : "text-black";
  const labelColor =
    accent === "pink" ? "text-white/80" : "text-black/70";

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
