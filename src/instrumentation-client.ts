import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // App Router handler — not the withSentryConfig rewrite tunnel.
    tunnel: "/sentry-tunnel",
    tracesSampleRate: process.env.NODE_ENV === "development" ? 0.0 : 0.1,
    enabled: Boolean(dsn),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
