"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";

type LeadStatus = "new" | "contacted" | "qualified" | "lost";

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
  source: "contact_form" | "questionnaire";
  answers: LeadAnswers | null;
};

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "lost"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-brand-pink/10 text-brand-pink",
  contacted: "bg-blue-50 text-blue-700",
  qualified: "bg-green-50 text-green-700",
  lost: "bg-neutral-100 text-neutral-500",
};

const FILTERS: Array<"all" | LeadStatus> = ["all", "new", "contacted", "qualified", "lost"];

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const visibleLeads = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

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
                  <th className="py-3 pl-5 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Name</th>
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
                        <td className="py-4 pl-5 pr-4">
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
                            {lead.source === "questionnaire" ? "Questionnaire" : "Contact form"}
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
                          <td colSpan={6} className="px-5 py-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {lead.answers.brandName && (
                                <AnswerField label="Brand" value={lead.answers.brandName} />
                              )}
                              {lead.answers.need && <AnswerField label="Need" value={lead.answers.need} />}
                              {lead.answers.budget && <AnswerField label="Budget" value={lead.answers.budget} />}
                              {lead.answers.timeline && <AnswerField label="Timeline" value={lead.answers.timeline} />}
                              {lead.answers.trigger && (
                                <AnswerField label="What's prompting this" value={lead.answers.trigger} wide />
                              )}
                              {lead.answers.extra && (
                                <AnswerField label="Anything else" value={lead.answers.extra} wide />
                              )}
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
