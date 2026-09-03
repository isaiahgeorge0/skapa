"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ClientCombobox, { type ClientSelection } from "@/components/ClientCombobox";

type Client = { id: string; name: string };

const SERVICE_TYPES = ["brand", "creative", "digital", "social"] as const;

export default function NewProjectForm({
  clients,
  preselectedClientId,
}: {
  clients: Client[];
  preselectedClientId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preselected = preselectedClientId
    ? clients.find((c) => c.id === preselectedClientId)
    : undefined;

  const [clientSelection, setClientSelection] = useState<ClientSelection>(
    preselected
      ? { mode: "existing", clientId: preselected.id, name: preselected.name }
      : null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!clientSelection) {
      setError("Select an existing client, or type a name to create a new one.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let clientId: string;

    if (clientSelection.mode === "new") {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({ name: clientSelection.name })
        .select()
        .single();

      if (clientError || !newClient) {
        setSubmitting(false);
        setError(clientError?.message ?? "Failed to create the new client.");
        return;
      }
      clientId = newClient.id;
    } else {
      clientId = clientSelection.clientId;
    }

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        name: formData.get("name") as string,
        service_type: formData.get("service_type") as string,
        notes: (formData.get("notes") as string) || null,
        target_completion_date:
          (formData.get("target_completion_date") as string) || null,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Something went wrong.");
      return;
    }

    router.push(`/admin/projects/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-neutral-500">
          Client
        </label>
        <ClientCombobox
          clients={clients}
          value={clientSelection}
          onChange={setClientSelection}
        />
        {clientSelection?.mode === "new" && (
          <p className="mt-2 font-mono text-xs text-neutral-500">
            This creates a new client named &quot;{clientSelection.name}&quot;. Add
            their email and other details afterward from the Clients page.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-neutral-500">
          Project name
        </label>
        <input
          name="name"
          required
          placeholder="e.g. Blue Peak: Brand & Digital Launch"
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-neutral-500">
          Primary service type
        </label>
        <select
          name="service_type"
          required
          defaultValue="brand"
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        >
          {SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-neutral-500">
          Target completion date (optional)
        </label>
        <input
          type="date"
          name="target_completion_date"
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-neutral-500">
          Notes (optional)
        </label>
        <textarea name="notes" rows={4} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
