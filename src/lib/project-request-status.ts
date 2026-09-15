/** Must match project_requests.status CHECK constraint. */
export type ProjectRequestStatus =
  | "new"
  | "in_review"
  | "accepted"
  | "declined"
  | "completed";

export const PROJECT_REQUEST_STATUSES: ProjectRequestStatus[] = [
  "new",
  "in_review",
  "accepted",
  "declined",
  "completed",
];

export function isProjectRequestStatus(
  value: string,
): value is ProjectRequestStatus {
  return (PROJECT_REQUEST_STATUSES as string[]).includes(value);
}

export type ProjectRequest = {
  id: string;
  project_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ProjectRequestStatus;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
};
