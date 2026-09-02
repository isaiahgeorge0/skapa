/** Plain-language document status for the client portal only. */

export type ClientFacingDocStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partially_signed"
  | "signed"
  | string;

export function clientDocumentStatusLabel({
  status,
  isMyTurn,
  waitingOnName,
}: {
  status: ClientFacingDocStatus;
  isMyTurn: boolean;
  waitingOnName?: string | null;
}): string {
  if (status === "signed") return "Signed";

  if (status === "sent" || status === "viewed" || status === "partially_signed") {
    if (isMyTurn) return "Needs your signature";
    if (waitingOnName) return `Waiting on ${waitingOnName}`;
    return "Awaiting signature";
  }

  // Drafts are RLS-hidden for clients; fall through for safety.
  return "Shared";
}

export function clientProjectStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "In progress";
    case "paused":
      return "Paused";
    case "completed":
      return "Complete";
    default:
      return status;
  }
}
