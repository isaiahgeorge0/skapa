"use client";

import { useMemo, useState, useTransition } from "react";
import { updateProjectRequestStatus } from "@/app/actions/project-requests";
import { deleteProjectRequests } from "@/app/actions/admin-deletes";
import Modal from "@/components/Modal";
import {
  PROJECT_REQUEST_STATUSES,
  type ProjectRequest,
  type ProjectRequestStatus,
} from "@/lib/project-request-status";

const STATUS_LABELS: Record<ProjectRequestStatus, string> = {
  new: "New",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

export default function AdminRequestsPanel({
  initialRequests,
}: {
  initialRequests: ProjectRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [draftStatuses, setDraftStatuses] = useState<
    Record<string, ProjectRequestStatus>
  >({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<Record<string, true>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    requests.length > 0 && selectedIds.length === requests.length;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSelected(requestId: string) {
    setSelectedIds((curr) =>
      curr.includes(requestId)
        ? curr.filter((id) => id !== requestId)
        : [...curr, requestId],
    );
  }

  function toggleAll() {
    setSelectedIds(allVisibleSelected ? [] : requests.map((r) => r.id));
  }

  function openDeleteModal(ids: string[]) {
    setDeleteTargetIds(ids);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setDeleteTargetIds([]);
    setDeleteError(null);
    setDeleting(false);
  }

  async function confirmDelete() {
    const ids = deleteTargetIds;
    if (ids.length === 0) return;

    setDeleting(true);
    setDeleteError(null);

    const previous = requests;
    const idsSet = new Set(ids);
    setRequests((curr) => curr.filter((r) => !idsSet.has(r.id)));
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));

    const result = await deleteProjectRequests(ids);
    setDeleting(false);

    if (!result.success) {
      setRequests(previous);
      setDeleteError(result.error);
      setSelectedIds(ids);
      return;
    }

    closeDeleteModal();
  }

  function statusFor(request: ProjectRequest): ProjectRequestStatus {
    return draftStatuses[request.id] ?? request.status;
  }

  function save(request: ProjectRequest) {
    const status = statusFor(request);
    setErrors((curr) => {
      const next = { ...curr };
      delete next[request.id];
      return next;
    });
    setSavedIds((curr) => {
      const next = { ...curr };
      delete next[request.id];
      return next;
    });
    setPendingId(request.id);
    startTransition(async () => {
      const result = await updateProjectRequestStatus(
        request.id,
        status,
        drafts[request.id] ?? request.admin_response ?? "",
      );
      setPendingId(null);
      if (!result.success) {
        setErrors((curr) => ({ ...curr, [request.id]: result.error }));
        return;
      }
      if (result.request) {
        setRequests((curr) =>
          curr.map((r) => (r.id === result.request!.id ? result.request! : r)),
        );
        setDraftStatuses((curr) => {
          const next = { ...curr };
          delete next[request.id];
          return next;
        });
        setDrafts((curr) => {
          const next = { ...curr };
          delete next[request.id];
          return next;
        });
        setSavedIds((curr) => ({ ...curr, [request.id]: true }));
      }
    });
  }

  if (requests.length === 0) {
    return (
      <p className="font-mono text-sm text-neutral-400">
        No client requests on this project yet.
      </p>
    );
  }

  const deleteModalTitle =
    deleteTargetIds.length === 1 ? "Delete request" : "Delete requests";

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {selectedIds.length} selected
          </p>
          <button
            type="button"
            onClick={() => openDeleteModal(selectedIds)}
            className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red-700 transition-colors hover:border-red-400"
          >
            Delete
          </button>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          aria-label="Select all requests"
          checked={allVisibleSelected}
          onChange={toggleAll}
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Select all
        </span>
      </div>

      <ul className="space-y-4">
        {requests.map((request) => {
          const isPending = pending && pendingId === request.id;
          const error = errors[request.id];
          const justSaved = savedIds[request.id];
          return (
            <li
              key={request.id}
              className="surface-raised group px-6 py-6 md:px-7 md:py-7"
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${request.title}`}
                  checked={selectedSet.has(request.id)}
                  onChange={() => toggleSelected(request.id)}
                  className="mt-1 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-serif text-xl text-black">{request.title}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                        {new Date(request.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDeleteModal([request.id])}
                        className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {request.description ? (
                    <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-600">
                      {request.description}
                    </p>
                  ) : null}
                  <label className="mt-4 block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                      Reply to client
                    </span>
                    <textarea
                      value={drafts[request.id] ?? request.admin_response ?? ""}
                      onChange={(e) =>
                        setDrafts((curr) => ({
                          ...curr,
                          [request.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="surface-control mt-2 w-full resize-y border border-neutral-200 bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-neutral-400"
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={statusFor(request)}
                      disabled={isPending}
                      onChange={(e) =>
                        setDraftStatuses((curr) => ({
                          ...curr,
                          [request.id]: e.target.value as ProjectRequestStatus,
                        }))
                      }
                      className="surface-control border-0 bg-neutral-100 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em]"
                    >
                      {PROJECT_REQUEST_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => save(request)}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600 underline decoration-dotted hover:text-black disabled:opacity-50"
                    >
                      {isPending ? "Saving…" : "Save reply"}
                    </button>
                    {justSaved && !error ? (
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-green-700">
                        Saved · {STATUS_LABELS[request.status]}
                      </span>
                    ) : null}
                  </div>
                  {error ? (
                    <p className="mt-3 font-mono text-xs text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title={deleteModalTitle}>
        {deleting ? (
          <p className="text-sm text-neutral-500">Deleting…</p>
        ) : (
          <div className="space-y-5">
            <p className="font-mono text-sm text-neutral-800">
              Delete {deleteTargetIds.length}{" "}
              {deleteTargetIds.length === 1 ? "request" : "requests"}? This
              can&apos;t be undone.
            </p>
            {deleteError ? (
              <p className="font-mono text-xs text-red-600" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {deleteModalTitle}
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="border border-neutral-300 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700 hover:border-black disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
