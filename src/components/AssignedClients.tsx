"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";

type ClientRef = { id: string; name: string; email: string | null };

export default function AssignedClients({
  projectId,
  primaryClient,
  initialAdditionalClients,
  allClients,
}: {
  projectId: string;
  primaryClient: ClientRef;
  initialAdditionalClients: ClientRef[];
  allClients: ClientRef[];
}) {
  const [supabase] = useState(() => createClient());
  const [primary, setPrimary] = useState<ClientRef>(primaryClient);
  const [additional, setAdditional] = useState<ClientRef[]>(initialAdditionalClients);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [reassignQuery, setReassignQuery] = useState("");
  const [reassignOpen, setReassignOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const excludedIds = useMemo(
    () => new Set([primary.id, ...additional.map((c) => c.id)]),
    [primary.id, additional],
  );

  const suggestions = useMemo(
    () =>
      allClients
        .filter((c) => !excludedIds.has(c.id))
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6),
    [allClients, query, excludedIds],
  );
  const reassignSuggestions = useMemo(
    () =>
      allClients
        .filter((c) => c.id !== primary.id)
        .filter((c) => c.name.toLowerCase().includes(reassignQuery.toLowerCase()))
        .slice(0, 6),
    [allClients, primary.id, reassignQuery],
  );

  async function addClient(client: ClientRef) {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("project_clients")
      .insert({ project_id: projectId, client_id: client.id });
    setSaving(false);
    if (!error) {
      setAdditional((curr) => [...curr, client]);
      setQuery("");
      setOpen(false);
    } else {
      setError(error.message);
    }
  }

  async function removeClient(clientId: string) {
    const previous = additional;
    setError(null);
    setAdditional((curr) => curr.filter((c) => c.id !== clientId));
    const { error } = await supabase
      .from("project_clients")
      .delete()
      .eq("project_id", projectId)
      .eq("client_id", clientId);
    if (error) {
      setAdditional(previous);
      setError(error.message);
    }
  }

  async function reassignPrimaryClient(nextPrimary: ClientRef) {
    const previousPrimary = primary;
    const previousAdditional = additional;

    setSaving(true);
    setError(null);

    const remainingAdditional = previousAdditional.filter(
      (client) => client.id !== nextPrimary.id,
    );
    const nextAdditional = remainingAdditional.some(
      (client) => client.id === previousPrimary.id,
    )
      ? remainingAdditional
      : [...remainingAdditional, previousPrimary];

    setPrimary(nextPrimary);
    setAdditional(nextAdditional);

    const { error: updateProjectError } = await supabase
      .from("projects")
      .update({ client_id: nextPrimary.id })
      .eq("id", projectId);

    if (updateProjectError) {
      setPrimary(previousPrimary);
      setAdditional(previousAdditional);
      setSaving(false);
      setError(updateProjectError.message);
      return;
    }

    const { error: deleteAdditionalError } = await supabase
      .from("project_clients")
      .delete()
      .eq("project_id", projectId)
      .eq("client_id", nextPrimary.id);

    if (deleteAdditionalError) {
      await supabase
        .from("projects")
        .update({ client_id: previousPrimary.id })
        .eq("id", projectId);
      setPrimary(previousPrimary);
      setAdditional(previousAdditional);
      setSaving(false);
      setError(deleteAdditionalError.message);
      return;
    }

    const { error: keepOldPrimaryError } = await supabase
      .from("project_clients")
      .upsert(
        { project_id: projectId, client_id: previousPrimary.id },
        { onConflict: "project_id,client_id", ignoreDuplicates: true },
      );

    setSaving(false);

    if (keepOldPrimaryError) {
      await supabase
        .from("projects")
        .update({ client_id: previousPrimary.id })
        .eq("id", projectId);
      setPrimary(previousPrimary);
      setAdditional(previousAdditional);
      setError(keepOldPrimaryError.message);
      return;
    }

    setReassignQuery("");
    setReassignOpen(false);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Primary
        </p>
        <Link
          href={`/admin/clients/${primary.id}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-70"
        >
          <Avatar name={primary.name} />
          <div className="min-w-0">
            <p className="truncate font-sans text-sm text-black">{primary.name}</p>
            <p className="truncate font-mono text-xs text-neutral-500">
              {primary.email}
            </p>
          </div>
        </Link>
      </div>

      <div className="relative pt-1">
        <input
          value={reassignQuery}
          onChange={(e) => {
            setReassignQuery(e.target.value);
            setReassignOpen(true);
          }}
          onFocus={() => setReassignOpen(true)}
          placeholder="Reassign primary client"
          className="w-full border border-neutral-300 px-3 py-1.5 font-mono text-xs"
        />
        {reassignOpen && reassignQuery && reassignSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
            {reassignSuggestions.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => reassignPrimaryClient(client)}
                disabled={saving}
                className="block w-full px-3 py-2 text-left font-sans text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                {client.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {additional.length > 0 && (
        <div>
          <p className="mb-1 mt-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Also assigned
          </p>
          <ul className="space-y-2">
            {additional.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-70"
                >
                  <Avatar name={c.name} size="sm" />
                  <span className="truncate font-sans text-sm text-black">{c.name}</span>
                </Link>
                <button
                  onClick={() => removeClient(c.id)}
                  className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative pt-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="+ Add another client"
          className="w-full border border-neutral-300 px-3 py-1.5 font-mono text-xs"
        />
        {open && query && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
            {suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => addClient(c)}
                disabled={saving}
                className="block w-full px-3 py-2 text-left font-sans text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-600">{error}</p>}
    </div>
  );
}
