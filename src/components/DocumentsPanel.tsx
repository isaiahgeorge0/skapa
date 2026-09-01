"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DocType = "proposal" | "agreement" | "welcome" | "invoice" | "other";
type DocStatus = "draft" | "sent" | "viewed" | "signed";

type Doc = {
  id: string;
  type: DocType;
  file_url: string;
  status: DocStatus;
  created_at: string;
};

const TYPES: DocType[] = ["proposal", "agreement", "welcome", "invoice", "other"];
const STATUSES: DocStatus[] = ["draft", "sent", "viewed", "signed"];

const STATUS_STYLES: Record<DocStatus, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  sent: "bg-blue-50 text-blue-700",
  viewed: "bg-amber-50 text-amber-700",
  signed: "bg-green-50 text-green-700",
};

export default function DocumentsPanel({
  projectId,
  initialDocuments,
  canManage = true,
}: {
  projectId: string;
  initialDocuments: Doc[];
  canManage?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [docs, setDocs] = useState<Doc[]>(initialDocuments);
  const [pendingType, setPendingType] = useState<DocType>("proposal");
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const path = `${projectId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const { data, error: insertError } = await supabase
      .from("documents")
      .insert({ project_id: projectId, type: pendingType, file_url: path, status: "draft" })
      .select()
      .single();

    setUploading(false);
    e.target.value = "";

    if (insertError || !data) {
      setError(insertError?.message ?? "Upload succeeded but the record failed to save.");
      return;
    }

    setDocs((curr) => [data as Doc, ...curr]);
  }

  async function downloadDoc(doc: Doc) {
    const { data, error: signError } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_url, 60);

    if (signError || !data) {
      console.error("Failed to create signed URL:", signError);
      setError("Couldn't generate a download link. Try again.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function updateStatus(id: string, status: DocStatus) {
    const previous = docs;
    setDocs((curr) => curr.map((d) => (d.id === id ? { ...d, status } : d)));
    setUpdatingId(id);

    const { error: updateError } = await supabase
      .from("documents")
      .update({ status })
      .eq("id", id);

    setUpdatingId(null);
    if (updateError) {
      console.error("Failed to update document status:", updateError);
      setDocs(previous);
    }
  }

  return (
    <div>
      {docs.length === 0 ? (
        <p className="mb-6 font-mono text-sm text-neutral-400">
          No documents {canManage ? "uploaded yet." : "shared with you yet."}
        </p>
      ) : (
        <ul className="mb-6 divide-y divide-neutral-100">
          {docs.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-sans text-sm capitalize text-black">{doc.type}</p>
                <p className="font-mono text-xs text-neutral-400">
                  {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {canManage ? (
                  <select
                    value={doc.status}
                    disabled={updatingId === doc.id}
                    onChange={(e) => updateStatus(doc.id, e.target.value as DocStatus)}
                    className={`rounded-full border-0 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-50 ${STATUS_STYLES[doc.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[doc.status]}`}>
                    {doc.status}
                  </span>
                )}
                <button onClick={() => downloadDoc(doc)} className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black">
                  Download
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={pendingType}
            onChange={(e) => setPendingType(e.target.value as DocType)}
            className="border border-neutral-300 px-3 py-2 font-mono text-xs uppercase tracking-[0.08em]"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label className="cursor-pointer bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80">
            {uploading ? "Uploading…" : "Upload document"}
            <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      )}
      {error && <p className="mt-3 font-mono text-xs text-red-600">{error}</p>}
    </div>
  );
}
