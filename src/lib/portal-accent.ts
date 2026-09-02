import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CLIENT_ACCENT, resolveClientAccent } from "@/lib/brand";
import type { CSSProperties } from "react";

/**
 * Read a client's portal accent.
 * Tries service-role first (bypasses RLS), then the user session client
 * (now that a client-facing SELECT policy exists).
 */
export async function getClientAccentColor(
  clientId: string | null | undefined,
): Promise<string> {
  if (!clientId) return DEFAULT_CLIENT_ACCENT;

  let raw: string | null | undefined;
  let found = false;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("clients")
      .select("accent_color")
      .eq("id", clientId)
      .maybeSingle();

    if (!error && data) {
      raw = data.accent_color as string | null | undefined;
      found = true;
    } else if (error) {
      console.error("accent_color admin read failed:", error.message);
    }
  }

  if (!found) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("accent_color")
      .eq("id", clientId)
      .maybeSingle();

    if (!error && data) {
      raw = data.accent_color as string | null | undefined;
    } else if (error) {
      console.error("accent_color session read failed:", error.message);
    }
  }

  return resolveClientAccent(raw);
}

/** Inline styles on portal wrappers (backup to <html> vars). */
export function portalAccentStyle(accent: string): CSSProperties {
  return {
    "--portal-accent": accent,
    "--color-portal-accent": accent,
  } as CSSProperties;
}
