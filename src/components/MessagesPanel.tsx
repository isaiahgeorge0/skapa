"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string | null;
  sender_role: "client" | "admin";
  body: string;
  created_at: string;
};

export default function MessagesPanel({
  projectId,
  currentUserId,
  viewerRole,
  initialMessages,
}: {
  projectId: string;
  currentUserId: string;
  viewerRole: "admin" | "client";
  initialMessages: Message[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll only within the messages list — never the page (scrollIntoView was
  // jumping portal project pages partway down on load).
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
        { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((curr) => (curr.some((m) => m.id === incoming.id) ? curr : [...curr, incoming]));
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
      .insert({ project_id: projectId, sender_id: currentUserId, sender_role: viewerRole, body: trimmed })
      .select()
      .single();

    setSending(false);

    if (error) {
      console.error("Failed to send message:", error);
      setBody(trimmed);
      return;
    }

    setMessages((curr) => (curr.some((m) => m.id === data.id) ? curr : [...curr, data as Message]));
  }

  return (
    <div>
      <div
        ref={listRef}
        className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-xl bg-neutral-50 p-4"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center font-mono text-xs text-neutral-400">
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((m) => {
            const isOwn = m.sender_role === viewerRole;
            return (
              <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isOwn ? "bg-black text-white" : "bg-white text-black shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={`mt-1 font-mono text-[10px] uppercase tracking-wide ${
                      isOwn ? "text-neutral-300" : "text-neutral-400"
                    }`}
                  >
                    {m.sender_role === "admin"
                      ? "skapa"
                      : viewerRole === "client" && isOwn
                        ? "You"
                        : m.sender_role}{" "}
                    ·{" "}
                    {new Date(m.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-black px-5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
