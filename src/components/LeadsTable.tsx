"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
type LeadSource = "contact_form" | "questionnaire" | "manual";

type LeadAnswers = {
  brandName?: string;
  need?: string;
  trigger?: string;
  budget?: string;
  timeline?: string;
  extra?: string;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  converted_client_id: string | null;
  source: LeadSource;
  answers: LeadAnswers | null;
};

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
];
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-brand-pink/10 text-brand-pink",
  contacted: "bg-blue-50 text-blue-700",
  qualified: "bg-green-50 text-green-700",
  won: "bg-yellow-50 text-yellow-700",
  lost: "bg-neutral-100 text-neutral-500",
};
const SOURCE_LABELS: Record<LeadSource, string> = {
  contact_form: "Contact form",
  questionnaire: "Questionnaire",
  manual: "Added manually",
};
const FILTERS: Array<"all" | LeadStatus> = [
  "all",
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
];

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const visibleLeads = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visibleSelectedCount = useMemo(
    () => visibleLeads.filter((l) => selectedSet.has(l.id)).length,
    [visibleLeads, selectedSet],
  );

  const allVisibleSelected =
    visibleLeads.length > 0 && visibleSelectedCount === visibleLeads.length;

  function toggleSelected(leadId: string) {
    setSelectedIds((curr) =>
      curr.includes(leadId)
        ? curr.filter((id) => id !== leadId)
        : [...curr, leadId],
    );
  }

  function toggleAll() {
    if (allVisibleSelected) {
      const visibleIds = new Set(visibleLeads.map((l) => l.id));
      setSelectedIds((curr) => curr.filter((id) => !visibleIds.has(id)));
      return;
    }

    const nextVisibleIds = visibleLeads.map((l) => l.id);
    setSelectedIds((curr) => [...new Set([...curr, ...nextVisibleIds])]);
  }

  const [bulkStatus, setBulkStatus] = useState<LeadStatus>("new");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkStatusError, setBulkStatusError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  async function bulkChangeStatus() {
    const ids = selectedIds;
    if (ids.length === 0) return;

    setBulkUpdating(true);
    setBulkStatusError(null);

    const previous = leads;
    const idsSet = new Set(ids);

    setLeads((curr) =>
      curr.map((l) => (idsSet.has(l.id) ? { ...l, status: bulkStatus } : l)),
    );

    const { error } = await supabase
      .from("leads")
      .update({ status: bulkStatus })
      .in("id", ids);

    setBulkUpdating(false);

    if (error) {
      console.error("Bulk status update failed:", error);
      setLeads(previous);
      setBulkStatusError(error.message);
      return;
    }

    setSelectedIds([]);
  }

  async function confirmBulkDelete() {
    const ids = deleteTargetIds;
    if (ids.length === 0) return;

    setDeleting(true);
    setDeleteError(null);

    const previousLeads = leads;
    const idsSet = new Set(ids);

    setLeads((curr) => curr.filter((l) => !idsSet.has(l.id)));
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));
    if (expandedId && idsSet.has(expandedId)) setExpandedId(null);

    const { error } = await supabase.from("leads").delete().in("id", ids);
    setDeleting(false);

    if (error) {
      console.error("Bulk delete failed:", error);
      setLeads(previousLeads);
      setDeleteError(error.message);
      return;
    }

    closeDeleteModal();
  }

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) return;
    setAdding(true);
    setAddError(null);

    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: addName.trim(),
        email: addEmail.trim(),
        message: addMessage.trim() || null,
        source: "manual",
        status: "new",
      })
      .select()
      .single();

    setAdding(false);
    if (error || !data) {
      setAddError(error?.message ?? "Something went wrong.");
      return;
    }

    setLeads((curr) => [data as Lead, ...curr]);
    setAddName("");
    setAddEmail("");
    setAddMessage("");
    setAddOpen(false);
  }

  async function updateStatus(id: string, status: LeadStatus) {
    const previous = leads;
    setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, status } : l)));
    setUpdatingId(id);
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      console.error("Failed to update lead status:", error);
      setLeads(previous);
    }
  }

  async function convertToClient(lead: Lead) {
    setConvertingId(lead.id);
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({ name: lead.name, email: lead.email })
      .select()
      .single();

    if (clientError || !client) {
      console.error("Failed to create client:", clientError);
      setConvertingId(null);
      return;
    }

    const { error: leadError } = await supabase
      .from("leads")
      .update({ converted_client_id: client.id, status: "qualified" })
      .eq("id", lead.id);

    if (leadError) console.error("Client created but failed to link lead:", leadError);

    setLeads((curr) =>
      curr.map((l) =>
        l.id === lead.id ? { ...l, converted_client_id: client.id, status: "qualified" } : l,
      ),
    );
    setConvertingId(null);
  }

  return (
    <div>
      <div className="mb-10 flex items-baseline justify-between">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
            Admin
          </p>
          <h1 className="font-serif text-4xl text-black">Leads</h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Add lead
        </button>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add lead">
        <form onSubmit={addLead} className="space-y-4">
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
              Email
            </label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              required
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Note (optional)
            </label>
            <textarea
              value={addMessage}
              onChange={(e) => setAddMessage(e.target.value)}
              rows={2}
              placeholder="How you got this lead, what they need, etc."
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {addError && <p className="font-mono text-xs text-red-600">{addError}</p>}
          <button
            type="submit"
            disabled={adding || !addName.trim() || !addEmail.trim()}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {adding ? "Adding…" : "Add lead"}
          </button>
        </form>
      </Modal>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
              filter === f
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {selectedIds.length} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              disabled={bulkUpdating}
              onChange={(e) => setBulkStatus(e.target.value as LeadStatus)}
              className={`rounded-full border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-50 ${STATUS_STYLES[bulkStatus]}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={bulkChangeStatus}
              disabled={bulkUpdating}
              className="border border-neutral-300 bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-800 transition-colors hover:border-black hover:text-black disabled:opacity-50"
            >
              {bulkUpdating ? "Updating…" : "Change status"}
            </button>
            <button
              onClick={() => openDeleteModal(selectedIds)}
              disabled={deleting}
              className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red-700 transition-colors hover:border-red-400 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {(bulkStatusError || deleteError) && (
        <p className="mb-4 font-mono text-xs text-red-600">
          {bulkStatusError ?? deleteError}
        </p>
      )}

      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete leads"
      >
        {deleting ? (
          <p className="text-sm text-neutral-500">Deleting…</p>
        ) : (
          <div className="space-y-5">
            <p className="font-mono text-sm text-neutral-800">
              Delete {deleteTargetIds.length} leads? This can&apos;t be undone.
            </p>
            {deleteError && (
              <p className="font-mono text-xs text-red-600">{deleteError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmBulkDelete}
                disabled={deleting}
                className="bg-red-600 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                Delete leads
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
        {visibleLeads.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-neutral-400">
            No leads {filter !== "all" ? `with status "${filter}"` : "yet"}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 pl-5 pr-3">
                    <input
                      type="checkbox"
                      aria-label="Select all leads"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="py-3 pl-2 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Name</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Email</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Source</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Status</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Received</th>
                  <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Client</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => {
                  const hasAnswers = lead.source === "questionnaire" && lead.answers;
                  const isExpanded = expandedId === lead.id;
                  return (
                    <>
                      <tr
                        key={lead.id}
                        className="border-b border-neutral-100 align-top transition-colors last:border-b-0 hover:bg-neutral-50"
                      >
                        <td className="py-4 pl-5 pr-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${lead.name}`}
                            checked={selectedSet.has(lead.id)}
                            onChange={() => toggleSelected(lead.id)}
                          />
                        </td>
                        <td className="py-4 pl-2 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={lead.name} size="sm" />
                            <div>
                              <span className="font-sans text-sm text-black">{lead.name}</span>
                              {hasAnswers && (
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                                  className="block font-mono text-[10px] uppercase tracking-widest text-brand-pink hover:underline"
                                >
                                  {isExpanded ? "Hide answers ↑" : "View answers ↓"}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                          <a href={`mailto:${lead.email}`} className="hover:text-brand-pink hover:underline">
                            {lead.email}
                          </a>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600">
                            {SOURCE_LABELS[lead.source]}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                            className={`rounded-full border-0 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-50 ${STATUS_STYLES[lead.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="whitespace-nowrap py-4 pr-4 font-mono text-xs text-neutral-500">
                          {new Date(lead.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="whitespace-nowrap py-4 pr-5">
                          {lead.converted_client_id ? (
                            <Link href={`/admin/clients/${lead.converted_client_id}`} className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-pink hover:underline">
                              View client →
                            </Link>
                          ) : (
                            <button
                              onClick={() => convertToClient(lead)}
                              disabled={convertingId === lead.id}
                              className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black disabled:opacity-50"
                            >
                              {convertingId === lead.id ? "Converting…" : "Convert to client"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && lead.answers && (
                        <tr className="border-b border-neutral-100 bg-neutral-50 last:border-b-0">
                          <td colSpan={7} className="px-5 py-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {lead.answers.brandName && <AnswerField label="Brand" value={lead.answers.brandName} />}
                              {lead.answers.need && <AnswerField label="Need" value={lead.answers.need} />}
                              {lead.answers.budget && <AnswerField label="Budget" value={lead.answers.budget} />}
                              {lead.answers.timeline && <AnswerField label="Timeline" value={lead.answers.timeline} />}
                              {lead.answers.trigger && <AnswerField label="What's prompting this" value={lead.answers.trigger} wide />}
                              {lead.answers.extra && <AnswerField label="Anything else" value={lead.answers.extra} wide />}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : ""}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-1 font-sans text-sm text-black">{value}</p>
    </div>
  );
}
