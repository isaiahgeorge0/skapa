import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PhaseTracker, { type Phase } from "@/components/PhaseTracker";
import ProjectStatusControl from "@/components/ProjectStatusControl";
import DocumentsPanel from "@/components/DocumentsPanel";
import MessagesPanel from "@/components/MessagesPanel";
import TasksChecklist from "@/components/TasksChecklist";
import EditableDetails from "@/components/EditableDetails";
import NotesLog from "@/components/NotesLog";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  website_branding: "Website / Branding",
  social_rebrand: "Social Media Rebrand",
  client_proof_check: "Client Proof Check",
  final_sign_off: "Final Sign Off",
};

export default async function AdminProjectDetailPage({
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
      "id, name, service_type, phase, status, target_completion_date, client_id, clients(id, name, email)",
    )
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [{ data: documents }, { data: messages }, { data: tasks }, { data: notes }] =
    await Promise.all([
      supabase
        .from("documents")
        .select(
          "id, type, file_url, status, created_at, signature_name, signed_at, signature_hash, signer_ip, signer_user_agent",
        )
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
      supabase
        .from("project_notes")
        .select("id, body, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const client = (
    project as unknown as {
      clients: { id: string; name: string; email: string } | null;
    }
  ).clients;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              Project
            </p>
            <h1 className="font-serif text-4xl text-black">{project.name}</h1>
          </div>
          <ProjectStatusControl projectId={project.id} initialStatus={project.status} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card title="Phase">
              <PhaseTracker projectId={project.id} initialPhase={project.phase as Phase} />
            </Card>

            <Card title="Tasks">
              <TasksChecklist
                projectId={project.id}
                currentPhase={project.phase}
                initialTasks={tasks ?? []}
              />
            </Card>

            <Card title="Documents">
              <DocumentsPanel projectId={project.id} initialDocuments={documents ?? []} />
            </Card>

            <Card title="Messages">
              <MessagesPanel
                projectId={project.id}
                currentUserId={user!.id}
                viewerRole="admin"
                initialMessages={messages ?? []}
              />
            </Card>

            <Card title="Internal notes">
              <NotesLog projectId={project.id} initialNotes={notes ?? []} />
            </Card>
          </div>

          <div className="space-y-6">
            {client && (
              <Card title="Client">
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="flex items-center gap-3 transition-opacity hover:opacity-70"
                >
                  <Avatar name={client.name} />
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm text-black">{client.name}</p>
                    <p className="truncate font-mono text-xs text-neutral-500">
                      {client.email}
                    </p>
                  </div>
                </Link>
              </Card>
            )}

            <Card title="Details">
              <EditableDetails
                projectId={project.id}
                initialName={project.name}
                initialServiceType={project.service_type}
                initialTargetDate={project.target_completion_date}
                currentPhaseLabel={PHASE_LABELS[project.phase] ?? project.phase}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
