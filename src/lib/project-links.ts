export type ProjectLink = {
  id: string;
  project_id: string;
  title: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export const PROJECT_LINK_COLUMNS = "id, project_id, title, url, sort_order, created_at";
export const PROJECT_LINK_TITLE_MAX = 120;

/** Parsed URL when `url` is http(s), otherwise null. */
export function parseHttpUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Trims and validates a user-typed link. Bare domains (example.com) get https://.
 * Anything that isn't http(s) — javascript:, data:, mailto: — is rejected.
 */
export function normalizeLinkUrl(
  input: string,
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Add a URL." };

  let candidate = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  const hasScheme = candidate.includes("://") || (schemeMatch && !schemeMatch[1].includes("."));
  if (!hasScheme) candidate = `https://${trimmed}`;

  const parsed = parseHttpUrl(candidate);
  if (!parsed) return { ok: false, error: "Links must start with http:// or https://." };
  if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
    return { ok: false, error: "That doesn't look like a web address." };
  }
  return { ok: true, url: candidate };
}

export function validateLinkTitle(
  input: string,
): { ok: true; title: string } | { ok: false; error: string } {
  const title = input.trim();
  if (!title) return { ok: false, error: "Give the link a title." };
  if (title.length > PROJECT_LINK_TITLE_MAX) {
    return { ok: false, error: `Titles can be up to ${PROJECT_LINK_TITLE_MAX} characters.` };
  }
  return { ok: true, title };
}

/** Full URL when short enough to read; the hostname otherwise. */
export function linkDisplayText(url: string, parsed: URL): string {
  return url.length > 40 ? parsed.hostname.replace(/^www\./, "") : url;
}
