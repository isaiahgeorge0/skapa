import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORWARD_TIMEOUT_MS = 4_000;

/**
 * Custom Sentry tunnel.
 *
 * Replaces `withSentryConfig({ tunnelRoute })` rewrites, which (on this app)
 * forward client query params onto the EU ingest URL and can leave the
 * Next.js proxy hanging on `socket hang up` — starving other requests
 * including contact /start server actions.
 *
 * This handler:
 * - derives the ingest host from NEXT_PUBLIC_SENTRY_DSN (supports .de / .us)
 * - forwards the envelope body with a hard timeout
 * - always resolves quickly so a broken Sentry path cannot hang the UI
 */
function ingestUrlFromDsn(dsn: string): string | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    if (!url.host || !projectId) return null;
    return `https://${url.host}/api/${projectId}/envelope/`;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return new NextResponse(null, { status: 204 });
  }

  const ingestUrl = ingestUrlFromDsn(dsn);
  if (!ingestUrl) {
    return NextResponse.json({ error: "invalid_dsn" }, { status: 500 });
  }

  let body: ArrayBuffer;
  try {
    body = await request.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  if (!body.byteLength) {
    return NextResponse.json({ error: "empty_body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type":
          request.headers.get("content-type") ??
          "application/x-sentry-envelope",
      },
      body,
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
      cache: "no-store",
    });

    const responseBody = await upstream.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("[sentry-tunnel] forward failed:", error);
    // Fail open + fast: client SDK must not leave requests pending forever.
    return NextResponse.json(
      { ok: false, error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}
