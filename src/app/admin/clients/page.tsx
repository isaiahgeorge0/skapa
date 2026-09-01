import { createClient } from "@/lib/supabase/server";
import ClientsTable from "@/components/ClientsTable";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, email, company, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load clients: ${error.message}`);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              Admin
            </p>
            <h1 className="font-serif text-4xl text-black">Clients</h1>
          </div>
          <p className="font-mono text-xs text-neutral-500">{clients?.length ?? 0} total</p>
        </div>

        <ClientsTable initialClients={clients ?? []} />
      </div>
    </div>
  );
}
