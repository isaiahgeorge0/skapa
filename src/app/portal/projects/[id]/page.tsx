import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PhaseTracker, { type Phase } from "@/components/PhaseTracker";
import DocumentsPanel from "@/components/DocumentsPanel";
import MessagesPanel from "@/components/MessagesPanel";
import TasksChecklist from "@/components/TasksChecklist";
import Card from "@/components/Card";

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
    .select("id, name, phase, status, service_type, target_completion_date")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [{ data: documents }, { data: messages }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id, type, file_url, status, created_at")
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
    ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <Link
        href="/portal"
        className="mb-6 inline-block font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
      >
        ← Overview
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
            Project
          </p>
          <h1 className="font-serif text-4xl text-black">{project.name}</h1>
        </div>
        <span className="rounded-full bg-neutral-100 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600">
          {project.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card title="Progress">
            <PhaseTracker
              projectId={project.id}
              initialPhase={project.phase as Phase}
              readOnly
            />
          </Card>

          <Card title="Tasks">
            <TasksChecklist
              projectId={project.id}
              currentPhase={project.phase}
              initialTasks={tasks ?? []}
              canManage={false}
            />
          </Card>

          <Card title="Documents">
            <DocumentsPanel
              projectId={project.id}
              initialDocuments={documents ?? []}
              canManage={false}
            />
          </Card>

          <Card title="Messages">
            <MessagesPanel
              projectId={project.id}
              currentUserId={user!.id}
              viewerRole="client"
              initialMessages={messages ?? []}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Details">
            <dl className="space-y-4 font-mono text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-neutral-400">
                  Service type
                </dt>
                <dd className="mt-1 capitalize text-black">{project.service_type}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-neutral-400">
                  Current phase
                </dt>
                <dd className="mt-1 text-black">
                  {PHASE_LABELS[project.phase] ?? project.phase}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-neutral-400">
                  Target date
                </dt>
                <dd className="mt-1 text-black">
                  {project.target_completion_date
                    ? new Date(project.target_completion_date).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : "Not set"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
