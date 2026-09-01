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
  const [additional, setAdditional] = useState<ClientRef[]>(initialAdditionalClients);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const excludedIds = useMemo(
    () => new Set([primaryClient.id, ...additional.map((c) => c.id)]),
    [primaryClient.id, additional],
  );

  const suggestions = useMemo(
    () =>
      allClients
        .filter((c) => !excludedIds.has(c.id))
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6),
    [allClients, query, excludedIds],
  );

  async function addClient(client: ClientRef) {
    setSaving(true);
    const { error } = await supabase
      .from("project_clients")
      .insert({ project_id: projectId, client_id: client.id });
    setSaving(false);
    if (!error) {
      setAdditional((curr) => [...curr, client]);
      setQuery("");
      setOpen(false);
    }
  }

  async function removeClient(clientId: string) {
    const previous = additional;
    setAdditional((curr) => curr.filter((c) => c.id !== clientId));
    const { error } = await supabase
      .from("project_clients")
      .delete()
      .eq("project_id", projectId)
      .eq("client_id", clientId);
    if (error) setAdditional(previous);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Primary
        </p>
        <Link
          href={`/admin/clients/${primaryClient.id}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-70"
        >
          <Avatar name={primaryClient.name} />
          <div className="min-w-0">
            <p className="truncate font-sans text-sm text-black">{primaryClient.name}</p>
            <p className="truncate font-mono text-xs text-neutral-500">
              {primaryClient.email}
            </p>
          </div>
        </Link>
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
    </div>
  );
}
