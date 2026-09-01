import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectStatusControl from "@/components/ProjectStatusControl";
import ProjectTabs from "@/components/ProjectTabs";

export default async function ProjectLayout({
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
    .select("id, name, status")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              Project
            </p>
            <h1 className="font-serif text-4xl text-black">{project.name}</h1>
          </div>
          <ProjectStatusControl projectId={project.id} initialStatus={project.status} />
        </div>

        <ProjectTabs projectId={project.id} />

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
