import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  website_branding: "Website / Branding",
  social_rebrand: "Social Media Rebrand",
  client_proof_check: "Client Proof Check",
  final_sign_off: "Final Sign Off",
};

const PHASE_ORDER = [
  "onboarding",
  "website_branding",
  "social_rebrand",
  "client_proof_check",
  "final_sign_off",
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-neutral-100 text-neutral-500",
};

type DocRow = { id: string; type: string; created_at: string; project_id: string };
type MsgRow = {
  id: string;
  body: string;
  sender_role: string;
  created_at: string;
  project_id: string;
};

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, client_id")
    .eq("id", user!.id)
    .single();

  if (!profile?.client_id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <p className="font-mono text-sm text-neutral-500">
          Your account isn&apos;t linked to a project yet. Get in touch with
          skapa and we&apos;ll get you set up.
        </p>
      </div>
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, phase, status")
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });

  const projectIds = (projects ?? []).map((p) => p.id);

  const [{ data: recentDocs }, { data: recentMessages }] = await Promise.all([
    projectIds.length
      ? supabase
          .from("documents")
          .select("id, type, created_at, project_id")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as DocRow[] }),
    projectIds.length
      ? supabase
          .from("messages")
          .select("id, body, sender_role, created_at, project_id")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as MsgRow[] }),
  ]);

  const projectNameById = Object.fromEntries(
    (projects ?? []).map((p) => [p.id, p.name]),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-neutral-500">
        Overview
      </p>
      <h1 className="mb-10 font-serif text-4xl text-black">
        Welcome, {profile.full_name || "there"}.
      </h1>

      {!projects || projects.length === 0 ? (
        <Card>
          <p className="font-mono text-sm text-neutral-400">
            No projects yet. Check back soon.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {projects.map((p) => {
              const phaseIndex = PHASE_ORDER.indexOf(p.phase);
              return (
                <Link key={p.id} href={`/portal/projects/${p.id}`}>
                  <div className="rounded-xl border border-neutral-200 p-6 transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h2 className="font-serif text-2xl text-black">{p.name}</h2>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[p.status] ?? ""}`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="mb-2 flex gap-1.5">
                      {PHASE_ORDER.map((phase, i) => (
                        <div
                          key={phase}
                          className={`h-1.5 flex-1 rounded-full ${
                            i <= phaseIndex ? "bg-brand-pink" : "bg-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="font-mono text-xs text-neutral-500">
                      {PHASE_LABELS[p.phase] ?? p.phase}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Recent messages">
              {!recentMessages || recentMessages.length === 0 ? (
                <p className="font-mono text-sm text-neutral-400">
                  No messages yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {recentMessages.map((m) => (
                    <li key={m.id}>
                      <p className="line-clamp-2 font-sans text-sm text-black">
                        {m.body}
                      </p>
                      <p className="mt-1 font-mono text-xs text-neutral-400">
                        {projectNameById[m.project_id]} ·{" "}
                        {m.sender_role === "admin" ? "skapa" : "You"} ·{" "}
                        {new Date(m.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Latest documents">
              {!recentDocs || recentDocs.length === 0 ? (
                <p className="font-mono text-sm text-neutral-400">
                  No documents shared yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {recentDocs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-sm capitalize text-black">
                          {d.type}
                        </p>
                        <p className="font-mono text-xs text-neutral-400">
                          {projectNameById[d.project_id]}
                        </p>
                      </div>
                      <Link
                        href={`/portal/projects/${d.project_id}`}
                        className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-pink hover:underline"
                      >
                        View →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
