"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { deleteMessages } from "@/app/actions/admin-deletes";

type Message = {
  id: string;
  sender_id: string | null;
  sender_role: "client" | "admin";
  body: string;
  created_at: string;
};

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPanel({
  projectId,
  currentUserId,
  viewerRole,
  initialMessages,
  clientName = "Client",
  studioName = "skapa",
  usePortalAccent = false,
}: {
  projectId: string;
  currentUserId: string;
  viewerRole: "admin" | "client";
  initialMessages: Message[];
  clientName?: string;
  studioName?: string;
  /** Portal thread: avatars use the client accent instead of brand pink. */
  usePortalAccent?: boolean;
}) {
  const isAdmin = viewerRole === "admin";
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    messages.length > 0 && selectedIds.length === messages.length;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSelected(messageId: string) {
    setSelectedIds((curr) =>
      curr.includes(messageId)
        ? curr.filter((id) => id !== messageId)
        : [...curr, messageId],
    );
  }

  function toggleAll() {
    setSelectedIds(allVisibleSelected ? [] : messages.map((m) => m.id));
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

    const previous = messages;
    const idsSet = new Set(ids);
    setMessages((curr) => curr.filter((m) => !idsSet.has(m.id)));
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));

    const result = await deleteMessages(ids);
    setDeleting(false);

    if (!result.success) {
      setMessages(previous);
      setDeleteError(result.error);
      setSelectedIds(ids);
      return;
    }

    closeDeleteModal();
  }

  // Scroll only within the messages list — never the page.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((curr) =>
            curr.some((m) => m.id === incoming.id) ? curr : [...curr, incoming],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, projectId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setBody("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        project_id: projectId,
        sender_id: currentUserId,
        sender_role: viewerRole,
        body: trimmed,
      })
      .select()
      .single();

    setSending(false);

    if (error) {
      console.error("Failed to send message:", error);
      setBody(trimmed);
      return;
    }

    setMessages((curr) =>
      curr.some((m) => m.id === data.id) ? curr : [...curr, data as Message],
    );
  }

  const deleteModalTitle =
    deleteTargetIds.length === 1 ? "Delete message" : "Delete messages";

  return (
    <div>
      {isAdmin && selectedIds.length > 0 && (
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

      {isAdmin && messages.length > 0 && (
        <div className="mb-2 flex items-center gap-2 px-1">
          <input
            type="checkbox"
            aria-label="Select all messages"
            checked={allVisibleSelected}
            onChange={toggleAll}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Select all
          </span>
        </div>
      )}

      <div
        ref={listRef}
        className="surface-raised mb-4 max-h-96 space-y-4 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6"
      >
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="font-serif text-base text-black">
              {viewerRole === "client"
                ? "The thread is quiet for now."
                : "No messages yet."}
            </p>
            <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-relaxed text-neutral-500">
              {viewerRole === "client"
                ? "Use this space for questions, feedback and decisions. We reply here so everything stays with the project."
                : "Say hello to open the conversation."}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const fromStudio = m.sender_role === "admin";
            // Studio on the left, client on the right — stable regardless of viewer.
            const alignEnd = !fromStudio;
            const name = fromStudio ? studioName : clientName;
            const label = fromStudio
              ? studioName
              : viewerRole === "client"
                ? "You"
                : clientName;

            return (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${isAdmin ? "group" : ""}`}
              >
                {isAdmin ? (
                  <input
                    type="checkbox"
                    aria-label={`Select message from ${label}`}
                    checked={selectedSet.has(m.id)}
                    onChange={() => toggleSelected(m.id)}
                    className="mt-2 shrink-0"
                  />
                ) : null}
                <div
                  data-message-side={alignEnd ? "client" : "studio"}
                  className={`flex min-w-0 flex-1 items-end gap-2.5 ${
                    alignEnd ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar
                    name={name}
                    size="sm"
                    tone={
                      fromStudio
                        ? "neutral"
                        : usePortalAccent
                          ? "portal"
                          : "brand"
                    }
                  />
                  <div
                    className={`max-w-[min(75%,20rem)] sm:max-w-[75%] ${
                      alignEnd ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`surface-radius px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        fromStudio
                          ? "bg-neutral-100 text-black"
                          : usePortalAccent
                            ? "bg-portal-accent text-white"
                            : "bg-black text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                    </div>
                    <div
                      className={`mt-1.5 flex flex-wrap items-center gap-2 ${
                        alignEnd ? "justify-end" : "justify-start"
                      }`}
                    >
                      <p
                        className={`font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-400 ${
                          alignEnd ? "text-right" : "text-left"
                        }`}
                      >
                        {label}
                        <span className="text-neutral-300"> · </span>
                        {formatMessageTime(m.created_at)}
                      </p>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => openDeleteModal([m.id])}
                          className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAdmin ? (
        <Modal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          title={deleteModalTitle}
        >
          {deleting ? (
            <p className="text-sm text-neutral-500">Deleting…</p>
          ) : (
            <div className="space-y-5">
              <p className="font-mono text-sm text-neutral-800">
                Delete {deleteTargetIds.length}{" "}
                {deleteTargetIds.length === 1 ? "message" : "messages"}? This
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
      ) : null}

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          className="surface-control flex-1 border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="surface-control bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
