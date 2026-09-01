import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: leads }, { count: clientCount }, { count: projectCount }, { count: documentCount }] =
    await Promise.all([
      supabase.from("leads").select("status"),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);

  const counts = {
    total: leads?.length ?? 0,
    new: leads?.filter((l) => l.status === "new").length ?? 0,
    contacted: leads?.filter((l) => l.status === "contacted").length ?? 0,
    qualified: leads?.filter((l) => l.status === "qualified").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <h1 className="mb-10 font-serif text-4xl text-black">Dashboard</h1>

        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total leads" value={counts.total} />
          <StatCard label="New" value={counts.new} accent />
          <StatCard label="Contacted" value={counts.contacted} />
          <StatCard label="Clients" value={clientCount ?? 0} />
          <StatCard label="Documents" value={documentCount ?? 0} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminLink
            href="/admin/leads"
            title="Leads"
            description="Every enquiry from the contact form, sorted and filterable by status."
          />
          <AdminLink
            href="/admin/clients"
            title="Clients"
            description="Converted leads and active client records."
          />
          <AdminLink
            href="/admin/projects"
            title="Projects"
            description={`${projectCount ?? 0} active engagement${projectCount === 1 ? "" : "s"}, phases, and progress.`}
          />
          <AdminLink
            href="/admin/documents"
            title="Documents"
            description="Every proposal, agreement, and file sent to a client, in one place."
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border border-neutral-200 border-l-4 bg-white p-5 ${accent ? "border-l-brand-pink" : "border-l-neutral-200"}`}>
      <p className={`font-serif text-4xl ${accent ? "text-brand-pink" : "text-black"}`}>{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-neutral-500">{label}</p>
    </div>
  );
}

function AdminLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block h-full">
      <div className="flex h-full flex-col rounded-xl border border-neutral-200 p-6 transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-sm">
        <h2 className="mb-1 font-serif text-xl text-black">{title}</h2>
        <p className="font-mono text-xs leading-relaxed text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}
