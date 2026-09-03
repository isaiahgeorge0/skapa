import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

export const RATE_LIMIT_MESSAGE =
  "Too many submissions from this connection. Please try again shortly.";

export type RateLimitEndpoint = "contact" | "questionnaire";

/**
 * Shared public-lead bucket so Contact and /start cannot be rotated around
 * each other to bypass the limit.
 */
const RATE_LIMIT_SCOPE = "public_leads";

export async function assertLeadRateLimit(
  ipAddress: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count, error: countError } = await admin
    .from("rate_limit_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ipAddress)
    .eq("endpoint", RATE_LIMIT_SCOPE)
    .gte("created_at", since);

  if (countError) {
    console.error("rate_limit_attempts count failed:", countError);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }

  const { error: insertError } = await admin.from("rate_limit_attempts").insert({
    ip_address: ipAddress,
    endpoint: RATE_LIMIT_SCOPE,
  });

  if (insertError) {
    console.error("rate_limit_attempts insert failed:", insertError);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }

  return { ok: true };
}
