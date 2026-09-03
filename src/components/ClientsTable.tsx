"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import {
  addClientsToProject,
  deleteClients,
  getClientDeletionImpacts,
  type ClientDeletionImpact,
} from "@/app/actions/clients";

type Client = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  accent_color?: string | null;
  created_at: string;
};

type ProjectOption = {
  id: string;
  name: string;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function buildDeletionSummary(impact: ClientDeletionImpact) {
  if (impact.totals.projects === 0) return null;

  const projectNames = impact.primaryProjects.map((project) => project.name).join(", ");
  const documentPart = pluralize(impact.totals.documents, "document");
  const signedPart =
    impact.totals.signedAgreements > 0
      ? `, including ${pluralize(impact.totals.signedAgreements, "signed agreement")}`
      : "";

  return `${impact.clientName} has ${pluralize(impact.totals.projects, "project")} (${projectNames}) with ${documentPart}${signedPart}.`;
}

function buildCascadeSummary(impact: ClientDeletionImpact) {
  return [
    pluralize(impact.totals.projects, "project"),
    pluralize(impact.totals.tasks, "task"),
    pluralize(impact.totals.documents, "document"),
    pluralize(impact.totals.messages, "message"),
    pluralize(impact.totals.notes, "note"),
  ].join(", ");
}

export default function ClientsTable({
  initialClients,
  availableProjects,
}: {
  initialClients: Client[];
  availableProjects: ProjectOption[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addCompany, setAddCompany] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projectQuery, setProjectQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectActionError, setProjectActionError] = useState<string | null>(null);
  const [addingToProject, setAddingToProject] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deletePreview, setDeletePreview] = useState<ClientDeletionImpact[]>([]);
  const [loadingDeletePreview, setLoadingDeletePreview] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedClients = useMemo(
    () => clients.filter((client) => selectedSet.has(client.id)),
    [clients, selectedSet],
  );
  const allVisibleSelected = clients.length > 0 && selectedIds.length === clients.length;
  const filteredProjects = useMemo(() => {
    const term = projectQuery.trim().toLowerCase();
    if (!term) return availableProjects.slice(0, 8);
    return availableProjects
      .filter((project) => project.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [availableProjects, projectQuery]);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: addName.trim(),
          email: addEmail.trim() || null,
          company: addCompany.trim() || null,
        })
        .select()
        .single();

      setAdding(false);
      if (error || !data) {
        setAddError(error?.message ?? "Something went wrong.");
        return;
      }

      setClients((curr) => [data as Client, ...curr]);
      setAddName("");
      setAddEmail("");
      setAddCompany("");
      setAddOpen(false);
      setNotice(`Added ${data.name}.`);
    } catch {
      setAdding(false);
      setAddError("Something went wrong.");
    }
  }

  function toggleSelected(clientId: string) {
    setSelectedIds((curr) =>
      curr.includes(clientId) ? curr.filter((id) => id !== clientId) : [...curr, clientId],
    );
  }

  function toggleAll() {
    setSelectedIds(allVisibleSelected ? [] : clients.map((client) => client.id));
  }

  async function openDeleteModal(clientIds: string[]) {
    setDeleteTargetIds(clientIds);
    setDeletePreview([]);
    setDeleteError(null);
    setDeleteModalOpen(true);
    setLoadingDeletePreview(true);

    const result = await getClientDeletionImpacts(clientIds);

    setLoadingDeletePreview(false);
    if (!result.success) {
      setDeleteError(result.error);
      return;
    }

    setDeletePreview(result.data);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setDeleteTargetIds([]);
    setDeletePreview([]);
    setDeleteError(null);
    setLoadingDeletePreview(false);
  }

  async function confirmDelete(deletePrimaryProjects: boolean) {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteClients(deleteTargetIds, deletePrimaryProjects);
    setDeleting(false);

    if (!result.success) {
      setDeleteError(result.error);
      return;
    }

    const deletedIds = new Set(result.data.deletedClientIds);
    setClients((curr) => curr.filter((client) => !deletedIds.has(client.id)));
    setSelectedIds((curr) => curr.filter((id) => !deletedIds.has(id)));
    setNotice(
      result.data.deletedClientIds.length === 1
        ? "Client deleted."
        : `${pluralize(result.data.deletedClientIds.length, "client")} deleted.`,
    );
    closeDeleteModal();
  }

  async function handleBulkAddToProject(e: React.FormEvent) {
    e.preventDefault();
    setProjectActionError(null);

    if (!selectedProjectId) {
      setProjectActionError("Choose a project first.");
      return;
    }

    setAddingToProject(true);
    const result = await addClientsToProject(selectedIds, selectedProjectId);
    setAddingToProject(false);

    if (!result.success) {
      setProjectActionError(result.error);
      return;
    }

    const projectName =
      availableProjects.find((project) => project.id === selectedProjectId)?.name ?? "that project";
    setNotice(
      result.data.addedClientIds.length > 0
        ? `${pluralize(result.data.addedClientIds.length, "client")} added to ${projectName}.`
        : `All selected clients were already the primary client or already linked to ${projectName}.`,
    );
    setSelectedIds([]);
    setSelectedProjectId("");
    setProjectQuery("");
    setProjectActionError(null);
    setAddProjectOpen(false);
  }

  return (
    <div>
      <div className="mb-10 flex items-baseline justify-between">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
            Admin
          </p>
          <h1 className="font-serif text-4xl text-black">Clients</h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Add client
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {selectedIds.length} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAddProjectOpen(true)}
              className="border border-neutral-300 bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-800 transition-colors hover:border-black"
            >
              Add to project
            </button>
            <button
              onClick={() => openDeleteModal(selectedIds)}
              className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red-700 transition-colors hover:border-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-mono text-xs text-green-800">
          {notice}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add client">
        <form onSubmit={addClient} className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Name
            </label>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              required
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Email (optional)
            </label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Company (optional)
            </label>
            <input
              value={addCompany}
              onChange={(e) => setAddCompany(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {addError && <p className="font-mono text-xs text-red-600">{addError}</p>}
          <button
            type="submit"
            disabled={adding || !addName.trim()}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {adding ? "Adding…" : "Add client"}
          </button>
        </form>
      </Modal>

      <Modal
        open={addProjectOpen}
        onClose={() => {
          if (addingToProject) return;
          setAddProjectOpen(false);
          setProjectActionError(null);
        }}
        title="Add selected clients to project"
      >
        <form onSubmit={handleBulkAddToProject} className="space-y-4">
          <p className="text-sm text-neutral-600">
            {selectedClients.map((client) => client.name).join(", ")}
          </p>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Search project
            </label>
            <input
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              placeholder="Start typing a project name"
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-neutral-200">
            {filteredProjects.length === 0 ? (
              <p className="px-4 py-5 text-sm text-neutral-400">No matching projects.</p>
            ) : (
              filteredProjects.map((project) => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0 hover:bg-neutral-50"
                >
                  <input
                    type="radio"
                    name="project"
                    checked={selectedProjectId === project.id}
                    onChange={() => setSelectedProjectId(project.id)}
                  />
                  <span className="text-sm text-black">{project.name}</span>
                </label>
              ))
            )}
          </div>
          {projectActionError && (
            <p className="font-mono text-xs text-red-600">{projectActionError}</p>
          )}
          <button
            type="submit"
            disabled={addingToProject || !selectedProjectId}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {addingToProject ? "Saving…" : "Add to project"}
          </button>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Delete client">
        {loadingDeletePreview ? (
          <p className="text-sm text-neutral-500">Checking linked projects and records…</p>
        ) : deletePreview.length === 0 ? (
          <p className="text-sm text-neutral-500">No clients selected.</p>
        ) : (
          <div className="space-y-5">
            {deletePreview.some((impact) => impact.totals.projects > 0) ? (
              <>
                <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-red-700">
                    Project deletion required
                  </p>
                  <p className="text-sm leading-6 text-red-900">
                    These clients are still the primary client on active project records. Nothing
                    will be deleted unless you explicitly confirm deleting those projects too.
                  </p>
                </div>

                <div className="space-y-4">
                  {deletePreview.map((impact) => (
                    <div key={impact.clientId} className="rounded-xl border border-neutral-200 p-4">
                      <p className="font-medium text-black">{impact.clientName}</p>
                      {impact.totals.projects > 0 ? (
                        <>
                          <p className="mt-2 text-sm text-neutral-700">
                            {buildDeletionSummary(impact)}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {impact.primaryProjects.map((project) => (
                              <li key={project.id} className="text-sm text-neutral-600">
                                <span className="font-medium text-black">{project.name}</span>
                                {": "}
                                {[
                                  pluralize(1, "project"),
                                  pluralize(project.tasks, "task"),
                                  pluralize(project.documents, "document"),
                                  pluralize(project.messages, "message"),
                                  pluralize(project.notes, "note"),
                                  project.signedAgreements > 0
                                    ? pluralize(project.signedAgreements, "signed agreement")
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 font-mono text-xs text-red-700">
                            Deleting this client will also destroy {buildCascadeSummary(impact)}.
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-neutral-600">
                          No primary projects will be deleted for this client.
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {deleteError && <p className="font-mono text-xs text-red-600">{deleteError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => confirmDelete(true)}
                    disabled={deleting}
                    className="bg-red-600 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                  >
                    {deleting ? "Deleting…" : "Delete client and their project(s)"}
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
                <p className="text-sm text-neutral-500">
                  To keep the project, reassign its primary client from the project&apos;s own
                  settings first, then retry the client deletion.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-700">
                  Delete{" "}
                  {deletePreview.length === 1
                    ? deletePreview[0].clientName
                    : `${pluralize(deletePreview.length, "selected client")}`}
                  ?
                </p>
                {deletePreview.some((impact) => impact.additionalProjectCount > 0) && (
                  <p className="text-sm text-neutral-500">
                    Any secondary project links for these clients will also be removed.
                  </p>
                )}
                {deleteError && <p className="font-mono text-xs text-red-600">{deleteError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => confirmDelete(false)}
                    disabled={deleting}
                    className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {deleting ? "Deleting…" : "Delete client"}
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
              </>
            )}
          </div>
        )}
      </Modal>

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        {clients.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-neutral-400">
            No clients yet. Convert a lead from the{" "}
            <Link href="/admin/leads" className="text-brand-pink hover:underline">
              Leads
            </Link>{" "}
            page, or add one directly above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 pl-5 pr-3">
                    <input
                      type="checkbox"
                      aria-label="Select all clients"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="py-3 pl-5 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Name</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Email</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Company</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Accent</th>
                  <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Client since</th>
                  <th className="py-3 pl-2 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50">
                    <td className="py-4 pl-5 pr-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${client.name}`}
                        checked={selectedSet.has(client.id)}
                        onChange={() => toggleSelected(client.id)}
                      />
                    </td>
                    <td className="py-4 pl-5 pr-4">
                      <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-3">
                        <Avatar name={client.name} size="sm" />
                        <span className="font-sans text-sm text-black hover:text-brand-pink hover:underline">
                          {client.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                      {client.email || <span className="text-neutral-300">–</span>}
                    </td>
                    <td className="py-4 pr-4 font-sans text-sm text-neutral-600">
                      {client.company || <span className="text-neutral-300">–</span>}
                    </td>
                    <td className="py-4 pr-4">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="inline-flex items-center gap-2"
                        title={client.accent_color || "Default accent"}
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block h-4 w-4 rounded-full border border-neutral-200"
                          style={{
                            backgroundColor: client.accent_color || "#FF2791",
                          }}
                        />
                        <span className="font-mono text-[11px] text-neutral-400">
                          {client.accent_color || "Default"}
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-4 pr-5 font-mono text-xs text-neutral-500">
                      {new Date(client.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-4 pl-2 pr-5">
                      <button
                        type="button"
                        onClick={() => openDeleteModal([client.id])}
                        className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-red-600"
                      >
                        Delete
                      </button>
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
