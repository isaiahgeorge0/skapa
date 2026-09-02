import type { Metadata } from "next";
import StartQuestionnaire from "@/components/StartQuestionnaire";
import { noindexFollow } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Start a project",
  ...noindexFollow,
};

export default function StartPage() {
  return <StartQuestionnaire />;
}
