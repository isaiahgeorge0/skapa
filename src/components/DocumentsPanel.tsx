"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignDocumentPanel from "@/components/SignDocumentPanel";
import DocumentAuditTrail from "@/components/DocumentAuditTrail";

type DocType = "proposal" | "agreement" | "welcome" | "invoice" | "other";
type DocStatus = "draft" | "sent" | "viewed" | "signed";

type Doc = {
  id: string;
  type: DocType;
  file_url: string;
  status: DocStatus;
  created_at: string;
  signature_name?: string | null;
  signed_at?: string | null;
  signature_hash?: string | null;
  signer_ip?: string | null;
  signer_user_agent?: string | null;
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
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [expandedSignatureId, setExpandedSignatureId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function logEvent(
    documentId: string,
    eventType: "created" | "sent" | "viewed" | "signed" | "status_changed",
    detail?: string,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("document_events").insert({
      document_id: documentId,
      event_type: eventType,
      actor_id: user?.id,
      actor_role: canManage ? "admin" : "client",
      detail,
    });
  }

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

    await logEvent(data.id, "created", `Uploaded as ${pendingType}`);
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

    if (!canManage && doc.status === "sent") {
      await supabase.from("documents").update({ status: "viewed" }).eq("id", doc.id);
      await logEvent(doc.id, "viewed");
      setDocs((curr) =>
        curr.map((d) => (d.id === doc.id ? { ...d, status: "viewed" as DocStatus } : d)),
      );
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
      return;
    }

    await logEvent(
      id,
      status === "sent" ? "sent" : "status_changed",
      `Status set to ${status}`,
    );
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
            <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-sans text-sm capitalize text-black">{doc.type}</p>
                  <p className="font-mono text-xs text-neutral-400">
                    {new Date(doc.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {canManage ? (
                    <select
                      value={doc.status}
                      disabled={updatingId === doc.id || doc.status === "signed"}
                      onChange={(e) => updateStatus(doc.id, e.target.value as DocStatus)}
                      className={`rounded-full border-0 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-70 ${STATUS_STYLES[doc.status]}`}
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
                  <button
                    onClick={() => downloadDoc(doc)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                  >
                    Download
                  </button>
                </div>
              </div>

              {!canManage && (doc.status === "sent" || doc.status === "viewed") && (
                <SignDocumentPanel
                  doc={doc}
                  onSigned={() => {
                    setDocs((curr) =>
                      curr.map((d) =>
                        d.id === doc.id ? { ...d, status: "signed" as DocStatus } : d,
                      ),
                    );
                  }}
                />
              )}

              {canManage && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() =>
                        setExpandedActivityId(expandedActivityId === doc.id ? null : doc.id)
                      }
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
                    >
                      {expandedActivityId === doc.id ? "Hide" : "View"} activity
                    </button>
                    {doc.status === "signed" && (
                      <button
                        onClick={() =>
                          setExpandedSignatureId(
                            expandedSignatureId === doc.id ? null : doc.id,
                          )
                        }
                        className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
                      >
                        {expandedSignatureId === doc.id ? "Hide" : "View"} signature details
                      </button>
                    )}
                  </div>
                  {expandedActivityId === doc.id && (
                    <div className="rounded-lg bg-neutral-50 p-4">
                      <DocumentAuditTrail documentId={doc.id} />
                    </div>
                  )}
                  {expandedSignatureId === doc.id && doc.status === "signed" && (
                    <dl className="grid grid-cols-[100px_1fr] gap-y-2 rounded-lg bg-neutral-50 p-4 font-mono text-xs">
                      <dt className="text-neutral-400">Signed by</dt>
                      <dd className="text-black">{doc.signature_name}</dd>
                      <dt className="text-neutral-400">Signed at</dt>
                      <dd className="text-black">
                        {doc.signed_at &&
                          new Date(doc.signed_at).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                      </dd>
                      <dt className="text-neutral-400">IP address</dt>
                      <dd className="text-black">{doc.signer_ip}</dd>
                      <dt className="text-neutral-400">Browser</dt>
                      <dd className="break-all text-black">{doc.signer_user_agent}</dd>
                      <dt className="text-neutral-400">Document hash</dt>
                      <dd className="break-all text-black">{doc.signature_hash}</dd>
                    </dl>
                  )}
                </div>
              )}
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
