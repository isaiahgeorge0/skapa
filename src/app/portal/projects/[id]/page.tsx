import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Phase } from "@/components/PhaseTracker";
import PortalSection, { PortalSectionStack } from "@/components/PortalSection";
import ProjectActivityTimeline from "@/components/ProjectActivityTimeline";
import PortalNowHero from "@/components/PortalNowHero";
import UpcomingTasksPanel from "@/components/UpcomingTasksPanel";
import PortalWorkingOn from "@/components/PortalWorkingOn";
import PortalLatest, { type PortalLatestGroup } from "@/components/PortalLatest";
import ProjectLinksList from "@/components/ProjectLinksList";
import type { ProjectRequest } from "@/lib/project-request-status";
import { documentTypeLabel } from "@/lib/document-types";
import { PROJECT_LINK_COLUMNS, parseHttpUrl, type ProjectLink } from "@/lib/project-links";
import {
  PROJECT_TASK_COLUMNS,
  londonToday,
  sortByImportance,
  type ProjectTask,
} from "@/lib/tasks";

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

export default async function PortalProjectOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { id } = await params;
  const { task: openTaskId } = await searchParams;
  const supabase = await createClient();
  const base = `/portal/projects/${id}`;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, phase, client_id")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [
    { data: documents },
    { data: messages, count: messageCount },
    { data: tasks },
    { data: links },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id, type, status, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("id, sender_role, body, created_at", { count: "exact" })
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("project_tasks")
      .select(PROJECT_TASK_COLUMNS)
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("project_links")
      .select(PROJECT_LINK_COLUMNS)
      .eq("project_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const admin = createAdminClient();
  const [{ data: requests }, { data: client }] = await Promise.all([
    admin
      .from("project_requests")
      .select("id, title, status, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    project.client_id
      ? admin.from("clients").select("name").eq("id", project.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const today = londonToday();
  const clientName = client?.name?.trim() || null;
  const taskList = (tasks ?? []) as unknown as ProjectTask[];
  const needsFromClient = sortByImportance(
    taskList.filter((t) => t.assignee === "client" && !t.is_complete),
    today,
  );
  const workingOnOpen = sortByImportance(
    taskList.filter(
      (t) =>
        t.assignee === "admin" &&
        !t.is_complete &&
        (t.phase === null || t.phase === project.phase),
    ),
    today,
  );
  const completedTasks = sortByImportance(
    taskList.filter((t) => t.is_complete),
    today,
  );

  const linkList = ((links ?? []) as ProjectLink[]).filter((l) => parseHttpUrl(l.url));
  const documentList = documents ?? [];
  const requestList = (requests ?? []) as Pick<
    ProjectRequest,
    "id" | "title" | "status" | "created_at"
  >[];

  let timelineEvents: {
    id: string;
    event_type: string;
    detail: string | null;
    created_at: string;
    document_type: string | null;
  }[] = [];

  if (documentList.length > 0) {
    const typeById = new Map(documentList.map((doc) => [doc.id, doc.type]));
    const { data: events } = await supabase
      .from("document_events")
      .select("id, document_id, event_type, detail, created_at")
      .in(
        "document_id",
        documentList.map((doc) => doc.id),
      )
      .order("created_at", { ascending: false })
      .limit(5);

    timelineEvents = (events ?? []).map((event) => ({
      id: event.id,
      event_type: event.event_type,
      detail: event.detail,
      created_at: event.created_at,
      document_type: typeById.get(event.document_id) ?? null,
    }));
  }

  const latestGroups: PortalLatestGroup[] = [
    {
      key: "documents",
      label: "Documents",
      count: documentList.length,
      viewAllHref: `${base}/documents`,
      items: documentList.slice(0, 3).map((doc) => ({
        id: doc.id,
        title: documentTypeLabel(doc.type),
        meta: `${doc.status.replaceAll("_", " ")} · ${formatShortDate(doc.created_at)}`,
        href: `${base}/documents?open=${doc.id}`,
      })),
    },
    {
      key: "messages",
      label: "Messages",
      count: messageCount ?? (messages ?? []).length,
      viewAllHref: `${base}/messages`,
      items: (messages ?? []).map((m) => ({
        id: m.id,
        title: m.body.length > 90 ? `${m.body.slice(0, 90)}…` : m.body,
        meta: `${m.sender_role === "admin" ? "Skapa" : "You"} · ${formatShortDate(m.created_at)}`,
        href: `${base}/messages`,
      })),
    },
    {
      key: "requests",
      label: "Requests",
      count: requestList.length,
      viewAllHref: `${base}/requests`,
      items: requestList.slice(0, 3).map((r) => ({
        id: r.id,
        title: r.title,
        meta: `${REQUEST_STATUS_LABELS[r.status] ?? r.status} · ${formatShortDate(r.created_at)}`,
        href: `${base}/requests`,
      })),
    },
  ];

  const showNeeds = needsFromClient.length > 0;
  const showWorkingOn = workingOnOpen.length > 0 || completedTasks.length > 0;
  const showLinks = linkList.length > 0;
  const showLatest = latestGroups.some((g) => g.count > 0 && g.items.length > 0);
  const showActivity = timelineEvents.length > 0;
  const showCalmLine = !showNeeds && !showWorkingOn && !showLinks && !showLatest && !showActivity;

  const workingOn = (
    <PortalWorkingOn
      openTasks={showWorkingOn ? workingOnOpen : []}
      completedTasks={showWorkingOn ? completedTasks : []}
      allTasks={taskList}
      openTaskId={openTaskId}
      projectName={project.name}
      clientName={clientName}
      today={today}
    />
  );

  return (
    <PortalSectionStack density="compact">
      <div>
        <PortalNowHero projectId={project.id} phase={project.phase as Phase} />
        {showCalmLine ? (
          <p className="mt-5 px-1 text-sm leading-relaxed text-neutral-500">
            Nothing needed from you right now. We&apos;ll flag it here when that changes.
          </p>
        ) : null}
      </div>

      {showNeeds ? (
        <PortalSection tier={1} title="Needs from you" count={needsFromClient.length}>
          <UpcomingTasksPanel
            tasks={needsFromClient}
            viewerRole="client"
            today={today}
            showProject={false}
            clientName={clientName}
            hideAssignee
            variant="plain"
          />
        </PortalSection>
      ) : null}

      {showWorkingOn ? (
        <PortalSection tier={2} title="What we're working on">
          {workingOn}
        </PortalSection>
      ) : (
        workingOn
      )}

      {showLinks ? (
        <PortalSection tier={3} title="Links">
          <ProjectLinksList links={linkList} />
        </PortalSection>
      ) : null}

      <PortalLatest groups={latestGroups} />

      {showActivity ? (
        <PortalSection tier={3} title="Activity">
          <ProjectActivityTimeline events={timelineEvents} />
        </PortalSection>
      ) : null}
    </PortalSectionStack>
  );
}
