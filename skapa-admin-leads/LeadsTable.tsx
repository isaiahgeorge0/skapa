"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LeadStatus = "new" | "contacted" | "qualified" | "lost";

type Lead = {
  id: string;
  name: string;
  email: string;
  message: string | null;
  status: LeadStatus;
  created_at: string;
};

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "lost"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-brand-pink/10 text-brand-pink",
  contacted: "bg-blue-50 text-blue-700",
  qualified: "bg-green-50 text-green-700",
  lost: "bg-neutral-100 text-neutral-500",
};

const FILTERS: Array<"all" | LeadStatus> = [
  "all",
  "new",
  "contacted",
  "qualified",
  "lost",
];

export default function LeadsTable({
  initialLeads,
}: {
  initialLeads: Lead[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const visibleLeads = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  async function updateStatus(id: string, status: LeadStatus) {
    const previous = leads;
    // Optimistic update — reflects instantly, rolled back on failure.
    setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, status } : l)));
    setUpdatingId(id);

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    setUpdatingId(null);

    if (error) {
      console.error("Failed to update lead status:", error);
      setLeads(previous);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visibleLeads.length === 0 ? (
        <p className="py-16 text-center font-mono text-sm text-neutral-400">
          No leads {filter !== "all" ? `with status "${filter}"` : "yet"}.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  Name
                </th>
                <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  Email
                </th>
                <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  Message
                </th>
                <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  Status
                </th>
                <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  Received
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-neutral-100 align-top"
                >
                  <td className="py-4 pr-4 font-sans text-sm text-black">
                    {lead.name}
                  </td>
                  <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:text-brand-pink hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="py-4 pr-4 max-w-xs font-sans text-sm text-neutral-600">
                    {lead.message || (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) =>
                        updateStatus(lead.id, e.target.value as LeadStatus)
                      }
                      className={`rounded-full border-0 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-50 ${STATUS_STYLES[lead.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap font-mono text-xs text-neutral-500">
                    {new Date(lead.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
