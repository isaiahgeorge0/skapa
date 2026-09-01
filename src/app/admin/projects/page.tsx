import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  website_branding: "Website / Branding",
  social_rebrand: "Social Rebrand",
  client_proof_check: "Client Proof Check",
  final_sign_off: "Final Sign Off",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-neutral-100 text-neutral-500",
};

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, phase, status, target_completion_date, clients!client_id(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load projects: ${error.message}`);

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

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          {!projects || projects.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-neutral-400">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="py-3 pl-5 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Project</th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Client</th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Phase</th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Status</th>
                    <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50">
                      <td className="py-4 pl-5 pr-4">
                        <Link href={`/admin/projects/${p.id}`} className="font-sans text-sm text-black hover:text-brand-pink hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                        {(p as unknown as { clients: { name: string } | null }).clients?.name ?? "Not set"}
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-neutral-600">{PHASE_LABELS[p.phase] ?? p.phase}</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[p.status] ?? ""}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-4 pr-5 font-mono text-xs text-neutral-500">
                        {p.target_completion_date
                          ? new Date(p.target_completion_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "Not set"}
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
