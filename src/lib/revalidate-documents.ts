import { revalidatePath } from "next/cache";

/** Invalidate portal + admin surfaces that show document signing state. */
export function revalidateDocumentPaths(projectId: string) {
  revalidatePath("/portal");
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/documents`);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/documents`);
  revalidatePath(`/admin`);
}
