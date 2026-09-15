export type ProjectAlert = {
  id: string;
  text: string;
  href: string;
};

type RequestLike = {
  id: string;
  status: string;
  title: string;
};

type DocumentLike = {
  id: string;
  type: string;
  status: string;
};

type MessageLike = {
  sender_role: "client" | "admin" | string;
  created_at: string;
};

/**
 * Build actionable admin overview alerts for a single project.
 * Only surfaces signals that warrant attention — empty when quiet.
 */
export function buildAdminProjectAlerts({
  projectId,
  requests,
  documents,
  messages,
  targetCompletionDate,
  now = new Date(),
}: {
  projectId: string;
  requests: RequestLike[];
  documents: DocumentLike[];
  messages: MessageLike[];
  targetCompletionDate: string | null;
  now?: Date;
}): ProjectAlert[] {
  const base = `/admin/projects/${projectId}`;
  const alerts: ProjectAlert[] = [];

  const awaitingReply = requests.filter((r) => r.status === "new");
  if (awaitingReply.length === 1) {
    alerts.push({
      id: "request-awaiting",
      text: `1 request awaiting reply — “${awaitingReply[0].title}”`,
      href: `${base}/requests`,
    });
  } else if (awaitingReply.length > 1) {
    alerts.push({
      id: "request-awaiting",
      text: `${awaitingReply.length} requests awaiting reply`,
      href: `${base}/requests`,
    });
  }

  const unviewed = documents.filter((d) => d.status === "sent");
  for (const doc of unviewed.slice(0, 2)) {
    const label = doc.type?.trim() || "document";
    alerts.push({
      id: `doc-unviewed-${doc.id}`,
      text: `Client hasn't viewed ${label}`,
      href: `${base}/documents`,
    });
  }

  const lastMessage = messages.length
    ? messages[messages.length - 1]
    : null;
  if (lastMessage?.sender_role === "client") {
    alerts.push({
      id: "client-message",
      text: "Client messaged — awaiting your reply",
      href: `${base}/messages`,
    });
  }

  if (targetCompletionDate) {
    const target = new Date(targetCompletionDate);
    if (!Number.isNaN(target.getTime())) {
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfTarget = new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate(),
      );
      const diffDays = Math.round(
        (startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000,
      );

      if (diffDays < 0) {
        alerts.push({
          id: "target-overdue",
          text: `Target date passed ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`,
          href: base,
        });
      } else if (diffDays === 0) {
        alerts.push({
          id: "target-today",
          text: "Target date is today",
          href: base,
        });
      } else if (diffDays <= 14) {
        alerts.push({
          id: "target-soon",
          text: `Target date in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
          href: base,
        });
      }
    }
  }

  return alerts;
}
