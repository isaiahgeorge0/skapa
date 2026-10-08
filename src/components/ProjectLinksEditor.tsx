"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import {
  PROJECT_LINK_COLUMNS,
  normalizeLinkUrl,
  parseHttpUrl,
  validateLinkTitle,
  type ProjectLink,
} from "@/lib/project-links";

const labelClass =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500";
const controlClass =
  "font-mono text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-black disabled:opacity-30";

function sortLinks(links: ProjectLink[]) {
  return [...links].sort(
    (a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
  );
}

type FormState = { mode: "add" } | { mode: "edit"; link: ProjectLink };

export default function ProjectLinksEditor({
  projectId,
  initialLinks,
}: {
  projectId: string;
  initialLinks: ProjectLink[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [links, setLinks] = useState(() => sortLinks(initialLinks));
  const [listError, setListError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ProjectLink | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openAdd() {
    setForm({ mode: "add" });
    setTitle("");
    setUrl("");
    setFormError(null);
  }

  function openEdit(link: ProjectLink) {
    setForm({ mode: "edit", link });
    setTitle(link.title);
    setUrl(link.url);
    setFormError(null);
  }

  function closeForm() {
    if (saving) return;
    setForm(null);
    setFormError(null);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const titleResult = validateLinkTitle(title);
    if (!titleResult.ok) {
      setFormError(titleResult.error);
      return;
    }
    const urlResult = normalizeLinkUrl(url);
    if (!urlResult.ok) {
      setFormError(urlResult.error);
      return;
    }

    setSaving(true);
    setFormError(null);

    if (form.mode === "add") {
      const sortOrder = links.reduce((max, l) => Math.max(max, l.sort_order), -1) + 1;
      const { data, error } = await supabase
        .from("project_links")
        .insert({
          project_id: projectId,
          title: titleResult.title,
          url: urlResult.url,
          sort_order: sortOrder,
        })
        .select(PROJECT_LINK_COLUMNS)
        .single();
      setSaving(false);
      if (error || !data) {
        console.error("Failed to add link:", error);
        setFormError("Couldn't add the link. Try again.");
        return;
      }
      setLinks((curr) => sortLinks([...curr, data as ProjectLink]));
      setForm(null);
      return;
    }

    const target = form.link;
    const { data, error } = await supabase
      .from("project_links")
      .update({ title: titleResult.title, url: urlResult.url })
      .eq("id", target.id)
      .select("id");
    setSaving(false);
    if (error || !data || data.length === 0) {
      console.error("Failed to update link:", error);
      setFormError("Couldn't save the link. Try again.");
      return;
    }
    setLinks((curr) =>
      curr.map((l) =>
        l.id === target.id ? { ...l, title: titleResult.title, url: urlResult.url } : l,
      ),
    );
    setForm(null);
  }

  async function setSortOrder(id: string, sortOrder: number) {
    const { data, error } = await supabase
      .from("project_links")
      .update({ sort_order: sortOrder })
      .eq("id", id)
      .select("id");
    return !error && !!data && data.length > 0;
  }

  async function move(index: number, direction: -1 | 1) {
    const other = index + direction;
    if (other < 0 || other >= links.length) return;
    const a = links[index];
    const b = links[other];
    let aOrder = b.sort_order;
    const bOrder = a.sort_order;
    if (aOrder === bOrder) aOrder = bOrder + direction;

    const previous = links;
    setListError(null);
    setBusyId(a.id);
    setLinks((curr) =>
      sortLinks(
        curr.map((l) =>
          l.id === a.id ? { ...l, sort_order: aOrder } : l.id === b.id ? { ...l, sort_order: bOrder } : l,
        ),
      ),
    );

    const [okA, okB] = await Promise.all([setSortOrder(a.id, aOrder), setSortOrder(b.id, bOrder)]);
    setBusyId(null);
    if (!okA || !okB) {
      if (okA) await setSortOrder(a.id, a.sort_order);
      if (okB) await setSortOrder(b.id, b.sort_order);
      setLinks(previous);
      setListError("Couldn't reorder links. Try again.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { data, error } = await supabase
      .from("project_links")
      .delete()
      .eq("id", deleteTarget.id)
      .select("id");
    setDeleting(false);
    if (error || !data || data.length === 0) {
      console.error("Failed to delete link:", error);
      setDeleteError("Couldn't delete the link. Try again.");
      return;
    }
    const removedId = deleteTarget.id;
    setLinks((curr) => curr.filter((l) => l.id !== removedId));
    setDeleteTarget(null);
  }

  return (
    <Card
      title="Links"
      action={
        <button
          type="button"
          onClick={openAdd}
          className="bg-black px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Add link
        </button>
      }
    >
      {listError ? (
        <p className="mb-3 font-mono text-xs text-red-600" role="alert">
          {listError}
        </p>
      ) : null}

      {links.length === 0 ? (
        <p className="font-mono text-sm text-neutral-400">
          No links yet. Add the client&apos;s site, shared folders or staging URLs.
        </p>
      ) : (
        <ul className="divide-y divide-black/[0.06]">
          {links.map((link, index) => (
            <li key={link.id} className="py-3 first:pt-0 last:pb-0">
              <p className="break-words font-serif text-base leading-snug text-black">
                {link.title}
              </p>
              <a
                href={parseHttpUrl(link.url) ? link.url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block truncate font-mono text-[11px] text-neutral-500 hover:text-black"
              >
                {link.url}
              </a>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || busyId !== null}
                  aria-label={`Move ${link.title} up`}
                  className={controlClass}
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === links.length - 1 || busyId !== null}
                  aria-label={`Move ${link.title} down`}
                  className={controlClass}
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(link)}
                  aria-label={`Edit ${link.title}`}
                  className={controlClass}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(link);
                    setDeleteError(null);
                  }}
                  aria-label={`Delete ${link.title}`}
                  className={`${controlClass} hover:text-red-600`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={form !== null}
        onClose={closeForm}
        title={form?.mode === "edit" ? "Edit link" : "Add link"}
      >
        <form onSubmit={submitForm} className="space-y-5" noValidate>
          <div>
            <label htmlFor="link-title" className={labelClass}>
              Title
            </label>
            <input
              id="link-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project website"
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="link-url" className={labelClass}>
              URL
            </label>
            <input
              id="link-url"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://…"
              className="w-full border border-neutral-300 px-3 py-2 font-mono text-sm"
            />
          </div>
          {formError ? (
            <p className="font-mono text-xs text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {saving ? "Saving…" : form?.mode === "edit" ? "Save link" : "Add link"}
          </button>
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        title="Delete link"
      >
        <div className="space-y-5">
          <p className="font-mono text-sm text-neutral-800">
            Delete &ldquo;{deleteTarget?.title}&rdquo;? The client will no longer see it.
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
              {deleting ? "Deleting…" : "Delete link"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="border border-neutral-300 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700 hover:border-black disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
