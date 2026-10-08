import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PortalSection, { PortalSectionStack } from "@/components/PortalSection";
import {
  clientDocumentStatusLabel,
  clientProjectStatusLabel,
} from "@/lib/client-document-status";
import { documentTypeLabel } from "@/lib/document-types";
import PortalAttentionList, { type AttentionSignature } from "@/components/PortalAttentionList";
import UpcomingTasksPanel, { type UpcomingTaskRow } from "@/components/UpcomingTasksPanel";
import {
  PROJECT_TASK_COLUMNS,
  londonToday,
  sortByImportance,
  type ProjectTask,
} from "@/lib/tasks";

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
  requires_signature: boolean | null;
};
type MsgRow = {
  id: string;
  body: string;
  sender_role: string;
  created_at: string;
  project_id: string;
};

function ViewAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-portal-accent transition-opacity hover:opacity-80"
    >
      View all →
    </Link>
  );
}

function firstNameFrom(name: string | null | undefined): string | null {
  const first = name?.trim().split(/\s+/)[0];
  return first || null;
}

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

  const [{ data: projects }, { data: linkedClient }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, phase, status")
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("name")
      .eq("id", profile.client_id)
      .maybeSingle(),
  ]);

  const greetingName =
    firstNameFrom(profile.full_name) ??
    firstNameFrom(linkedClient?.name) ??
    "there";

  const projectIds = (projects ?? []).map((p) => p.id);

  const [{ data: recentDocs }, { data: recentMessages }, { data: openTaskRows }] = await Promise.all([
    projectIds.length
      ? supabase
          .from("documents")
          .select("id, type, created_at, project_id, status, requires_signature")
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
    projectIds.length
      ? supabase
          .from("project_tasks")
          .select(PROJECT_TASK_COLUMNS)
          .in("project_id", projectIds)
          .eq("is_complete", false)
      : Promise.resolve({ data: [] as ProjectTask[] }),
  ]);

  const docs = (recentDocs ?? []) as DocRow[];
  const actionDocIds = docs
    .filter(
      (d) =>
        Boolean(d.requires_signature) &&
        ["sent", "viewed", "partially_signed"].includes(d.status),
    )
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
    if (!doc.requires_signature) continue;
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

  const today = londonToday();
  const openTasks: UpcomingTaskRow[] = sortByImportance(
    ((openTaskRows ?? []) as unknown as ProjectTask[]).map((t) => ({
      ...t,
      project_name: projectNameById[t.project_id] ?? null,
    })),
    today,
  );
  const attentionTasks = openTasks.filter((t) => t.assignee === "client");
  const attentionIds = new Set(attentionTasks.map((t) => t.id));
  const comingUp = openTasks
    .filter((t) => t.due_date && !attentionIds.has(t.id))
    .slice(0, 5);
  const signatureItems: AttentionSignature[] = docsNeedingYou.map((d) => ({
    id: d.id,
    project_id: d.project_id,
    project_name: projectNameById[d.project_id] ?? null,
    title: documentTypeLabel(d.type),
  }));
  const clientName = linkedClient?.name?.trim() || null;
  const hasRecentMessages = (recentMessages ?? []).length > 0;
  const attentionCount = attentionTasks.length + signatureItems.length;
  // "View all" goes to the only project, or the project of the newest item.
  const singleProjectId = projects?.length === 1 ? projects[0].id : null;
  const messagesProjectId = singleProjectId ?? recentMessages?.[0]?.project_id ?? null;
  const documentsProjectId = singleProjectId ?? docs[0]?.project_id ?? null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 md:px-10 md:py-14">
      <header className="mb-8 md:mb-12">
        <h1 className="text-balance font-serif text-3xl leading-[1.05] tracking-tight text-black md:text-4xl">
          Welcome, {greetingName}.
        </h1>
        <p className="mt-3 max-w-xl font-serif text-xl italic text-neutral-500">
          Your projects, in one place.
        </p>
      </header>

      {!projects || projects.length === 0 ? (
        <p className="text-neutral-400">No projects yet. Check back soon.</p>
      ) : (
        <PortalSectionStack>
          <PortalSection
            tier={1}
            title="Needs your attention"
            count={attentionCount > 0 ? attentionCount : undefined}
          >
            <PortalAttentionList
              tasks={attentionTasks}
              signatures={signatureItems}
              today={today}
              clientName={clientName}
            />
          </PortalSection>

          {comingUp.length > 0 ? (
            <PortalSection
              title="Coming up"
              intro="What's next on the calendar, from you and from Skapa."
            >
              <UpcomingTasksPanel
                tasks={comingUp}
                viewerRole="client"
                today={today}
                clientName={clientName}
              />
            </PortalSection>
          ) : null}

          <section>
            <ul className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => {
                const phaseIndex = PHASE_ORDER.indexOf(p.phase);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/portal/projects/${p.id}`}
                      className="surface-raised group block p-6 transition-shadow hover:shadow-[0_2px_4px_rgba(10,10,10,0.04),0_12px_28px_rgba(10,10,10,0.08)] sm:p-7"
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

          {hasRecentMessages || docs.length > 0 ? (
            <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-14">
              {hasRecentMessages ? (
                <PortalSection
                  tier={3}
                  title="Recent messages"
                  action={<ViewAllLink href={`/portal/projects/${messagesProjectId}/messages`} />}
                >
                  <ul className="space-y-5">
                    {(recentMessages ?? []).map((m) => (
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
                </PortalSection>
              ) : null}

              {docs.length > 0 ? (
                <PortalSection
                  tier={3}
                  title="Latest documents"
                  action={<ViewAllLink href={`/portal/projects/${documentsProjectId}/documents`} />}
                >
                  <ul className="divide-y divide-neutral-200">
                    {docs.map((d) => {
                      const meta = docStatusMeta[d.id];
                      const label = clientDocumentStatusLabel({
                        status: d.status,
                        isMyTurn: Boolean(meta?.isMyTurn),
                        waitingOnName: meta?.waitingOnName,
                        requiresSignature: Boolean(d.requires_signature),
                      });
                      return (
                        <li
                          key={d.id}
                          className="flex items-center justify-between gap-4 py-3 first:pt-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-serif text-lg text-black">
                              {documentTypeLabel(d.type)}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-neutral-400">
                              {projectNameById[d.project_id]}
                              <span className="text-neutral-300"> · </span>
                              {label}
                            </p>
                          </div>
                          <Link
                            href={`/portal/projects/${d.project_id}/documents?open=${d.id}`}
                            className="shrink-0 font-mono text-[11px] text-neutral-500 underline decoration-dotted hover:text-black"
                          >
                            Open
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </PortalSection>
              ) : null}
            </div>
          ) : null}
        </PortalSectionStack>
      )}
    </div>
  );
}
