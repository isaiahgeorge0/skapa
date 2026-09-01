import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email, company, created_at")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, phase, status")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Client
        </p>
        <h1 className="mb-8 font-serif text-4xl text-black">{client.name}</h1>

        <dl className="grid grid-cols-[120px_1fr] gap-y-3 border-t border-neutral-200 py-6 font-mono text-sm">
          <dt className="text-neutral-500">Email</dt>
          <dd className="text-black">{client.email}</dd>
          <dt className="text-neutral-500">Company</dt>
          <dd className="text-black">{client.company || "Not provided"}</dd>
          <dt className="text-neutral-500">Client since</dt>
          <dd className="text-black">
            {new Date(client.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </dd>
        </dl>

        <div className="mt-10 border-t border-neutral-200 pt-8">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl text-black">Projects</h2>
            <Link
              href={`/admin/projects/new?client=${client.id}`}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-700 underline underline-offset-2 hover:text-black"
            >
              New project
            </Link>
          </div>

          {!projects?.length ? (
            <p className="font-mono text-xs text-neutral-400">
              No projects yet for this client.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:bg-neutral-50"
                  >
                    <span className="font-serif text-lg text-black">
                      {project.name}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500">
                      {project.phase} · {project.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
