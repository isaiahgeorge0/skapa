import { headers } from "next/headers";

/** Real client IP from proxy headers (same pattern as e-signature actions). */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}
