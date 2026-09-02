/**
 * Confirmed brand deck palette.
 * Prefer CSS tokens (brand-pink, brand-yellow, brand-blue, brand-cream) in UI;
 * use these hexes only when an inline style or non-Tailwind context is required.
 */
export const BRAND = {
  pink: "#FF2791",
  yellow: "#FFF1A7",
  blue: "#4B4AE4",
  cream: "#EFEEEA",
  black: "#0A0A0A",
  white: "#FFFFFF",
} as const;

/** Fallback when a client has no custom accent_color. */
export const DEFAULT_CLIENT_ACCENT = BRAND.pink;

const HEX_RE = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/** Expand #RGB → #RRGGBB and uppercase for consistent storage. Accepts with or without leading #. */
export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!isValidHexColor(trimmed)) return null;
  const raw = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return `#${hex.toUpperCase()}`;
}

export function resolveClientAccent(accentColor: string | null | undefined): string {
  return normalizeHexColor(accentColor ?? "") ?? DEFAULT_CLIENT_ACCENT;
}

function relativeLuminance(hex: string): number {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return 0;
  const n = normalized.slice(1);
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG contrast ratio of `hex` against white. */
export function contrastAgainstWhite(hex: string): number | null {
  if (!normalizeHexColor(hex)) return null;
  const l1 = 1; // white
  const l2 = relativeLuminance(hex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Warn when text/icon on white would fail WCAG AA for UI (< 3:1). */
export function hasPoorContrastOnWhite(hex: string): boolean {
  const ratio = contrastAgainstWhite(hex);
  return ratio !== null && ratio < 3;
}
