type TimelineEvent = {
  id: string;
  event_type: string;
  detail: string | null;
  created_at: string;
  document_type: string | null;
};

const EVENT_LABELS: Record<string, string> = {
  created: "Document uploaded",
  sent: "Sent for review",
  viewed: "Viewed",
  signed: "Signed",
  status_changed: "Status updated",
};

export default function ProjectActivityTimeline({
  events,
}: {
  events: TimelineEvent[];
}) {
  if (events.length === 0) {
    return (
      <div className="border-l-2 border-portal-accent/30 pl-4">
        <p className="text-sm text-neutral-500">
          Activity will show here as documents are shared, reviewed and signed.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-5 border-l-2 border-portal-accent/35 pl-5">
      {events.map((event, index) => (
        <li key={event.id} className="relative">
          <span
            className={`absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full ${
              index === 0 ? "bg-portal-accent" : "bg-neutral-300"
            }`}
          />
          <p className="font-sans text-sm text-black">
            {EVENT_LABELS[event.event_type] ?? event.event_type}
            {event.document_type ? (
              <span className="capitalize text-neutral-500">
                {" "}
                · {event.document_type}
              </span>
            ) : null}
          </p>
          {event.detail ? (
            <p className="mt-0.5 font-mono text-xs text-neutral-500">{event.detail}</p>
          ) : null}
          <p className="mt-1 font-mono text-[10px] text-neutral-400">
            {new Date(event.created_at).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </li>
      ))}
    </ol>
  );
}
