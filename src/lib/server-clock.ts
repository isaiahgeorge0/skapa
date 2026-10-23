import { connection } from "next/server";

/** Per-request server clock. connection() keeps this off the static build. */
export async function serverNow(): Promise<number> {
  await connection();
  return Date.now();
}
