"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ResultItem = { id: string; title: string; subtitle?: string; href: string };
type ResultGroup = { label: string; items: ResultItem[] };

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<ResultGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const flatResults = groups.flatMap((g) => g.items);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
      setGroups([]);
      setActiveIndex(0);
    }
  }, [open]);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setGroups([]);
        return;
      }
      setLoading(true);
      const term = `%${q}%`;

      const [leadsRes, clientsRes, projectsRes] = await Promise.all([
        supabase
          .from("leads")
          .select("id, name, email")
          .or(`name.ilike.${term},email.ilike.${term}`)
          .limit(5),
        supabase
          .from("clients")
          .select("id, name, email, company")
          .or(`name.ilike.${term},email.ilike.${term},company.ilike.${term}`)
          .limit(5),
        supabase.from("projects").select("id, name").ilike("name", term).limit(5),
      ]);

      const newGroups: ResultGroup[] = [];
      if (leadsRes.data?.length) {
        newGroups.push({
          label: "Leads",
          items: leadsRes.data.map((l) => ({
            id: l.id,
            title: l.name,
            subtitle: l.email,
            href: `/admin/leads`,
          })),
        });
      }
      if (clientsRes.data?.length) {
        newGroups.push({
          label: "Clients",
          items: clientsRes.data.map((c) => ({
            id: c.id,
            title: c.name,
            subtitle: c.company || c.email,
            href: `/admin/clients/${c.id}`,
          })),
        });
      }
      if (projectsRes.data?.length) {
        newGroups.push({
          label: "Projects",
          items: projectsRes.data.map((p) => ({
            id: p.id,
            title: p.name,
            href: `/admin/projects/${p.id}`,
          })),
        });
      }

      setGroups(newGroups);
      setLoading(false);
      setActiveIndex(0);
    },
    [supabase],
  );

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 200);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = flatResults[activeIndex];
      if (item) {
        router.push(item.href);
        setOpen(false);
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 font-mono text-xs text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
      >
        <span>Search…</span>
        <span className="text-[10px]">⌘K</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search leads, clients, projects…"
              className="w-full border-b border-neutral-200 px-4 py-4 text-sm outline-none"
            />
            <div className="max-h-96 overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-4 font-mono text-xs text-neutral-400">
                  Searching…
                </p>
              )}
              {!loading && query.trim() && groups.length === 0 && (
                <p className="px-3 py-4 font-mono text-xs text-neutral-400">
                  No results for &ldquo;{query}&rdquo;.
                </p>
              )}
              {groups.map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const flatIndex = flatResults.findIndex(
                      (r) => r.id === item.id && r.href === item.href,
                    );
                    const isActive = flatIndex === activeIndex;
                    return (
                      <button
                        key={item.href + item.id}
                        onClick={() => {
                          router.push(item.href);
                          setOpen(false);
                        }}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors ${
                          isActive ? "bg-neutral-100" : ""
                        }`}
                      >
                        <span className="font-sans text-sm text-black">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="font-mono text-xs text-neutral-400">
                            {item.subtitle}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
