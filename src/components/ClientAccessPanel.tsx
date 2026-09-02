"use client";
import { useState } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { sendClientInvite, revokeClientInvite, revokeClientAccess } from "@/app/actions/client-invites";

type ActiveEntry = { kind: "active"; profileId: string; email: string; joinedAt: string };
type PendingEntry = { kind: "pending"; inviteId: string; email: string; sentAt: string; expiresAt: string };
type Entry = ActiveEntry | PendingEntry;

type ClientAccess = {
  clientId: string;
  clientName: string;
  entries: Entry[];
};

export default function ClientAccessPanel({
  initialAccess,
}: {
  initialAccess: ClientAccess[];
}) {
  const [access, setAccess] = useState<ClientAccess[]>(initialAccess);
  const [inviteOpenFor, setInviteOpenFor] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent, clientId: string, clientName: string) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    setError(null);

    const result = await sendClientInvite(clientId, inviteEmail.trim(), clientName);

    setSending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }

    setAccess((curr) =>
      curr.map((c) =>
        c.clientId === clientId
          ? {
              ...c,
              entries: [
                ...c.entries,
                {
                  kind: "pending",
                  inviteId: crypto.randomUUID(), // placeholder key, real id not needed client-side until page reload
                  email: inviteEmail.trim(),
                  sentAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ],
            }
          : c,
      ),
    );
    setInviteEmail("");
    setInviteOpenFor(null);
  }

  async function handleRevokeInvite(clientId: string, inviteId: string) {
    setBusyId(inviteId);
    const result = await revokeClientInvite(inviteId);
    setBusyId(null);
    if (result.success) {
      setAccess((curr) =>
        curr.map((c) =>
          c.clientId === clientId
            ? { ...c, entries: c.entries.filter((e) => !(e.kind === "pending" && e.inviteId === inviteId)) }
            : c,
        ),
      );
    }
  }

  async function handleRevokeAccess(clientId: string, profileId: string) {
    setBusyId(profileId);
    const result = await revokeClientAccess(profileId);
    setBusyId(null);
    if (result.success) {
      setAccess((curr) =>
        curr.map((c) =>
          c.clientId === clientId
            ? { ...c, entries: c.entries.filter((e) => !(e.kind === "active" && e.profileId === profileId)) }
            : c,
        ),
      );
    }
  }

  return (
    <div className="space-y-6">
      {access.map((client) => (
        <Card
          key={client.clientId}
          title={client.clientName}
          action={
            <button
              onClick={() => setInviteOpenFor(client.clientId)}
              className="bg-black px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
            >
              + Invite
            </button>
          }
        >
          {client.entries.length === 0 ? (
            <p className="font-mono text-sm text-neutral-400">
              No portal access yet for this client.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {client.entries.map((entry) =>
                entry.kind === "active" ? (
                  <li key={entry.profileId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-sans text-sm text-black">{entry.email}</p>
                      <span className="rounded-full bg-green-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-green-700">
                        Active
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevokeAccess(client.clientId, entry.profileId)}
                      disabled={busyId === entry.profileId}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-red-600 disabled:opacity-50"
                    >
                      {busyId === entry.profileId ? "…" : "Revoke access"}
                    </button>
                  </li>
                ) : (
                  <li key={entry.inviteId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-sans text-sm text-black">{entry.email}</p>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-700">
                        Invited
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevokeInvite(client.clientId, entry.inviteId)}
                      disabled={busyId === entry.inviteId}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-red-600 disabled:opacity-50"
                    >
                      {busyId === entry.inviteId ? "…" : "Revoke invite"}
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}

          <Modal
            open={inviteOpenFor === client.clientId}
            onClose={() => {
              setInviteOpenFor(null);
              setError(null);
            }}
            title={`Invite to ${client.clientName}'s portal`}
          >
            <form onSubmit={(e) => handleInvite(e, client.clientId, client.clientName)} className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  Email address
                </label>
                <input
                  type="email"
                  autoFocus
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              {error && <p className="font-mono text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={sending || !inviteEmail.trim()}
                className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {sending ? "Sending…" : "Send invite"}
              </button>
            </form>
          </Modal>
        </Card>
      ))}
    </div>
  );
}
