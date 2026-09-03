import { createClient } from "@/lib/supabase/server";
import ClientsTable from "@/components/ClientsTable";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const [{ data: clients, error }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id, name, email, company, accent_color, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").order("name"),
    ]);

  if (error) throw new Error(`Failed to load clients: ${error.message}`);
  if (projectsError) throw new Error(`Failed to load projects: ${projectsError.message}`);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <ClientsTable
          initialClients={clients ?? []}
          availableProjects={projects ?? []}
        />
      </div>
    </div>
  );
}
