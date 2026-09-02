import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PhaseTracker, { type Phase } from "@/components/PhaseTracker";
import DocumentsPanel from "@/components/DocumentsPanel";
import MessagesPanel from "@/components/MessagesPanel";
import TasksChecklist from "@/components/TasksChecklist";
import PortalSection, { PortalSectionStack } from "@/components/PortalSection";
import { clientProjectStatusLabel } from "@/lib/client-document-status";
import { getClientAccentColor, portalAccentStyle } from "@/lib/portal-accent";
import PortalAccentVars from "@/components/PortalAccentVars";

export const dynamic = "force-dynamic";

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  website_branding: "Website / Branding",
  social_rebrand: "Social Media Rebrand",
  client_proof_check: "Client Proof Check",
  final_sign_off: "Final Sign Off",
};

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, phase, status, service_type, target_completion_date, client_id",
    )
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [{ data: documents }, { data: messages }, { data: tasks }, projectAccent] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id, type, file_url, file_mime_type, status, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("id, sender_id, sender_role, body, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("project_tasks")
        .select("id, title, is_complete, phase")
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
      getClientAccentColor(project.client_id),
    ]);

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
      style={portalAccentStyle(projectAccent)}
    >
      <PortalAccentVars accent={projectAccent} />
      <Link
        href="/portal"
        className="mb-8 inline-block font-mono text-xs text-neutral-500 transition-colors hover:text-black"
      >
        ← Overview
      </Link>

      <header className="mb-16 border-b border-neutral-200 pb-8 md:mb-20 md:pb-10">
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-black md:text-5xl">
          {project.name}
        </h1>
        <p className="mt-3 font-serif text-xl italic text-neutral-500 md:text-2xl">
          {PHASE_LABELS[project.phase] ?? project.phase}
        </p>
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

      <PortalSectionStack>
        <DocumentsPanel
          projectId={project.id}
          initialDocuments={documents ?? []}
          canManage={false}
        />

        <PortalSection title="Where things stand">
          <PhaseTracker
            projectId={project.id}
            initialPhase={project.phase as Phase}
            readOnly
            usePortalAccent
          />
        </PortalSection>

        <PortalSection
          title="This phase"
          intro={
            <p className="text-sm text-neutral-500">Checklist for right now.</p>
          }
        >
          <TasksChecklist
            projectId={project.id}
            currentPhase={project.phase}
            initialTasks={tasks ?? []}
            canManage={false}
          />
        </PortalSection>

        <div className="grid gap-16 sm:gap-[4.5rem] lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <PortalSection
            title="Messages"
            intro={
              <p className="text-sm text-neutral-500">
                Notes between you and skapa.
              </p>
            }
          >
            <MessagesPanel
              projectId={project.id}
              currentUserId={user!.id}
              viewerRole="client"
              initialMessages={messages ?? []}
            />
          </PortalSection>

          <PortalSection title="Details" titleSize="sm">
            <dl className="space-y-5">
              <div>
                <dt className="font-mono text-[11px] text-neutral-400">Service</dt>
                <dd className="mt-1 capitalize text-black">{project.service_type}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] text-neutral-400">Phase</dt>
                <dd className="mt-1 text-black">
                  {PHASE_LABELS[project.phase] ?? project.phase}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] text-neutral-400">Target</dt>
                <dd className="mt-1 text-black">{targetDate ?? "Not set"}</dd>
              </div>
            </dl>
          </PortalSection>
        </div>
      </PortalSectionStack>
    </div>
  );
}
