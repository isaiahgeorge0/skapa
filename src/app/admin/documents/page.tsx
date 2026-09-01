import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  sent: "bg-blue-50 text-blue-700",
  viewed: "bg-amber-50 text-amber-700",
  signed: "bg-green-50 text-green-700",
};

export default async function AdminDocumentsPage() {
  const supabase = await createClient();

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, type, status, created_at, project_id, projects(name, clients(name))")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load documents: ${error.message}`);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              Admin
            </p>
            <h1 className="font-serif text-4xl text-black">Documents</h1>
          </div>
          <p className="font-mono text-xs text-neutral-500">
            {documents?.length ?? 0} total
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          {!documents || documents.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-neutral-400">
              No documents yet. Upload one from a project page.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="py-3 pl-5 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Type
                    </th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Project
                    </th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Client
                    </th>
                    <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Status
                    </th>
                    <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Uploaded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => {
                    const proj = (
                      d as unknown as {
                        projects: { name: string; clients: { name: string } | null } | null;
                      }
                    ).projects;
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50"
                      >
                        <td className="py-4 pl-5 pr-4 font-sans text-sm capitalize text-black">
                          {d.type}
                        </td>
                        <td className="py-4 pr-4">
                          <Link
                            href={`/admin/projects/${d.project_id}`}
                            className="font-sans text-sm text-black hover:text-brand-pink hover:underline"
                          >
                            {proj?.name ?? "Not set"}
                          </Link>
                        </td>
                        <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                          {proj?.clients?.name ?? "Not set"}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[d.status] ?? ""}`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-4 pr-5 font-mono text-xs text-neutral-500">
                          {new Date(d.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-4 font-mono text-xs text-neutral-400">
          To upload or download a document, open it from its project page.
        </p>
      </div>
    </div>
  );
}
