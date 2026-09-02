"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";

type Client = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  accent_color?: string | null;
  created_at: string;
};

export default function ClientsTable({ initialClients }: { initialClients: Client[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [clients, setClients] = useState<Client[]>(initialClients);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addCompany, setAddCompany] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    setAddError(null);

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: addName.trim(),
        email: addEmail.trim() || null,
        company: addCompany.trim() || null,
      })
      .select()
      .single();

    setAdding(false);
    if (error || !data) {
      setAddError(error?.message ?? "Something went wrong.");
      return;
    }

    setClients((curr) => [data as Client, ...curr]);
    setAddName("");
    setAddEmail("");
    setAddCompany("");
    setAddOpen(false);
  }

  return (
    <div>
      <div className="mb-10 flex items-baseline justify-between">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
            Admin
          </p>
          <h1 className="font-serif text-4xl text-black">Clients</h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Add client
        </button>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add client">
        <form onSubmit={addClient} className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Name
            </label>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              required
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Email (optional)
            </label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Company (optional)
            </label>
            <input
              value={addCompany}
              onChange={(e) => setAddCompany(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {addError && <p className="font-mono text-xs text-red-600">{addError}</p>}
          <button
            type="submit"
            disabled={adding || !addName.trim()}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {adding ? "Adding…" : "Add client"}
          </button>
        </form>
      </Modal>

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        {clients.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-neutral-400">
            No clients yet — convert a lead from the{" "}
            <Link href="/admin/leads" className="text-brand-pink hover:underline">
              Leads
            </Link>{" "}
            page, or add one directly above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 pl-5 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Name</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Email</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Company</th>
                  <th className="py-3 pr-4 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Accent</th>
                  <th className="py-3 pr-5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">Client since</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50">
                    <td className="py-4 pl-5 pr-4">
                      <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-3">
                        <Avatar name={client.name} size="sm" />
                        <span className="font-sans text-sm text-black hover:text-brand-pink hover:underline">
                          {client.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm text-neutral-700">
                      {client.email || <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="py-4 pr-4 font-sans text-sm text-neutral-600">
                      {client.company || <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="py-4 pr-4">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="inline-flex items-center gap-2"
                        title={client.accent_color || "Default accent"}
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block h-4 w-4 rounded-full border border-neutral-200"
                          style={{
                            backgroundColor: client.accent_color || "#FF2791",
                          }}
                        />
                        <span className="font-mono text-[11px] text-neutral-400">
                          {client.accent_color || "Default"}
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-4 pr-5 font-mono text-xs text-neutral-500">
                      {new Date(client.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
