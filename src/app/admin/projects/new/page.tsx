import { createClient } from "@/lib/supabase/server";
import NewProjectForm from "@/components/NewProjectForm";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: preselectedClientId } = await searchParams;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-12 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <h1 className="mb-10 font-serif text-4xl text-black">New Project</h1>
        <NewProjectForm
          clients={clients ?? []}
          preselectedClientId={preselectedClientId}
        />
      </div>
    </div>
  );
}
