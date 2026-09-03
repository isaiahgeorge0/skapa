"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-GB">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-6 font-mono text-black">
        <h1 className="mb-3 font-serif text-2xl">Something went wrong</h1>
        <p className="mb-6 max-w-md text-center text-sm text-neutral-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-black px-5 py-2 text-sm text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
