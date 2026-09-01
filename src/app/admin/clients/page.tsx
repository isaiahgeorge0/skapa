import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";

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
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">Admin</p>
            <h1 className="font-serif text-4xl text-black">Clients</h1>
          </div>
          <p className="font-mono text-xs text-neutral-500">{clients?.length ?? 0} total</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          {!clients || clients.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-neutral-400">
              No clients yet. Convert a lead from the{" "}
              <Link href="/admin/leads" className="text-brand-pink hover:underline">Leads</Link> page to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="py-3 pl-5 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Name</th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Email</th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Company</th>
                    <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Client since</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50">
                      <td className="py-4 pl-5 pr-4">
                        <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-3">
                          <Avatar name={client.name} size="sm" />
                          <span className="font-sans text-sm text-black hover:text-brand-pink hover:underline">{client.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 pr-4 font-mono text-sm text-neutral-700">{client.email}</td>
                      <td className="py-4 pr-4 font-sans text-sm text-neutral-600">
                        {client.company || <span className="text-neutral-300">Not provided</span>}
                      </td>
                      <td className="whitespace-nowrap py-4 pr-5 font-mono text-xs text-neutral-500">
                        {new Date(client.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
