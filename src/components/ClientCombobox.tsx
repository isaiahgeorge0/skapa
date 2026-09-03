"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Client = { id: string; name: string };
export type ClientSelection =
  | { mode: "existing"; clientId: string; name: string }
  | { mode: "new"; name: string }
  | null;

export default function ClientCombobox({
  clients,
  value,
  onChange,
}: {
  clients: Client[];
  value: ClientSelection;
  onChange: (v: ClientSelection) => void;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  }, [clients, query]);

  const exactMatch = clients.find(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase(),
  );

  function selectExisting(client: Client) {
    setQuery(client.name);
    onChange({ mode: "existing", clientId: client.id, name: client.name });
    setOpen(false);
  }

  function selectNew() {
    const name = query.trim();
    if (!name) return;
    onChange({ mode: "new", name });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null); // clear a prior selection until they confirm a new one
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search or type a new client name"
        className="w-full border border-neutral-300 px-3 py-2 text-sm"
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
          {filtered.length === 0 && !query.trim() && (
            <p className="px-3 py-2 font-mono text-xs text-neutral-400">
              No clients yet. Type a name to create one.
            </p>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectExisting(c)}
              className="block w-full px-3 py-2 text-left font-sans text-sm hover:bg-neutral-50"
            >
              {c.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={selectNew}
              className="block w-full border-t border-neutral-100 px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.08em] text-brand-pink hover:bg-neutral-50"
            >
              + Create new client &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
