"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = ["active", "paused", "completed"] as const;

const STYLES: Record<(typeof STATUSES)[number], string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-neutral-100 text-neutral-500",
};

export default function ProjectStatusControl({
  projectId,
  initialStatus,
}: {
  projectId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function updateStatus(newStatus: string) {
    const previous = status;
    setStatus(newStatus);
    setSaving(true);

    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);

    setSaving(false);
    if (error) {
      console.error("Failed to update project status:", error);
      setStatus(previous);
    }
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => updateStatus(e.target.value)}
      className={`rounded-full border-0 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-50 ${STYLES[status as (typeof STATUSES)[number]] ?? ""}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
