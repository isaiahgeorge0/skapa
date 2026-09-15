import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalSection from "@/components/PortalSection";
import { PHASES } from "@/lib/project-phases";

export const dynamic = "force-dynamic";

const PHASE_LABELS = Object.fromEntries(
  PHASES.map((p) => [p.key, p.label]),
) as Record<string, string>;

export default async function PortalProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, service_type, phase, target_completion_date")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const targetDate = project.target_completion_date
    ? new Date(project.target_completion_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PortalSection title="Details">
      <dl className="surface-raised max-w-md space-y-6 px-6 py-7 md:px-7 md:py-8">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Service
          </dt>
          <dd className="mt-1.5 capitalize text-black">{project.service_type}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Phase
          </dt>
          <dd className="mt-1.5 text-black">
            {PHASE_LABELS[project.phase] ?? project.phase}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Target
          </dt>
          <dd className="mt-1.5 text-black">{targetDate ?? "Not set"}</dd>
        </div>
      </dl>
    </PortalSection>
  );
}
