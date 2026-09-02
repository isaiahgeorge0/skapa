"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DocumentPreview from "@/components/DocumentPreview";
import DocumentAuditTrail from "@/components/DocumentAuditTrail";
import Card from "@/components/Card";
import Modal from "@/components/Modal";

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
  signature_image_url?: string | null;
  signature_method?: string | null;
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [signatureImageUrls, setSignatureImageUrls] = useState<Record<string, string>>({});
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
    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);

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
    setUploadOpen(false);
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

  async function openPreview(doc: Doc) {
    if (!canManage && doc.status === "sent") {
      await supabase.from("documents").update({ status: "viewed" }).eq("id", doc.id);
      await logEvent(doc.id, "viewed");
      setDocs((curr) =>
        curr.map((d) => (d.id === doc.id ? { ...d, status: "viewed" as DocStatus } : d)),
      );
    }
    setPreviewDoc(doc);
  }

  useEffect(() => {
    if (!expandedAuditId) return;
    const doc = docs.find((d) => d.id === expandedAuditId);
    if (!doc?.signature_image_url || signatureImageUrls[doc.id]) return;

    supabase.storage
      .from("documents")
      .createSignedUrl(doc.signature_image_url, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) {
          setSignatureImageUrls((prev) => ({ ...prev, [doc.id]: data.signedUrl }));
        }
      });
  }, [expandedAuditId, docs, signatureImageUrls, supabase]);

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

    await logEvent(id, status === "sent" ? "sent" : "status_changed", `Status set to ${status}`);
  }

  return (
    <Card
      title="Documents"
      action={
        canManage && (
          <button
            onClick={() => setUploadOpen(true)}
            className="bg-black px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
          >
            + Upload document
          </button>
        )
      }
    >
      {docs.length === 0 ? (
        <p className="font-mono text-sm text-neutral-400">
          No documents {canManage ? "uploaded yet." : "shared with you yet."}
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {docs.map((doc) => (
            <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                  {canManage || doc.status === "signed" ? (
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                    >
                      Download
                    </button>
                  ) : (
                    <button
                      onClick={() => openPreview(doc)}
                      className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
                    >
                      Review &amp; sign
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex gap-4">
                {canManage && doc.status === "signed" && (
                  <button
                    onClick={() => setExpandedAuditId(expandedAuditId === doc.id ? null : doc.id)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
                  >
                    {expandedAuditId === doc.id ? "Hide" : "View"} signature details
                  </button>
                )}
                <button
                  onClick={() => setExpandedActivityId(expandedActivityId === doc.id ? null : doc.id)}
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
                >
                  {expandedActivityId === doc.id ? "Hide" : "View"} activity
                </button>
              </div>

              {canManage && doc.status === "signed" && expandedAuditId === doc.id && (
                <dl className="mt-3 grid grid-cols-[100px_1fr] gap-y-2 rounded-lg bg-neutral-50 p-4 font-mono text-xs">
                  <dt className="text-neutral-400">Signed by</dt>
                  <dd className="text-black">{doc.signature_name}</dd>
                  {doc.signature_method && (
                    <>
                      <dt className="text-neutral-400">Method</dt>
                      <dd className="capitalize text-black">{doc.signature_method}</dd>
                    </>
                  )}
                  {doc.signature_image_url && signatureImageUrls[doc.id] && (
                    <>
                      <dt className="text-neutral-400">Signature</dt>
                      <dd>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={signatureImageUrls[doc.id]}
                          alt={`Signature of ${doc.signature_name ?? "signer"}`}
                          className="max-h-20 border border-neutral-200 bg-white p-2"
                        />
                      </dd>
                    </>
                  )}
                  <dt className="text-neutral-400">Signed at</dt>
                  <dd className="text-black">
                    {doc.signed_at && new Date(doc.signed_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </dd>
                  <dt className="text-neutral-400">IP address</dt>
                  <dd className="text-black">{doc.signer_ip}</dd>
                  <dt className="text-neutral-400">Browser</dt>
                  <dd className="break-all text-black">{doc.signer_user_agent}</dd>
                  <dt className="text-neutral-400">Document hash</dt>
                  <dd className="break-all text-black">{doc.signature_hash}</dd>
                </dl>
              )}

              {expandedActivityId === doc.id && (
                <div className="mt-3 rounded-lg bg-neutral-50 p-4">
                  <DocumentAuditTrail documentId={doc.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload document">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                Document type
              </label>
              <select
                value={pendingType}
                onChange={(e) => setPendingType(e.target.value as DocType)}
                className="w-full border border-neutral-300 px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                File
              </label>
              <label className="block w-full cursor-pointer border border-dashed border-neutral-300 px-4 py-6 text-center font-mono text-xs uppercase tracking-widest text-neutral-500 hover:border-black hover:text-black">
                {uploading ? "Uploading…" : "Click to choose a file"}
                <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            {error && <p className="font-mono text-xs text-red-600">{error}</p>}
          </div>
        </Modal>
      )}

      {previewDoc && (
        <DocumentPreview
          doc={previewDoc}
          projectId={projectId}
          onClose={() => setPreviewDoc(null)}
          onSigned={() =>
            setDocs((curr) =>
              curr.map((d) =>
                d.id === previewDoc.id ? { ...d, status: "signed" as DocStatus } : d,
              ),
            )
          }
        />
      )}
    </Card>
  );
}
