"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Caveat } from "next/font/google";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@/lib/supabase/client";
import {
  completeSignerTurn,
  saveDocumentFieldValue,
} from "@/app/actions/document-field-values";
import {
  PDF_RENDER_WIDTH,
  fieldBelongsToSigner,
  fieldTypeLabel,
  percentToPx,
  type DocumentField,
  type DocumentFieldValue,
  type DocumentSigner,
} from "@/lib/documents";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

type PageSize = { width: number; height: number; pageNumber: number };

type Viewer = {
  role: "admin" | "client";
  userId: string;
  clientId: string | null;
  displayName: string;
};

type Props = {
  documentId: string;
  projectId: string;
  fileUrl: string;
  documentType: string;
  fields: DocumentField[];
  values: DocumentFieldValue[];
  signers: DocumentSigner[];
  primaryClientId: string | null;
  viewer: Viewer;
  onClose: () => void;
  onStatusChange: (status: string) => void;
};

async function renderTypedSignatureToPng(name: string, fontFamily: string): Promise<Blob> {
  await document.fonts.load(`48px "${fontFamily}"`);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create signature canvas.");

  const fontSize = 48;
  ctx.font = `${fontSize}px "${fontFamily}"`;
  const metrics = ctx.measureText(name);
  const padding = 32;
  canvas.width = Math.ceil(metrics.width) + padding * 2;
  canvas.height = fontSize + padding * 2;
  ctx.font = `${fontSize}px "${fontFamily}"`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "middle";
  ctx.fillText(name, padding, canvas.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create signature image."));
    }, "image/png");
  });
}

function signerLabel(
  field: DocumentField,
  signers: DocumentSigner[],
  primaryClientId: string | null,
): string {
  const match = signers.find((signer) =>
    fieldBelongsToSigner(field, signer, primaryClientId),
  );
  return match?.display_name ?? (field.assigned_to_role === "admin" ? "Supplier" : "Client");
}

