import { createClient } from "@/lib/supabase/server";
import PhaseTracker, { type Phase } from "@/components/PhaseTracker";
import EditableDetails from "@/components/EditableDetails";
import AssignedClients from "@/components/AssignedClients";
import Card from "@/components/Card";

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  website_branding: "Website / Branding",
  social_rebrand: "Social Media Rebrand",
  client_proof_check: "Client Proof Check",
  final_sign_off: "Final Sign Off",
};

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, service_type, phase, target_completion_date, client_id, clients!client_id(id, name, email)",
    )
    .eq("id", id)
    .single();

  if (!project) return null;

  const [{ data: additionalRows }, { data: allClients }] = await Promise.all([
    supabase.from("project_clients").select("clients(id, name, email)").eq("project_id", id),
    supabase.from("clients").select("id, name, email").order("name"),
  ]);

  const client = (
    project as unknown as {
      clients: { id: string; name: string; email: string | null } | null;
    }
  ).clients;

  const additionalClients = (additionalRows ?? []).flatMap((row) => {
    const linked = row.clients as
      | { id: string; name: string; email: string | null }
      | { id: string; name: string; email: string | null }[]
      | null;
    if (!linked) return [];
    return Array.isArray(linked) ? linked : [linked];
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card title="Phase">
        <PhaseTracker projectId={project.id} initialPhase={project.phase as Phase} />
      </Card>

      <div className="space-y-6">
        {client && (
          <Card title="Client">
            <AssignedClients
              projectId={project.id}
              primaryClient={client}
              initialAdditionalClients={additionalClients}
              allClients={allClients ?? []}
            />
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
  );
}
