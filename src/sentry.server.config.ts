import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Keep server error capture; avoid heavy tracing in local/dev so a
    // flaky ingest path cannot stall server actions.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 0.0 : 0.1,
  });
}
