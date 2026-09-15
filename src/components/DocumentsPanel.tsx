"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadDocument } from "@/app/actions/upload-document";
import {
  sendDocumentForSigning,
  revertDocumentToDraft,
  voidDocument,
  listDocumentSigners,
} from "@/app/actions/document-signers";
import {
  deleteDocuments,
  DOCUMENT_SIGNED_DATA_DELETE_MESSAGE,
} from "@/app/actions/admin-deletes";
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
type DocStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partially_signed"
  | "signed"
  | "voided";

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
const STATUS_STYLES: Record<DocStatus, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  sent: "bg-blue-50 text-blue-700",
  viewed: "bg-amber-50 text-amber-700",
  partially_signed: "bg-purple-50 text-purple-700",
  signed: "bg-green-50 text-green-700",
  voided: "bg-neutral-200 text-neutral-600",
};

const ACTIVE_SIGNING_STATUSES: DocStatus[] = ["sent", "viewed", "partially_signed"];

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
  if (doc.status === "voided") return "Voided";
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
  autoOpenDocumentId = null,
}: {
  projectId: string;
  initialDocuments: Doc[];
  canManage?: boolean;
  /** When set (e.g. ?sign= from Overview), open this document's signing view on mount. */
  autoOpenDocumentId?: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [docs, setDocs] = useState<Doc[]>(initialDocuments);
  const [pendingType, setPendingType] = useState<DocType>("proposal");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [voidConfirmId, setVoidConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [docsWithSignedData, setDocsWithSignedData] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [signSession, setSignSession] = useState<SignSession | null>(null);
  const [waitingOnByDoc, setWaitingOnByDoc] = useState<Record<string, string>>({});
  const [myTurnByDoc, setMyTurnByDoc] = useState<Record<string, boolean>>({});
  const [signatureImageUrls, setSignatureImageUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Keep local list in sync when the server revalidates after mutations.
  useEffect(() => {
    setDocs(initialDocuments);
  }, [initialDocuments]);

  // Track which documents have signed field values (blocks Delete; Void only).
  useEffect(() => {
    if (!canManage || docs.length === 0) {
      setDocsWithSignedData({});
      return;
    }

    let cancelled = false;

    async function loadSignedDataFlags() {
      const ids = docs.map((d) => d.id);
      const { data: valueRows } = await supabase
        .from("document_field_values")
        .select("document_id")
        .in("document_id", ids);

      if (cancelled) return;

      const withValues = new Set((valueRows ?? []).map((row) => row.document_id));
      const next: Record<string, boolean> = {};
      for (const doc of docs) {
        next[doc.id] = withValues.has(doc.id) || Boolean(doc.signed_at);
      }
      setDocsWithSignedData(next);
    }

    void loadSignedDataFlags();
    return () => {
      cancelled = true;
    };
  }, [canManage, docs, supabase]);

  // Deep-link from Overview "Review & sign" (?sign=documentId).
  useEffect(() => {
    if (!autoOpenDocumentId) return;
    const target = initialDocuments.find((d) => d.id === autoOpenDocumentId);
    if (!target) return;
    if (!["sent", "viewed", "partially_signed"].includes(target.status)) return;
    void openSignExperience(target);
    // Only on first mount for this deep-link target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenDocumentId]);

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
          if (!ACTIVE_SIGNING_STATUSES.includes(doc.status)) return;

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

  function applyDocStatusLocally(docId: string, status: DocStatus) {
    setDocs((curr) =>
      curr.map((d) => (d.id === docId ? { ...d, status } : d)),
    );
    setMyTurnByDoc((curr) => {
      const next = { ...curr };
      delete next[docId];
      return next;
    });
    if (status === "signed" || status === "voided" || status === "draft") {
      setWaitingOnByDoc((curr) => {
        const next = { ...curr };
        delete next[docId];
        return next;
      });
    }
    router.refresh();
  }

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
            .in("field_id", fieldIds)
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

  async function sendForSigning(id: string) {
    const previous = docs;
    setUpdatingId(id);
    setError(null);

    const result = await sendDocumentForSigning(id);
    setUpdatingId(null);

    if (!result.success) {
      setError(result.error);
      setDocs(previous);
      return;
    }

    applyDocStatusLocally(id, "sent");
  }

  async function revertToDraft(id: string) {
    const previous = docs;
    setUpdatingId(id);
    setError(null);

    const result = await revertDocumentToDraft(id);
    setUpdatingId(null);

    if (!result.success) {
      setError(result.error);
      setDocs(previous);
      return;
    }

    applyDocStatusLocally(id, "draft");
  }

  async function confirmVoidDocument(id: string) {
    const previous = docs;
    setUpdatingId(id);
    setError(null);
    setVoidConfirmId(null);

    const result = await voidDocument(id);
    setUpdatingId(null);

    if (!result.success) {
      setError(result.error);
      setDocs(previous);
      return;
    }

    applyDocStatusLocally(id, "voided");
  }

  async function confirmDeleteDocument(id: string) {
    if (docsWithSignedData[id]) {
      setError(DOCUMENT_SIGNED_DATA_DELETE_MESSAGE);
      setDeleteConfirmId(null);
      return;
    }

    const previous = docs;
    setUpdatingId(id);
    setError(null);
    setDeleteConfirmId(null);

    const result = await deleteDocuments([id]);
    setUpdatingId(null);

    if (!result.success) {
      setError(result.error);
      setDocs(previous);
      return;
    }

    setDocs((curr) => curr.filter((d) => d.id !== id));
    setDocsWithSignedData((curr) => {
      const next = { ...curr };
      delete next[id];
      return next;
    });
  }

  function canDeleteDocument(doc: Doc): boolean {
    return !docsWithSignedData[doc.id];
  }

  function canOpenForSigning(doc: Doc): boolean {
    if (doc.status === "signed" || doc.status === "voided") return false;
    return ACTIVE_SIGNING_STATUSES.includes(doc.status) && Boolean(myTurnByDoc[doc.id]);
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
          onSigned={() => applyDocStatusLocally(previewDoc.id, "signed")}
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
            applyDocStatusLocally(signSession.doc.id, status as DocStatus)
          }
        />
      )}

      {voidConfirmId && (
        <Modal
          open
          onClose={() => setVoidConfirmId(null)}
          title="Void this document?"
        >
          <p className="font-mono text-sm text-neutral-600">
            Signing will be cancelled for anyone who hasn&apos;t finished yet.
            Completed signatures stay on record and can&apos;t be undone. To try
            again, upload a fresh document.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={updatingId === voidConfirmId}
              onClick={() => confirmVoidDocument(voidConfirmId)}
              className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {updatingId === voidConfirmId ? "Voiding…" : "Void document"}
            </button>
            <button
              type="button"
              onClick={() => setVoidConfirmId(null)}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {deleteConfirmId && (
        <Modal
          open
          onClose={() => setDeleteConfirmId(null)}
          title="Delete this document?"
        >
          <p className="font-mono text-sm text-neutral-600">
            This permanently removes the document and its file. Only use this for
            drafts or unsent uploads with no signed field values. Documents with
            signed data can&apos;t be deleted — use Void instead.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={updatingId === deleteConfirmId}
              onClick={() => confirmDeleteDocument(deleteConfirmId)}
              className="border border-red-200 bg-red-50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red-700 transition-colors hover:border-red-400 disabled:opacity-50"
            >
              {updatingId === deleteConfirmId ? "Deleting…" : "Delete document"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );

  // ── Client portal presentation ──────────────────────────────────────────
  if (!canManage) {
    const actionable = docs.filter((doc) => canOpenForSigning(doc));
    const waiting = docs.filter(
      (doc) =>
        ACTIVE_SIGNING_STATUSES.includes(doc.status) && !canOpenForSigning(doc),
    );
    const settled = docs.filter(
      (doc) => doc.status === "signed" || doc.status === "voided",
    );
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
          <div className="surface-raised-soft px-6 py-7 md:px-7 md:py-8">
            <p className="font-serif text-lg text-black">Documents are on the way.</p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-neutral-500">
              When proposals, contracts or proofs are ready, they appear here for you
              to review and sign. Nothing needs doing until then.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {actionable.length > 0 && (
              <ul className="space-y-4">
                {actionable.map((doc) => (
                  <li
                    key={doc.id}
                    className="surface-raised px-6 py-6 md:px-7 md:py-7"
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
                        className="surface-control shrink-0 bg-portal-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
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
                  {ACTIVE_SIGNING_STATUSES.includes(doc.status) &&
                    waitingOnByDoc[doc.id] && (
                      <p className="mt-1 font-mono text-[11px] text-neutral-500">
                        {statusLabel(doc, waitingOnByDoc[doc.id])}
                      </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[doc.status]}`}
                  >
                    {doc.status.replace("_", " ")}
                  </span>
                  {doc.status === "draft" && (
                    <button
                      type="button"
                      disabled={updatingId === doc.id}
                      onClick={() => sendForSigning(doc.id)}
                      className="surface-control bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      {updatingId === doc.id ? "Sending…" : "Send for signing"}
                    </button>
                  )}
                  {ACTIVE_SIGNING_STATUSES.includes(doc.status) && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === doc.id}
                        onClick={() => setVoidConfirmId(doc.id)}
                        className="font-mono text-[11px] uppercase tracking-[0.08em] text-red-600 underline decoration-dotted hover:text-red-800 disabled:opacity-50"
                      >
                        Void document
                      </button>
                      {doc.status !== "partially_signed" && (
                        <button
                          type="button"
                          disabled={updatingId === doc.id}
                          onClick={() => revertToDraft(doc.id)}
                          className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black disabled:opacity-50"
                        >
                          {updatingId === doc.id ? "Reverting…" : "Revert to draft"}
                        </button>
                      )}
                    </>
                  )}
                  {canDeleteDocument(doc) ? (
                    <button
                      type="button"
                      disabled={updatingId === doc.id}
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-red-600 underline decoration-dotted hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  ) : doc.status !== "voided" ? (
                    <button
                      type="button"
                      onClick={() => setError(DOCUMENT_SIGNED_DATA_DELETE_MESSAGE)}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-400 underline decoration-dotted hover:text-neutral-600"
                      title={DOCUMENT_SIGNED_DATA_DELETE_MESSAGE}
                    >
                      Delete
                    </button>
                  ) : null}
                  <button
                    onClick={() => downloadDoc(doc)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                  >
                    Download
                  </button>
                  {canOpenForSigning(doc) && (
                    <button
                      onClick={() => openSignExperience(doc)}
                      className="surface-control bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
                    >
                      Fill &amp; sign
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-4">
                {doc.status === "draft" && doc.file_mime_type === "application/pdf" ? (
                  <Link
                    href={`/admin/projects/${projectId}/documents/${doc.id}/fields`}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
                  >
                    Add signature fields
                  </Link>
                ) : doc.status === "draft" ? (
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-400"
                    title="Signature fields can only be placed on PDF documents."
                  >
                    Add signature fields (PDF only)
                  </span>
                ) : null}
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
