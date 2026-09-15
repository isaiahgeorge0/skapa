"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { deleteProjects } from "@/app/actions/admin-deletes";
import {
  archiveProjects,
  unarchiveProjects,
} from "@/app/actions/project-archive";

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  website_branding: "Website / Branding",
  social_rebrand: "Social Rebrand",
  client_proof_check: "Client Proof Check",
  final_sign_off: "Final Sign Off",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-neutral-100 text-neutral-500",
};

export type ProjectsTableRow = {
  id: string;
  name: string;
  phase: string;
  status: string;
  target_completion_date: string | null;
  clientName: string;
  archived_at: string | null;
};

export default function ProjectsTable({
  initialProjects,
}: {
  initialProjects: ProjectsTableRow[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const visibleProjects = useMemo(
    () =>
      projects.filter((p) =>
        showArchived ? Boolean(p.archived_at) : !p.archived_at,
      ),
    [projects, showArchived],
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    visibleProjects.length > 0 &&
    visibleProjects.every((p) => selectedSet.has(p.id));

  const archivedCount = useMemo(
    () => projects.filter((p) => Boolean(p.archived_at)).length,
    [projects],
  );

  function toggleSelected(projectId: string) {
    setSelectedIds((curr) =>
      curr.includes(projectId)
        ? curr.filter((id) => id !== projectId)
        : [...curr, projectId],
    );
  }

  function toggleAll() {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(visibleProjects.map((p) => p.id));
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

    const previous = projects;
    const idsSet = new Set(ids);
    setProjects((curr) => curr.filter((p) => !idsSet.has(p.id)));
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));

    const result = await deleteProjects(ids);
    setDeleting(false);

    if (!result.success) {
      setProjects(previous);
      setDeleteError(result.error);
      setSelectedIds(ids);
      return;
    }

    closeDeleteModal();
  }

  async function applyArchiveState(ids: string[], archive: boolean) {
    if (ids.length === 0) return;

    setArchiving(true);
    setArchiveError(null);

    const previous = projects;
    const idsSet = new Set(ids);
    const nextArchivedAt = archive ? new Date().toISOString() : null;

    setProjects((curr) =>
      curr.map((p) =>
        idsSet.has(p.id) ? { ...p, archived_at: nextArchivedAt } : p,
      ),
    );
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));

    const result = archive
      ? await archiveProjects(ids)
      : await unarchiveProjects(ids);

    setArchiving(false);

    if (!result.success) {
      setProjects(previous);
      setArchiveError(result.error);
      setSelectedIds(ids);
      return;
    }

    setProjects((curr) =>
      curr.map((p) =>
        idsSet.has(p.id) ? { ...p, archived_at: result.archivedAt } : p,
      ),
    );
  }

  const deleteLabel =
    deleteTargetIds.length === 1 ? "Delete project" : "Delete projects";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setShowArchived((curr) => !curr);
            setSelectedIds([]);
            setArchiveError(null);
          }}
          className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
            showArchived
              ? "border-black bg-black text-white"
              : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
          }`}
        >
          Show archived
          {archivedCount > 0 ? ` (${archivedCount})` : ""}
        </button>
        {showArchived ? (
          <p className="font-mono text-xs text-neutral-500">
            Viewing archived projects only. Unarchive to return them to the
            default list.
          </p>
        ) : null}
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {selectedIds.length} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={archiving}
              onClick={() =>
                applyArchiveState(selectedIds, !showArchived)
              }
              className="border border-neutral-300 bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-800 transition-colors hover:border-black hover:text-black disabled:opacity-50"
            >
              {archiving
                ? showArchived
                  ? "Unarchiving…"
                  : "Archiving…"
                : showArchived
                  ? "Unarchive"
                  : "Archive"}
            </button>
            <button
              type="button"
              onClick={() => openDeleteModal(selectedIds)}
              className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red-700 transition-colors hover:border-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {archiveError ? (
        <p className="mb-4 font-mono text-xs text-red-600" role="alert">
          {archiveError}
        </p>
      ) : null}

      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title={deleteTargetIds.length === 1 ? "Delete project" : "Delete projects"}
      >
        {deleting ? (
          <p className="text-sm text-neutral-500">Deleting…</p>
        ) : (
          <div className="space-y-5">
            <p className="font-mono text-sm text-neutral-800">
              Delete {deleteTargetIds.length}{" "}
              {deleteTargetIds.length === 1 ? "project" : "projects"}? This
              removes related messages, tasks, notes, and documents without
              signed data. This can&apos;t be undone.
            </p>
            {deleteError && (
              <p className="font-mono text-xs text-red-600" role="alert">
                {deleteError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {deleteLabel}
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

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        {visibleProjects.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-neutral-400">
            {showArchived
              ? "No archived projects."
              : projects.length === 0
                ? "No projects yet."
                : "No active projects. Toggle Show archived to see hidden ones."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 pl-5 pr-3">
                    <input
                      type="checkbox"
                      aria-label="Select all projects"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="py-3 pl-2 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Project
                  </th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Client
                  </th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Phase
                  </th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Status
                  </th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Target
                  </th>
                  <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50"
                  >
                    <td className="py-4 pl-5 pr-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={selectedSet.has(p.id)}
                        onChange={() => toggleSelected(p.id)}
                      />
                    </td>
                    <td className="py-4 pl-2 pr-4">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-sans text-sm text-black hover:text-brand-pink hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                      {p.clientName}
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs text-neutral-600">
                      {PHASE_LABELS[p.phase] ?? p.phase}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[p.status] ?? ""}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pr-4 font-mono text-xs text-neutral-500">
                      {p.target_completion_date
                        ? new Date(p.target_completion_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "Not set"}
                    </td>
                    <td className="py-4 pr-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={archiving}
                          onClick={() =>
                            applyArchiveState([p.id], !showArchived)
                          }
                          className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-black disabled:opacity-50"
                        >
                          {showArchived ? "Unarchive" : "Archive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal([p.id])}
                          className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
