import { linkDisplayText, parseHttpUrl, type ProjectLink } from "@/lib/project-links";

export default function ProjectLinksList({
  links,
}: {
  links: Pick<ProjectLink, "id" | "title" | "url">[];
}) {
  const safeLinks = links.flatMap((link) => {
    const parsed = parseHttpUrl(link.url);
    return parsed ? [{ ...link, display: linkDisplayText(link.url, parsed) }] : [];
  });
  if (safeLinks.length === 0) return null;

  return (
    <ul className="divide-y divide-black/[0.06]">
      {safeLinks.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-11 items-start justify-between gap-4 py-3"
          >
            <span className="min-w-0">
              <span className="block break-words font-serif text-base leading-snug text-black group-hover:underline group-hover:decoration-dotted group-hover:underline-offset-4">
                {link.title}
              </span>
              <span className="mt-1 block truncate font-mono text-[11px] text-neutral-500">
                {link.display}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 font-mono text-sm text-neutral-400 transition-colors group-hover:text-black"
            >
              ↗
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
