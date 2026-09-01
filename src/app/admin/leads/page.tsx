import { createClient } from "@/lib/supabase/server";
import LeadsTable from "@/components/LeadsTable";

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, message, status, created_at, converted_client_id, source, answers")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load leads: ${error.message}`);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <LeadsTable initialLeads={leads ?? []} />
      </div>
    </div>
  );
}
