import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // Document uploads go through a Server Action (FormData). Next defaults to 1MB
  // for actions and ~10MB for the proxy body buffer, which rejects typical PDFs.
  // Keep these at or under Vercel's ~4.5MB platform request ceiling for production
  // reliability; larger files should use direct-to-Supabase storage later.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    proxyClientMaxBodySize: "10mb",
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source-map upload only when CI provides an auth token.
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  widenClientFileUpload: Boolean(process.env.SENTRY_AUTH_TOKEN),
  // Do NOT use tunnelRoute rewrites — they proxy via Next and can hang
  // (socket hang up) while leaking tunnel query params onto the ingest URL.
  // Client SDK tunnels through our App Router handler at /sentry-tunnel.
});