export default function DocumentSignView({
  documentId,
  projectId,
  fileUrl,
  documentType,
  fields,
  values: initialValues,
  signers,
  primaryClientId,
  viewer,
  onClose,
  onStatusChange,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [pages, setPages] = useState<PageSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<DocumentFieldValue[]>(initialValues);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState("");
  const [dateDraft, setDateDraft] = useState("");
  const [legalName, setLegalName] = useState(viewer.displayName);
  const [sigMode, setSigMode] = useState<"typed" | "drawn">("typed");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const sigRef = useRef<SignatureCanvas>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const mySigner = useMemo(() => {
    if (viewer.role === "admin") {
      return signers.find((signer) => signer.role === "admin") ?? null;
    }
    return (
      signers.find(
        (signer) => signer.role === "client" && signer.client_id === viewer.clientId,
      ) ?? null
    );
  }, [signers, viewer]);

  const isMyTurn = mySigner?.status === "sent";

  const valueByFieldId = useMemo(() => {
    const map = new Map<string, DocumentFieldValue>();
    for (const value of values) map.set(value.document_field_id, value);
    return map;
  }, [values]);

  const myFields = useMemo(
    () =>
      fields.filter((field) =>
        mySigner
          ? fieldBelongsToSigner(field, mySigner, primaryClientId)
          : false,
      ),
    [fields, mySigner, primaryClientId],
  );

  const myRequiredRemaining = myFields.filter(
    (field) => field.required && !valueByFieldId.has(field.id),
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPdfMeta() {
      setLoading(true);
      const { data, error: urlError } = await supabase.storage
        .from("documents")
        .createSignedUrl(fileUrl, 300);
      if (urlError || !data) {
        if (!cancelled) {
          setError("Couldn't load the document.");
          setLoading(false);
        }
        return;
      }

      const response = await fetch(data.signedUrl);
      const arrayBuffer = await response.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
      const nextPages: PageSize[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = PDF_RENDER_WIDTH / baseViewport.width;
        const viewport = page.getViewport({ scale });
        nextPages.push({
          pageNumber,
          width: viewport.width,
          height: viewport.height,
        });
      }

      if (!cancelled) {
        setPages(nextPages);
        setLoading(false);
      }
    }

    loadPdfMeta().catch((err: Error) => {
      if (!cancelled) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fileUrl, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function renderPages() {
      if (pages.length === 0) return;
      const { data } = await supabase.storage.from("documents").createSignedUrl(fileUrl, 300);
      if (!data || cancelled) return;
      const response = await fetch(data.signedUrl);
      const arrayBuffer = await response.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;

      for (const pageInfo of pages) {
        const container = pageRefs.current[pageInfo.pageNumber];
        if (!container || cancelled) continue;
        const host = container.querySelector("[data-pdf-page-canvas]");
        if (!(host instanceof HTMLElement)) continue;

        const page = await pdf.getPage(pageInfo.pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = PDF_RENDER_WIDTH / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "block h-full w-full";
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (cancelled) return;
        host.replaceChildren(canvas);
      }
    }

    renderPages().catch((err: Error) => {
      if (!cancelled) setError(err.message);
    });

    return () => {
      cancelled = true;
    };
  }, [pages, fileUrl, supabase]);

  useEffect(() => {
    const signaturePaths = values
      .map((value) => {
        const field = fields.find((item) => item.id === value.document_field_id);
        if (field?.field_type !== "signature") return null;
        return value.value;
      })
      .filter((path): path is string => Boolean(path));

    signaturePaths.forEach((path) => {
      if (imageUrls[path]) return;
      supabase.storage
        .from("documents")
        .createSignedUrl(path, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) {
            setImageUrls((prev) => ({ ...prev, [path]: data.signedUrl }));
          }
        });
    });
  }, [values, fields, imageUrls, supabase]);

  const openField = useCallback((field: DocumentField) => {
    setActiveFieldId(field.id);
    setTextDraft("");
    setDateDraft(new Date().toISOString().slice(0, 10));
    setHasDrawn(false);
    setError(null);
  }, []);

  async function saveActiveField() {
    if (!activeFieldId) return;
    const field = fields.find((item) => item.id === activeFieldId);
    if (!field) return;

    setSubmitting(true);
    setError(null);

    try {
      let value = "";
      if (field.field_type === "text") {
        if (!textDraft.trim()) throw new Error("Enter a value.");
        value = textDraft.trim();
      } else if (field.field_type === "date") {
        if (!dateDraft) throw new Error("Choose a date.");
        value = dateDraft;
      } else {
        if (!legalName.trim()) throw new Error("Enter your full legal name.");
        let pngBlob: Blob;
        if (sigMode === "typed") {
          pngBlob = await renderTypedSignatureToPng(legalName.trim(), caveat.style.fontFamily);
        } else {
          if (sigRef.current?.isEmpty()) throw new Error("Draw your signature.");
          const dataUrl = sigRef.current?.toDataURL("image/png");
          if (!dataUrl) throw new Error("No signature drawn.");
          pngBlob = await (await fetch(dataUrl)).blob();
        }
        const path = `${projectId}/signatures/${documentId}-field-${field.id}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(path, pngBlob, { contentType: "image/png", upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        value = path;
      }

      const result = await saveDocumentFieldValue(field.id, value);
      if (!result.success) throw new Error(result.error);

      setValues((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          document_field_id: field.id,
          value,
          filled_by: viewer.userId,
        },
      ]);
      setActiveFieldId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save field.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setError(null);
    const result = await completeSignerTurn(documentId);
    setCompleting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onStatusChange(result.data.documentStatus);
    onClose();
  }

  const activeField = fields.find((field) => field.id === activeFieldId) ?? null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-100">
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            {isMyTurn ? "Your turn to sign" : "Document review"}
          </p>
          <p className="font-serif text-lg capitalize text-black">{documentType}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 hover:text-black"
        >
          Close
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          {!isMyTurn && mySigner?.status === "pending" && (
            <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-mono text-xs text-amber-800">
              {viewer.role === "client" ? (
                <>
                  Waiting on{" "}
                  {signers.find((s) => s.status === "sent")?.display_name ??
                    "another signer"}
                  . Your fields unlock when it&apos;s your turn.
                </>
              ) : (
                <>
                  Waiting for earlier signers to finish. Your fields are locked
                  until it&apos;s your turn.
                </>
              )}
            </p>
          )}
          {isMyTurn && (
            <p className="mb-6 rounded-lg border border-neutral-200 bg-white px-4 py-3 font-mono text-xs text-neutral-600">
              Fill each highlighted field assigned to you, then complete your turn.
              {myRequiredRemaining.length > 0
                ? ` ${myRequiredRemaining.length} required field(s) remaining.`
                : " All required fields complete."}
            </p>
          )}

          {error && <p className="mb-4 font-mono text-xs text-red-600">{error}</p>}
          {loading && (
            <p className="py-16 text-center font-mono text-sm text-neutral-500">Loading PDF…</p>
          )}

          {!loading && pages.length > 0 && (
            <div className="space-y-8">
              {pages.map((pageInfo) => (
                <div key={pageInfo.pageNumber}>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                    Page {pageInfo.pageNumber}
                  </p>
                  <div
                    ref={(node) => {
                      pageRefs.current[pageInfo.pageNumber] = node;
                    }}
                    className="relative mx-auto bg-white shadow-sm"
                    style={{ width: pageInfo.width, height: pageInfo.height }}
                  >
                    <div data-pdf-page-canvas className="absolute inset-0" aria-hidden />
                    {fields
                      .filter((field) => field.page_number === pageInfo.pageNumber)
                      .map((field) => {
                        const mine = mySigner
                          ? fieldBelongsToSigner(field, mySigner, primaryClientId)
                          : false;
                        const filled = valueByFieldId.get(field.id);
                        const label = signerLabel(field, signers, primaryClientId);
                        const left = percentToPx(field.x, pageInfo.width);
                        const top = percentToPx(field.y, pageInfo.height);
                        const width = percentToPx(field.width, pageInfo.width);
                        const height = percentToPx(field.height, pageInfo.height);

                        let stateClass =
                          "border-neutral-300 bg-neutral-100/80 text-neutral-500";
                        let content: ReactNode = (
                          <span>Awaiting {label}</span>
                        );

                        if (filled) {
                          stateClass = "border-neutral-400 bg-white text-black";
                          if (field.field_type === "signature" && imageUrls[filled.value]) {
                            content = (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageUrls[filled.value]}
                                alt={`Signature by ${label}`}
                                className="max-h-full max-w-full object-contain"
                              />
                            );
                          } else if (field.field_type === "signature") {
                            content = <span className="italic">Signed by {label}</span>;
                          } else {
                            content = <span>{filled.value}</span>;
                          }
                        } else if (mine && isMyTurn) {
                          stateClass =
                            "border-brand-pink bg-brand-pink/10 text-black cursor-pointer hover:bg-brand-pink/20";
                          content = <span>Fill {fieldTypeLabel(field.field_type)}</span>;
                        } else if (mine) {
                          stateClass = "border-neutral-300 bg-neutral-200/70 text-neutral-500";
                          content = <span>Locked (not your turn)</span>;
                        }

                        return (
                          <button
                            key={field.id}
                            type="button"
                            disabled={!(mine && isMyTurn && !filled)}
                            onClick={() => openField(field)}
                            className={`absolute flex flex-col items-stretch justify-center overflow-hidden border-2 px-1.5 py-1 text-left font-mono text-[10px] ${stateClass}`}
                            style={{ left, top, width, height }}
                          >
                            <span className="mb-0.5 text-[8px] uppercase tracking-[0.08em] opacity-70">
                              {label} · {fieldTypeLabel(field.field_type)}
                            </span>
                            <span className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                              {content}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isMyTurn && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing || myRequiredRemaining.length > 0}
                className="bg-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {completing ? "Completing…" : "Complete my signing"}
              </button>
            </div>
          )}
        </div>
      </div>

      {activeField && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 font-serif text-2xl text-black">
              {fieldTypeLabel(activeField.field_type)}
            </h3>

            {activeField.field_type === "text" && (
              <input
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                placeholder="Enter text"
                className="mb-4 w-full border border-neutral-300 px-3 py-2 font-mono text-sm"
              />
            )}

            {activeField.field_type === "date" && (
              <input
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
                className="mb-4 w-full border border-neutral-300 px-3 py-2 font-mono text-sm"
              />
            )}

            {activeField.field_type === "signature" && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Full legal name
                  </label>
                  <input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full border border-neutral-300 px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div className="inline-flex rounded-lg border border-neutral-200 p-1">
                  <button
                    type="button"
                    onClick={() => setSigMode("typed")}
                    className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] ${
                      sigMode === "typed" ? "bg-black text-white" : "text-neutral-600"
                    }`}
                  >
                    Type
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigMode("drawn")}
                    className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] ${
                      sigMode === "drawn" ? "bg-black text-white" : "text-neutral-600"
                    }`}
                  >
                    Draw
                  </button>
                </div>
                {sigMode === "typed" ? (
                  <div className={`${caveat.className} min-h-[64px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-4xl`}>
                    {legalName.trim() || "\u00a0"}
                  </div>
                ) : (
                  <div>
                    <div className="overflow-hidden rounded-lg border border-neutral-300">
                      <SignatureCanvas
                        ref={sigRef}
                        penColor="black"
                        canvasProps={{ className: "h-32 w-full touch-none" }}
                        onEnd={() => setHasDrawn(true)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sigRef.current?.clear();
                        setHasDrawn(false);
                      }}
                      className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && <p className="mb-3 font-mono text-xs text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={saveActiveField}
                disabled={
                  submitting ||
                  (activeField.field_type === "signature" &&
                    sigMode === "drawn" &&
                    !hasDrawn)
                }
                className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white disabled:opacity-40"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setActiveFieldId(null)}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
