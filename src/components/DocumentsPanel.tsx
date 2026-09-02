"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadDocument } from "@/app/actions/upload-document";
import { sendDocumentForSigning } from "@/app/actions/document-signers";
import { listDocumentSigners } from "@/app/actions/document-signers";
import { getCertificateDownloadUrl } from "@/app/actions/certificate";
import DocumentPreview from "@/components/DocumentPreview";
import DocumentSignView from "@/components/DocumentSignView";
import DocumentAuditTrail from "@/components/DocumentAuditTrail";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import type {
  DocumentField,
  DocumentFieldValue,
  DocumentSigner,
} from "@/lib/documents";
import { clientDocumentStatusLabel } from "@/lib/client-document-status";
import PortalSectionHeading from "@/components/PortalSectionHeading";

type DocType = "proposal" | "agreement" | "welcome" | "invoice" | "other";
type DocStatus = "draft" | "sent" | "viewed" | "partially_signed" | "signed";

type Doc = {
  id: string;
  type: DocType;
  file_url: string;
  file_mime_type?: string | null;
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
const STATUSES: DocStatus[] = ["draft", "sent", "viewed", "partially_signed", "signed"];
const STATUS_STYLES: Record<DocStatus, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  sent: "bg-blue-50 text-blue-700",
  viewed: "bg-amber-50 text-amber-700",
  partially_signed: "bg-purple-50 text-purple-700",
  signed: "bg-green-50 text-green-700",
};

type SignSession = {
  doc: Doc;
  fields: DocumentField[];
  values: DocumentFieldValue[];
  signers: DocumentSigner[];
  primaryClientId: string | null;
  viewer: {
    role: "admin" | "client";
    userId: string;
    clientId: string | null;
    displayName: string;
  };
};

