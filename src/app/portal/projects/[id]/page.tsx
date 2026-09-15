import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PhaseTracker, { type Phase } from "@/components/PhaseTracker";
import TasksChecklist from "@/components/TasksChecklist";
import PortalSection, { PortalSectionStack } from "@/components/PortalSection";
import ProjectActivityTimeline from "@/components/ProjectActivityTimeline";
import PortalNowHero from "@/components/PortalNowHero";
import OverviewPreviewCard from "@/components/OverviewPreviewCard";
import type { ProjectRequest } from "@/lib/project-request-status";

export const dynamic = "force-dynamic";

const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "Received",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function pluralize(count: number, noun: string) {
  return count === 1 ? `1 ${noun}` : `${count} ${noun}s`;
}

export default async function PortalProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const base = `/portal/projects/${id}`;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, phase, client_id")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [{ data: documents }, { data: messages }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id, type, status, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("id, sender_role, body, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("project_tasks")
        .select("id, title, is_complete, phase")
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
    ]);

  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("project_requests")
    .select("id, title, status, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const requestList = (requests ?? []) as Pick<
    ProjectRequest,
    "id" | "title" | "status" | "created_at"
  >[];

  const documentIds = (documents ?? []).map((doc) => doc.id);
  let timelineEvents: {
    id: string;
    event_type: string;
    detail: string | null;
    created_at: string;
    document_type: string | null;
  }[] = [];

  if (documentIds.length > 0) {
    const typeById = new Map((documents ?? []).map((doc) => [doc.id, doc.type]));
    const { data: events } = await supabase
      .from("document_events")
      .select("id, document_id, event_type, detail, created_at")
      .in("document_id", documentIds)
      .order("created_at", { ascending: false })
      .limit(12);

    timelineEvents = (events ?? []).map((event) => ({
      id: event.id,
      event_type: event.event_type,
      detail: event.detail,
      created_at: event.created_at,
      document_type: typeById.get(event.document_id) ?? null,
    }));
  }

  const { count: messageCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("project_id", id);

  const docItems = (documents ?? []).slice(0, 3).map((doc) => ({
    id: doc.id,
    title: doc.type,
    meta: `${doc.status.replaceAll("_", " ")} · ${formatShortDate(doc.created_at)}`,
  }));

  const messageItems = (messages ?? []).map((m) => ({
    id: m.id,
    title: m.body.length > 90 ? `${m.body.slice(0, 90)}…` : m.body,
    meta: `${m.sender_role === "admin" ? "skapa" : "You"} · ${formatShortDate(m.created_at)}`,
  }));

  const requestItems = requestList.slice(0, 3).map((r) => ({
    id: r.id,
    title: r.title,
    meta: `${REQUEST_STATUS_LABELS[r.status] ?? r.status} · ${formatShortDate(r.created_at)}`,
  }));

  return (
    <div className="space-y-12 md:space-y-16">
      <PortalNowHero phase={project.phase as Phase} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        <OverviewPreviewCard
          tone="portal"
          title="Documents"
          countLabel={pluralize((documents ?? []).length, "document")}
          href={`${base}/documents`}
          items={docItems}
          empty="Nothing shared yet."
        />
        <OverviewPreviewCard
          tone="portal"
          title="Messages"
          countLabel={pluralize(messageCount ?? 0, "message")}
          href={`${base}/messages`}
          items={messageItems}
          empty="No messages yet."
        />
        <OverviewPreviewCard
          tone="portal"
          title="Requests"
          countLabel={pluralize(requestList.length, "request")}
          href={`${base}/requests`}
          items={requestItems}
          empty="No requests yet."
        />
      </div>

      <PortalSectionStack>
        <PortalSection title="Where things stand">
          <div className="surface-raised px-6 py-7 md:px-7 md:py-8">
            <PhaseTracker
              projectId={project.id}
              initialPhase={project.phase as Phase}
              readOnly
              usePortalAccent
              showNow={false}
              showPercent
            />
          </div>
        </PortalSection>

        <PortalSection
          title="This phase"
          intro={
            <p className="text-sm text-neutral-500">Checklist for right now.</p>
          }
        >
          <TasksChecklist
            projectId={project.id}
            currentPhase={project.phase}
            initialTasks={tasks ?? []}
            canManage={false}
          />
        </PortalSection>

        <PortalSection
          title="Activity"
          intro={
            <p className="text-sm text-neutral-500">
              Recent document movements on this project.
            </p>
          }
        >
          <div className="surface-raised px-6 py-6 md:px-7 md:py-7">
            <ProjectActivityTimeline events={timelineEvents} />
          </div>
        </PortalSection>
      </PortalSectionStack>
    </div>
  );
}
