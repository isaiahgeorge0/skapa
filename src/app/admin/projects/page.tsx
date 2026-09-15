import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectsTable from "@/components/ProjectsTable";

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, name, phase, status, target_completion_date, archived_at, clients!client_id(name)",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load projects: ${error.message}`);

  const initialProjects = (projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    phase: p.phase,
    status: p.status,
    target_completion_date: p.target_completion_date,
    archived_at: p.archived_at ?? null,
    clientName:
      (p as unknown as { clients: { name: string } | null }).clients?.name ??
      "Not set",
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">Admin</p>
            <h1 className="font-serif text-4xl text-black">Projects</h1>
          </div>
          <Link href="/admin/projects/new" className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80">
            New project
          </Link>
        </div>

        <ProjectsTable initialProjects={initialProjects} />
      </div>
    </div>
  );
}
