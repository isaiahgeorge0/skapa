import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import UpcomingTasksPanel, { type UpcomingTaskRow } from "@/components/UpcomingTasksPanel";
import {
  PROJECT_TASK_COLUMNS,
  londonToday,
  relativeTime,
  sortByImportance,
  taskUrgency,
  type ProjectTask,
  type TaskComment,
} from "@/lib/tasks";

const DEADLINES_LIMIT = 12;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: leads },
    { count: clientCount },
    { data: projects },
    { count: documentCount },
    { data: openTaskRows },
    { data: clientNoteRows },
  ] = await Promise.all([
    supabase.from("leads").select("status"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id, name, archived_at"),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("project_tasks").select(PROJECT_TASK_COLUMNS).eq("is_complete", false),
    supabase
      .from("task_comments")
      .select("id, task_id, author_id, author_role, body, created_at")
      .eq("author_role", "client")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const counts = {
    total: leads?.length ?? 0,
    new: leads?.filter((l) => l.status === "new").length ?? 0,
    contacted: leads?.filter((l) => l.status === "contacted").length ?? 0,
    qualified: leads?.filter((l) => l.status === "qualified").length ?? 0,
  };

  const projectCount = projects?.length ?? 0;
  const activeProjectIds = new Set(
    (projects ?? []).filter((p) => !p.archived_at).map((p) => p.id),
  );
  const projectNameById = Object.fromEntries((projects ?? []).map((p) => [p.id, p.name]));

  const today = londonToday();
  const now = new Date();
  const openTasks: UpcomingTaskRow[] = ((openTaskRows ?? []) as unknown as ProjectTask[])
    .filter((t) => activeProjectIds.has(t.project_id))
    .map((t) => ({ ...t, project_name: projectNameById[t.project_id] ?? null }));

  const overdueCount = openTasks.filter((t) => taskUrgency(t, today) === "overdue").length;
  const waitingOnClients = openTasks.filter((t) => t.assignee === "client").length;

  const deadlines = sortByImportance(
    openTasks.filter((t) => {
      const urgency = taskUrgency(t, today);
      return urgency === "overdue" || urgency === "due_soon";
    }),
    today,
  );

  const clientNotes = (clientNoteRows ?? []) as TaskComment[];
  const noteTaskIds = [...new Set(clientNotes.map((n) => n.task_id))];
  const { data: noteTasks } =
    noteTaskIds.length > 0
      ? await supabase.from("project_tasks").select("id, title, project_id").in("id", noteTaskIds)
      : { data: [] as { id: string; title: string; project_id: string }[] };
  const noteTaskById = new Map((noteTasks ?? []).map((t) => [t.id, t]));

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <h1 className="mb-10 font-serif text-4xl text-black">Dashboard</h1>

        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Total leads" value={counts.total} />
          <StatCard label="New" value={counts.new} accent />
          <StatCard label="Contacted" value={counts.contacted} />
          <StatCard label="Clients" value={clientCount ?? 0} />
          <StatCard label="Documents" value={documentCount ?? 0} />
          <StatCard label="Overdue tasks" value={overdueCount} accent={overdueCount > 0} />
          <StatCard label="Waiting on clients" value={waitingOnClients} />
        </div>

        <div className="mb-14 grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Deadlines
              </h2>
              <p className="font-mono text-[11px] text-neutral-400">
                Overdue or due within 7 days
              </p>
            </div>
            <UpcomingTasksPanel
              tasks={deadlines.slice(0, DEADLINES_LIMIT)}
              viewerRole="admin"
              today={today}
              emptyText="Nothing overdue or due this week."
            />
            {deadlines.length > DEADLINES_LIMIT ? (
              <p className="mt-3 font-mono text-[11px] text-neutral-400">
                +{deadlines.length - DEADLINES_LIMIT} more — see each project&apos;s tasks.
              </p>
            ) : null}
          </section>

          <section className="lg:col-span-2">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              Latest client notes
            </h2>
            <Card bodyClassName="p-0">
              {clientNotes.length === 0 ? (
                <p className="px-5 py-5 text-sm text-neutral-500 md:px-6">
                  No client notes yet.
                </p>
              ) : (
                <ul className="divide-y divide-black/[0.05]">
                  {clientNotes.map((note) => {
                    const task = noteTaskById.get(note.task_id);
                    const body = (
                      <>
                        <p className="line-clamp-2 break-words text-sm text-black">{note.body}</p>
                        <p className="mt-1.5 font-mono text-[11px] text-neutral-500">
                          {task?.title ?? "Task"}
                          {task ? (
                            <>
                              <span className="text-neutral-300"> · </span>
                              {projectNameById[task.project_id] ?? "Project"}
                            </>
                          ) : null}
                          <span className="text-neutral-300"> · </span>
                          {relativeTime(note.created_at, now)}
                        </p>
                      </>
                    );
                    return (
                      <li key={note.id}>
                        {task ? (
                          <Link
                            href={`/admin/projects/${task.project_id}/tasks?task=${task.id}`}
                            className="block px-5 py-4 transition-colors hover:bg-black/[0.02] md:px-6"
                          >
                            {body}
                          </Link>
                        ) : (
                          <div className="px-5 py-4 md:px-6">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </section>
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
            description={`${projectCount} active engagement${projectCount === 1 ? "" : "s"}, phases, and progress.`}
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
    <div className={`surface-raised border-l-4 p-5 md:p-6 ${accent ? "border-l-brand-pink" : "border-l-transparent"}`}>
      <p className={`font-serif text-4xl ${accent ? "text-brand-pink" : "text-black"}`}>{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-neutral-500">{label}</p>
    </div>
  );
}

function AdminLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block h-full">
      <div className="surface-raised flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(10,10,10,0.04),0_12px_28px_rgba(10,10,10,0.08)]">
        <h2 className="mb-1 font-serif text-xl text-black">{title}</h2>
        <p className="font-mono text-xs leading-relaxed text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}
