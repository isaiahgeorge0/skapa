/** Reject if `promise` does not settle within `ms`. Clears the timer on settle. */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage = "Request timed out. Please try again.",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
