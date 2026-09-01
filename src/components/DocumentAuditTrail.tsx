"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  document_id: string;
  event_type: "created" | "sent" | "viewed" | "signed" | "status_changed";
  actor_role: "admin" | "client" | null;
  detail: string | null;
  created_at: string;
};

const EVENT_LABELS: Record<Event["event_type"], string> = {
  created: "Uploaded",
  sent: "Sent for review",
  viewed: "Viewed by client",
  signed: "Signed",
  status_changed: "Status changed",
};

const EVENT_DOTS: Record<Event["event_type"], string> = {
  created: "bg-neutral-300",
  sent: "bg-blue-400",
  viewed: "bg-amber-400",
  signed: "bg-green-500",
  status_changed: "bg-neutral-300",
};

// Reusable timeline for ANY document — pass a document_id and it fetches
// and renders that document's full event history. Intended to live inside
// a project's Documents section (per-document, expandable), not as a
// separate global page.
export default function DocumentAuditTrail({ documentId }: { documentId: string }) {
  const [events, setEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("document_events")
      .select("id, document_id, event_type, actor_role, detail, created_at")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setEvents((data as Event[]) ?? []));
  }, [documentId]);

  if (events === null) {
    return <p className="font-mono text-xs text-neutral-400">Loading history…</p>;
  }

  if (events.length === 0) {
    return <p className="font-mono text-xs text-neutral-400">No activity recorded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${EVENT_DOTS[e.event_type]}`} />
          <div>
            <p className="font-sans text-sm text-black">
              {EVENT_LABELS[e.event_type]}
              {e.actor_role && (
                <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  {e.actor_role}
                </span>
              )}
            </p>
            {e.detail && <p className="font-mono text-xs text-neutral-500">{e.detail}</p>}
            <p className="font-mono text-[10px] text-neutral-400">
              {new Date(e.created_at).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
