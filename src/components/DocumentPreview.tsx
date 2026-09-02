"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Caveat } from "next/font/google";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@/lib/supabase/client";
import { hashFile } from "@/lib/hash-file";
import { signDocument } from "@/app/actions/sign-document";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

type PreviewDoc = {
  id: string;
  file_url: string;
  status: string;
  type?: string;
};

function getExtension(path: string): string {
  const filename = path.split("/").pop() ?? "";
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

async function renderTypedSignatureToPng(
  name: string,
  fontFamily: string,
): Promise<Blob> {
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

function DocxPreview({ arrayBuffer }: { arrayBuffer: ArrayBuffer }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("mammoth")
      .then((mammoth) => mammoth.convertToHtml({ arrayBuffer }))
      .then((result) => {
        if (!cancelled) {
          setHtml(result.value);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [arrayBuffer]);

  if (loading) {
    return <p className="py-12 text-center font-mono text-sm text-neutral-500">Loading document…</p>;
  }
  if (error) {
    return <p className="py-12 text-center font-mono text-sm text-red-600">{error}</p>;
  }

  return (
    <div
      className="document-preview-page font-serif text-base leading-relaxed text-black [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-normal [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-normal [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-neutral-200 [&_td]:p-2 [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:p-2 [&_th]:text-left [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PdfPreview({ arrayBuffer }: { arrayBuffer: ArrayBuffer }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    async function renderPdf() {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
      if (!container || cancelled) return;

      container.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "mx-auto mb-6 block bg-white shadow-sm";

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        if (cancelled) return;
        container.appendChild(canvas);
      }

      setLoading(false);
    }

    renderPdf().catch((err: Error) => {
      if (!cancelled) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [arrayBuffer]);

  if (error) {
    return <p className="py-12 text-center font-mono text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      {loading && (
        <p className="py-12 text-center font-mono text-sm text-neutral-500">Loading document…</p>
      )}
      <div ref={containerRef} className={loading ? "hidden" : undefined} />
    </div>
  );
}

export default function DocumentPreview({
  doc,
  projectId,
  onClose,
  onSigned,
}: {
  doc: PreviewDoc;
  projectId: string;
  onClose: () => void;
  onSigned: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const sigRef = useRef<SignatureCanvas>(null);

  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(true);

  const [reviewed, setReviewed] = useState(false);
  const [mode, setMode] = useState<"typed" | "drawn">("typed");
  const [legalName, setLegalName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extension = getExtension(doc.file_url);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFile() {
      setLoadingFile(true);
      setLoadError(null);

      const { data, error: urlError } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_url, 300);

      if (urlError || !data) {
        if (!cancelled) {
          setLoadError("Couldn't load the document. Try again.");
          setLoadingFile(false);
        }
        return;
      }

      const response = await fetch(data.signedUrl);
      if (!response.ok) {
        if (!cancelled) {
          setLoadError("Couldn't download the document. Try again.");
          setLoadingFile(false);
        }
        return;
      }

      const buffer = await response.arrayBuffer();
      if (!cancelled) {
        setArrayBuffer(buffer);
        setLoadingFile(false);
      }
    }

    loadFile();
    return () => {
      cancelled = true;
    };
  }, [doc.file_url, supabase]);

  const hasSignature = mode === "typed" ? legalName.trim().length > 0 : hasDrawn;

  const canSubmit = reviewed && legalName.trim().length > 0 && hasSignature && !submitting;

  const clearDrawnSignature = useCallback(() => {
    sigRef.current?.clear();
    setHasDrawn(false);
  }, []);

  async function handleSubmit() {
    if (!canSubmit || !arrayBuffer) return;

    setSubmitting(true);
    setError(null);

    try {
      let pngBlob: Blob;
      if (mode === "typed") {
        pngBlob = await renderTypedSignatureToPng(legalName.trim(), caveat.style.fontFamily);
      } else {
        if (sigRef.current?.isEmpty()) {
          setError("Draw your signature before submitting.");
          setSubmitting(false);
          return;
        }
        const dataUrl = sigRef.current?.toDataURL("image/png");
        if (!dataUrl) throw new Error("No signature drawn.");
        const res = await fetch(dataUrl);
        pngBlob = await res.blob();
      }

      const timestamp = Date.now();
      const path = `${projectId}/signatures/${doc.id}-${timestamp}.png`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, pngBlob, { contentType: "image/png", upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }

      const fileHash = await hashFile(new Blob([arrayBuffer]));
      const result = await signDocument(
        doc.id,
        legalName.trim(),
        fileHash,
        path,
        mode,
      );

      if (!result.success) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      onSigned();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-100">
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            Document preview
          </p>
          {doc.type && (
            <p className="font-serif text-lg capitalize text-black">{doc.type}</p>
          )}
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
          {loadingFile && (
            <p className="py-16 text-center font-mono text-sm text-neutral-500">
              Loading document…
            </p>
          )}

          {loadError && (
            <p className="py-16 text-center font-mono text-sm text-red-600">{loadError}</p>
          )}

          {!loadingFile && !loadError && arrayBuffer && (
            <>
              <div className="mb-8">
                {extension === "pdf" ? (
                  <PdfPreview arrayBuffer={arrayBuffer} />
                ) : extension === "docx" ? (
                  <div className="document-preview-page mx-auto max-w-[800px] bg-white px-8 py-10 shadow-sm md:px-12 md:py-14">
                    <DocxPreview arrayBuffer={arrayBuffer} />
                  </div>
                ) : (
                  <p className="py-12 text-center font-mono text-sm text-neutral-500">
                    Preview is only available for PDF and DOCX files.
                  </p>
                )}
              </div>

              <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-6 font-serif text-2xl text-black">Sign this document</h2>

                <label className="mb-6 flex items-start gap-3 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => setReviewed(e.target.checked)}
                    className="mt-1"
                  />
                  <span>I have reviewed this document.</span>
                </label>

                <div className="mb-6">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Signature method
                  </p>
                  <div className="inline-flex rounded-lg border border-neutral-200 p-1">
                    <button
                      type="button"
                      onClick={() => setMode("typed")}
                      className={`rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                        mode === "typed"
                          ? "bg-black text-white"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      Type
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("drawn")}
                      className={`rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                        mode === "drawn"
                          ? "bg-black text-white"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      Draw
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                    Full legal name
                  </label>
                  <input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Full legal name"
                    className="w-full border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-black"
                  />
                </div>

                {mode === "typed" ? (
                  <div className="mb-6">
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Signature preview
                    </p>
                    <div className="flex min-h-[80px] items-center rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4">
                      <span
                        className={`${caveat.className} text-5xl text-black`}
                        style={{ minHeight: "1.2em" }}
                      >
                        {legalName.trim() || "\u00a0"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                      Draw your signature
                    </p>
                    <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
                      <SignatureCanvas
                        ref={sigRef}
                        penColor="black"
                        canvasProps={{
                          className: "h-40 w-full touch-none",
                        }}
                        onEnd={() => setHasDrawn(true)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearDrawnSignature}
                      className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-black"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {error && <p className="mb-4 font-mono text-xs text-red-600">{error}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {submitting ? "Signing…" : "Sign document"}
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
