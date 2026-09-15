import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PortalProjectTabs from "@/components/PortalProjectTabs";
import PortalAccentVars from "@/components/PortalAccentVars";
import { clientProjectStatusLabel } from "@/lib/client-document-status";
import { getClientAccentColor, portalAccentStyle } from "@/lib/portal-accent";

export const dynamic = "force-dynamic";

export default async function PortalProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, target_completion_date, client_id")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const accent = await getClientAccentColor(project.client_id);
  const targetDate = project.target_completion_date
    ? new Date(project.target_completion_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 md:px-10 md:py-14"
      style={portalAccentStyle(accent)}
    >
      <PortalAccentVars accent={accent} />
      <Link
        href="/portal"
        className="mb-8 inline-block font-mono text-xs text-neutral-500 transition-colors hover:text-black"
      >
        ← Overview
      </Link>

      <header className="mb-8 md:mb-10">
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-black md:text-5xl">
          {project.name}
        </h1>
        <p className="mt-3 font-mono text-xs text-neutral-400">
          {clientProjectStatusLabel(project.status)}
          {targetDate ? (
            <>
              <span className="text-neutral-300"> · </span>
              Target {targetDate}
            </>
          ) : null}
        </p>
      </header>

      <PortalProjectTabs projectId={project.id} />

      <div className="mt-8 md:mt-10">{children}</div>
    </div>
  );
}
