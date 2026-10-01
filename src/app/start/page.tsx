import type { Metadata } from "next";
import { connection } from "next/server";
import StartQuestionnaire from "@/components/StartQuestionnaire";
import { noindexFollow } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Start a project",
  ...noindexFollow,
};

export default async function StartPage() {
  // Per-request render so startedAt is read on the server's clock at page load,
  // not baked in at build time.
  await connection();
  return <StartQuestionnaire startedAt={Date.now()} />;
}