function statusLabel(doc: Doc, waitingOn: string | null): string {
  if (doc.status === "partially_signed") {
    return waitingOn ? `Partially signed (waiting on ${waitingOn})` : "Partially signed";
  }
  if (doc.status === "sent" && waitingOn) {
    return `Sent (waiting on ${waitingOn})`;
  }
  return doc.status.replace("_", " ");
}

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
  const [signSession, setSignSession] = useState<SignSession | null>(null);
  const [waitingOnByDoc, setWaitingOnByDoc] = useState<Record<string, string>>({});
  const [myTurnByDoc, setMyTurnByDoc] = useState<Record<string, boolean>>({});
  const [signatureImageUrls, setSignatureImageUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSignerMeta() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, client_id")
        .eq("id", user.id)
        .single();

      const waiting: Record<string, string> = {};
      const myTurn: Record<string, boolean> = {};

      await Promise.all(
        docs.map(async (doc) => {
          if (!["sent", "viewed", "partially_signed"].includes(doc.status)) return;

          const { count: fieldCount } = await supabase
            .from("document_fields")
            .select("id", { count: "exact", head: true })
            .eq("document_id", doc.id);

          // Whole-document flow (no fields): single client signer, no queue.
          if ((fieldCount ?? 0) === 0) {
            if (profile?.role !== "admin") {
              myTurn[doc.id] = doc.status === "sent" || doc.status === "viewed";
            }
            return;
          }

          const result = await listDocumentSigners(doc.id);
          if (!result.success || cancelled) return;
          const active = result.data.find((signer) => signer.status === "sent");
          if (active?.display_name) waiting[doc.id] = active.display_name;
          if (profile?.role === "admin") {
            myTurn[doc.id] = active?.role === "admin";
          } else {
            myTurn[doc.id] =
              active?.role === "client" && active.client_id === profile?.client_id;
          }
        }),
      );

      if (!cancelled) {
        setWaitingOnByDoc(waiting);
        setMyTurnByDoc(myTurn);
      }
    }

    void loadSignerMeta();
    return () => {
      cancelled = true;
    };
  }, [docs, supabase]);

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);
    formData.append("type", pendingType);

    const result = await uploadDocument(formData);

    setUploading(false);
    e.target.value = "";

    if (!result.success) {
      setError(result.error);
      return;
    }

    await logEvent(result.document.id, "created", `Uploaded as ${pendingType}`);
    setDocs((curr) => [result.document as Doc, ...curr]);
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

  async function downloadCertificate(doc: Doc) {
    setError(null);
    const result = await getCertificateDownloadUrl(doc.id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    window.open(result.url, "_blank");
  }

  async function openSignExperience(doc: Doc) {
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, client_id, full_name")
      .eq("id", user.id)
      .single();

    const { data: project } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", projectId)
      .single();

    const [{ data: fields }, signersResult] = await Promise.all([
      supabase.from("document_fields").select("*").eq("document_id", doc.id),
      listDocumentSigners(doc.id),
    ]);

    const fieldList = (fields ?? []) as DocumentField[];
    const fieldIds = fieldList.map((row) => row.id);
    const { data: values } =
      fieldIds.length > 0
        ? await supabase
            .from("document_field_values")
            .select("*")
            .in("document_field_id", fieldIds)
        : { data: [] as DocumentFieldValue[] };

    if (!canManage && doc.status === "sent") {
      await supabase.from("documents").update({ status: "viewed" }).eq("id", doc.id);
      await logEvent(doc.id, "viewed");
      setDocs((curr) =>
        curr.map((d) => (d.id === doc.id ? { ...d, status: "viewed" as DocStatus } : d)),
      );
    }

    // Field-based signing when placement fields exist; otherwise whole-document flow.
    if (fieldList.length > 0 && signersResult.success) {
      setSignSession({
        doc,
        fields: fieldList,
        values: (values ?? []) as DocumentFieldValue[],
        signers: signersResult.data,
        primaryClientId: (project?.client_id as string | null) ?? null,
        viewer: {
          role: profile?.role === "admin" ? "admin" : "client",
          userId: user.id,
          clientId: profile?.client_id ?? null,
          displayName: profile?.full_name ?? "",
        },
      });
      return;
    }

    // Legacy whole-document signing for DOCX / documents without fields.
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
    setUpdatingId(id);

    if (status === "sent") {
      const result = await sendDocumentForSigning(id);
      setUpdatingId(null);
      if (!result.success) {
        setError(result.error);
        setDocs(previous);
        return;
      }
      setDocs((curr) => curr.map((d) => (d.id === id ? { ...d, status: "sent" } : d)));
      return;
    }

    if (status === "partially_signed") {
      setUpdatingId(null);
      setError("Partially signed is set automatically as signers complete.");
      return;
    }

    setDocs((curr) => curr.map((d) => (d.id === id ? { ...d, status } : d)));
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

    await logEvent(id, "status_changed", `Status set to ${status}`);
  }

  function canOpenForSigning(doc: Doc): boolean {
    if (doc.status === "signed") return false;
    return (
      ["sent", "viewed", "partially_signed"].includes(doc.status) &&
      Boolean(myTurnByDoc[doc.id])
    );
  }

  function formatDocDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const signOverlays = (
    <>
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

      {signSession && (
        <DocumentSignView
          documentId={signSession.doc.id}
          projectId={projectId}
          fileUrl={signSession.doc.file_url}
          documentType={signSession.doc.type}
          fields={signSession.fields}
          values={signSession.values}
          signers={signSession.signers}
          primaryClientId={signSession.primaryClientId}
          viewer={signSession.viewer}
          onClose={() => setSignSession(null)}
          onStatusChange={(status) =>
            setDocs((curr) =>
              curr.map((d) =>
                d.id === signSession.doc.id
                  ? { ...d, status: status as DocStatus }
                  : d,
              ),
            )
          }
        />
      )}
    </>
  );

  // ── Client portal presentation ──────────────────────────────────────────
  if (!canManage) {
    const actionable = docs.filter((doc) => canOpenForSigning(doc));
    const waiting = docs.filter(
      (doc) =>
        ["sent", "viewed", "partially_signed"].includes(doc.status) &&
        !canOpenForSigning(doc),
    );
    const settled = docs.filter((doc) => doc.status === "signed");
    const other = docs.filter(
      (doc) =>
        !actionable.includes(doc) &&
        !waiting.includes(doc) &&
        !settled.includes(doc),
    );

    function clientStatus(doc: Doc) {
      return clientDocumentStatusLabel({
        status: doc.status,
        isMyTurn: Boolean(myTurnByDoc[doc.id]),
        waitingOnName: waitingOnByDoc[doc.id] ?? null,
      });
    }

    return (
      <section>
        <header className="mb-3 md:mb-3.5">
          <PortalSectionHeading>Documents</PortalSectionHeading>
          {actionable.length > 0 ? (
            <p className="mt-1.5 pl-[22px] font-serif text-lg italic text-neutral-500">
              {actionable.length === 1
                ? "One ready for you."
                : `${actionable.length} ready for you.`}
            </p>
          ) : (
            <p className="mt-1.5 pl-[22px] text-sm text-neutral-500">
              Shared files for this project.
            </p>
          )}
        </header>

        {error && <p className="mb-4 font-mono text-xs text-red-600">{error}</p>}

        {docs.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing shared with you yet.</p>
        ) : (
          <div className="space-y-8">
            {actionable.length > 0 && (
              <ul className="space-y-4">
                {actionable.map((doc) => (
                  <li
                    key={doc.id}
                    className="border border-black bg-white px-5 py-5 md:px-6 md:py-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-serif text-2xl capitalize tracking-tight text-black">
                          {doc.type}
                        </p>
                        <p className="mt-2 font-mono text-xs text-neutral-500">
                          {clientStatus(doc)}
                          <span className="text-neutral-300"> · </span>
                          {formatDocDate(doc.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSignExperience(doc)}
                        className="shrink-0 bg-portal-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
                      >
                        Review &amp; sign
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-neutral-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedActivityId(
                            expandedActivityId === doc.id ? null : doc.id,
                          )
                        }
                        className="font-mono text-[11px] text-neutral-500 underline decoration-dotted hover:text-black"
                      >
                        {expandedActivityId === doc.id ? "Hide" : "View"} activity
                      </button>
                    </div>
                    {expandedActivityId === doc.id && (
                      <div className="mt-3 bg-neutral-50 p-4">
                        <DocumentAuditTrail documentId={doc.id} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {(waiting.length > 0 || settled.length > 0 || other.length > 0) && (
              <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
                {[...waiting, ...other, ...settled].map((doc) => (
                  <li key={doc.id} className="py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-serif text-xl capitalize text-black">
                          {doc.type}
                        </p>
                        <p className="mt-1 font-mono text-xs text-neutral-500">
                          {clientStatus(doc)}
                          <span className="text-neutral-300"> · </span>
                          {formatDocDate(doc.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        {doc.status === "signed" && (
                          <>
                            <button
                              type="button"
                              onClick={() => downloadDoc(doc)}
                              className="font-mono text-[11px] text-neutral-600 underline decoration-dotted hover:text-black"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadCertificate(doc)}
                              className="font-mono text-[11px] text-neutral-600 underline decoration-dotted hover:text-black"
                            >
                              Certificate
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedActivityId(
                              expandedActivityId === doc.id ? null : doc.id,
                            )
                          }
                          className="font-mono text-[11px] text-neutral-400 underline decoration-dotted hover:text-black"
                        >
                          {expandedActivityId === doc.id ? "Hide" : "Activity"}
                        </button>
                      </div>
                    </div>
                    {expandedActivityId === doc.id && (
                      <div className="mt-3 bg-neutral-50 p-4">
                        <DocumentAuditTrail documentId={doc.id} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {signOverlays}
      </section>
    );
  }

  // ── Admin presentation (unchanged) ──────────────────────────────────────
  return (
    <Card
      title="Documents"
      action={
        <button
          onClick={() => setUploadOpen(true)}
          className="bg-black px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Upload document
        </button>
      }
    >
      {error && <p className="mb-4 font-mono text-xs text-red-600">{error}</p>}

      {docs.length === 0 ? (
        <p className="font-mono text-sm text-neutral-400">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {docs.map((doc) => (
            <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-sans text-sm capitalize text-black">{doc.type}</p>
                  <p className="font-mono text-xs text-neutral-400">
                    {formatDocDate(doc.created_at)}
                  </p>
                  {["sent", "viewed", "partially_signed"].includes(doc.status) &&
                    waitingOnByDoc[doc.id] && (
                      <p className="mt-1 font-mono text-[11px] text-neutral-500">
                        {statusLabel(doc, waitingOnByDoc[doc.id])}
                      </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={doc.status}
                    disabled={updatingId === doc.id || doc.status === "signed"}
                    onChange={(e) => updateStatus(doc.id, e.target.value as DocStatus)}
                    className={`rounded-full border-0 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] disabled:opacity-70 ${STATUS_STYLES[doc.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => downloadDoc(doc)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                  >
                    Download
                  </button>
                  {canOpenForSigning(doc) && (
                    <button
                      onClick={() => openSignExperience(doc)}
                      className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
                    >
                      Fill &amp; sign
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-4">
                {doc.file_mime_type === "application/pdf" ? (
                  <Link
                    href={`/admin/projects/${projectId}/documents/${doc.id}/fields`}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                  >
                    Add signature fields
                  </Link>
                ) : (
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-400"
                    title="Signature fields can only be placed on PDF documents."
                  >
                    Add signature fields (PDF only)
                  </span>
                )}
                {doc.status === "signed" && (
                  <button
                    onClick={() =>
                      setExpandedAuditId(expandedAuditId === doc.id ? null : doc.id)
                    }
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
                  >
                    {expandedAuditId === doc.id ? "Hide" : "View"} signature details
                  </button>
                )}
                {doc.status === "signed" && (
                  <button
                    onClick={() => downloadCertificate(doc)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                  >
                    Certificate of completion
                  </button>
                )}
                <button
                  onClick={() =>
                    setExpandedActivityId(expandedActivityId === doc.id ? null : doc.id)
                  }
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
                >
                  {expandedActivityId === doc.id ? "Hide" : "View"} activity
                </button>
              </div>

              {doc.status === "signed" && expandedAuditId === doc.id && (
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

              {expandedActivityId === doc.id && (
                <div className="mt-3 rounded-lg bg-neutral-50 p-4">
                  <DocumentAuditTrail documentId={doc.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

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
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              File
            </label>
            <label className="block w-full cursor-pointer border border-dashed border-neutral-300 px-4 py-6 text-center font-mono text-xs uppercase tracking-widest text-neutral-500 hover:border-black hover:text-black">
              {uploading ? "Uploading…" : "Click to choose a file"}
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </Modal>

      {signOverlays}
    </Card>
  );
}
