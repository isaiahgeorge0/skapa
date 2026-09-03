import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PortalSection, { PortalSectionStack } from "@/components/PortalSection";
import {
  clientDocumentStatusLabel,
  clientProjectStatusLabel,
} from "@/lib/client-document-status";

export const dynamic = "force-dynamic";

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

type DocRow = {
  id: string;
  type: string;
  created_at: string;
  project_id: string;
  status: string;
};
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
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:px-10">
        <h1 className="font-serif text-3xl tracking-tight text-black">
          Almost there.
        </h1>
        <p className="mt-3 text-neutral-500">
          Your account isn&apos;t linked to a project yet. Get in touch with skapa
          and we&apos;ll get you set up.
        </p>
      </div>
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, phase, status")
    .order("created_at", { ascending: false });

  const projectIds = (projects ?? []).map((p) => p.id);

  const [{ data: recentDocs }, { data: recentMessages }] = await Promise.all([
    projectIds.length
      ? supabase
          .from("documents")
          .select("id, type, created_at, project_id, status")
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

  const docs = (recentDocs ?? []) as DocRow[];
  const actionDocIds = docs
    .filter((d) => ["sent", "viewed", "partially_signed"].includes(d.status))
    .map((d) => d.id);

  const { data: activeSigners } =
    actionDocIds.length > 0
      ? await supabase
          .from("document_signers")
          .select("document_id, role, client_id, status")
          .in("document_id", actionDocIds)
          .eq("status", "sent")
      : { data: [] as { document_id: string; role: string; client_id: string | null; status: string }[] };

  const activeClientIds = [
    ...new Set(
      (activeSigners ?? [])
        .filter((s) => s.role === "client" && s.client_id)
        .map((s) => s.client_id as string),
    ),
  ];

  const { data: signerClients } =
    activeClientIds.length > 0
      ? await supabase.from("clients").select("id, name").in("id", activeClientIds)
      : { data: [] as { id: string; name: string }[] };

  const clientNameById = Object.fromEntries(
    (signerClients ?? []).map((c) => [c.id, c.name]),
  );

  const docStatusMeta: Record<
    string,
    { isMyTurn: boolean; waitingOnName: string | null }
  > = {};

  for (const doc of docs) {
    if (!["sent", "viewed", "partially_signed"].includes(doc.status)) continue;
    const active = (activeSigners ?? []).find((s) => s.document_id === doc.id);
    if (!active) {
      docStatusMeta[doc.id] = { isMyTurn: false, waitingOnName: null };
      continue;
    }
    const isMyTurn =
      active.role === "client" && active.client_id === profile.client_id;
    let waitingOnName: string | null = null;
    if (!isMyTurn) {
      if (active.role === "admin") waitingOnName = "Isaiah / Skapa";
      else if (active.client_id)
        waitingOnName = clientNameById[active.client_id] ?? "another signer";
    }
    docStatusMeta[doc.id] = { isMyTurn, waitingOnName };
  }

  const projectNameById = Object.fromEntries(
    (projects ?? []).map((p) => [p.id, p.name]),
  );

  const docsNeedingYou = docs.filter((d) => docStatusMeta[d.id]?.isMyTurn);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 md:px-10 md:py-14">
      <header className="mb-16 md:mb-20">
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-black md:text-5xl">
          Welcome, {profile.full_name || "there"}.
        </h1>
        <p className="mt-3 max-w-xl font-serif text-xl italic text-neutral-500">
          Your projects, in one place.
        </p>
      </header>

      {!projects || projects.length === 0 ? (
        <p className="text-neutral-400">No projects yet. Check back soon.</p>
      ) : (
        <PortalSectionStack>
          <section>
            <ul className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => {
                const phaseIndex = PHASE_ORDER.indexOf(p.phase);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/portal/projects/${p.id}`}
                      className="group block border border-neutral-200 p-5 transition-colors hover:border-black sm:p-6"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <h2 className="font-serif text-2xl tracking-tight text-black transition-colors group-hover:text-black">
                          {p.name}
                        </h2>
                        <span className="shrink-0 font-mono text-[11px] text-neutral-400">
                          {clientProjectStatusLabel(p.status)}
                        </span>
                      </div>

                      <div className="mb-2 flex gap-1">
                        {PHASE_ORDER.map((phase, i) => (
                          <div
                            key={phase}
                            className={`h-1 flex-1 ${
                              i <= phaseIndex ? "bg-black" : "bg-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="font-mono text-xs text-neutral-500">
                        {PHASE_LABELS[p.phase] ?? p.phase}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {docsNeedingYou.length > 0 && (
            <PortalSection
              title="Needs your signature"
              intro={
                <p className="font-serif text-lg italic text-neutral-500">
                  Don&apos;t leave these hanging.
                </p>
              }
            >
              <ul className="space-y-3">
                {docsNeedingYou.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col gap-3 border border-black bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-serif text-xl capitalize text-black">
                        {d.type}
                      </p>
                      <p className="mt-1 font-mono text-xs text-neutral-500">
                        {projectNameById[d.project_id]}
                      </p>
                    </div>
                    <Link
                      href={`/portal/projects/${d.project_id}`}
                      className="shrink-0 bg-portal-accent px-5 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
                    >
                      Review &amp; sign
                    </Link>
                  </li>
                ))}
              </ul>
            </PortalSection>
          )}

          <div className="grid gap-16 sm:gap-[4.5rem] md:grid-cols-2 md:gap-14">
            <PortalSection title="Recent messages" titleSize="sm">
              {!recentMessages || recentMessages.length === 0 ? (
                <p className="text-sm text-neutral-400">No messages yet.</p>
              ) : (
                <ul className="space-y-5">
                  {recentMessages.map((m) => (
                    <li key={m.id}>
                      <p className="line-clamp-2 text-sm text-black">{m.body}</p>
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
            </PortalSection>

            <PortalSection title="Latest documents" titleSize="sm">
              {docs.length === 0 ? (
                <p className="text-sm text-neutral-400">No documents shared yet.</p>
              ) : (
                <ul className="divide-y divide-neutral-200">
                  {docs.map((d) => {
                    const meta = docStatusMeta[d.id];
                    const label = clientDocumentStatusLabel({
                      status: d.status,
                      isMyTurn: Boolean(meta?.isMyTurn),
                      waitingOnName: meta?.waitingOnName,
                    });
                    return (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-serif text-lg capitalize text-black">
                            {d.type}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-neutral-400">
                            {projectNameById[d.project_id]}
                            <span className="text-neutral-300"> · </span>
                            {label}
                          </p>
                        </div>
                        <Link
                          href={`/portal/projects/${d.project_id}`}
                          className="shrink-0 font-mono text-[11px] text-neutral-500 underline decoration-dotted hover:text-black"
                        >
                          Open
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </PortalSection>
          </div>
        </PortalSectionStack>
      )}
    </div>
  );
}
