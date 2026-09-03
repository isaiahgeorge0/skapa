"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Rnd } from "react-rnd";
import { createClient } from "@/lib/supabase/client";
import {
  copyDocumentFields,
  createDocumentField,
  deleteDocumentField,
  updateDocumentField,
} from "@/app/actions/document-fields";
import {
  finishDocumentFieldEditing,
  listDocumentSigners,
  reorderDocumentSigners,
  syncDocumentSigners,
} from "@/app/actions/document-signers";
import {
  DEFAULT_FIELD_SIZE,
  MIN_FIELD_SIZE_PX,
  PDF_RENDER_WIDTH,
  type DocumentField,
  type DocumentFieldType,
  type DocumentSigner,
  type FieldAssigneeOption,
  assigneeValueForField,
  buildAssigneeOptions,
  fieldTypeLabel,
  parseAssigneeValue,
  percentToPx,
  pxToPercent,
  resolveAssigneeOption,
} from "@/lib/documents";

type PageSize = { width: number; height: number; pageNumber: number };

type CopySourceDocument = {
  id: string;
  label: string;
};

type ProjectClient = {
  id: string;
  name: string;
};

type PlacementTool = DocumentFieldType | null;

const RESIZE_HANDLES = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  topRight: true,
  bottomRight: true,
  bottomLeft: true,
  topLeft: true,
} as const;

const HANDLE_SIZE = 10;

function resizeHandleStyles(visible: boolean): Record<string, CSSProperties> {
  const base: CSSProperties = {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: "#0a0a0a",
    border: "2px solid #ffffff",
    borderRadius: 1,
    zIndex: 30,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
  };

  return {
    topLeft: { ...base, top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: "nwse-resize" },
    topRight: { ...base, top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: "nesw-resize" },
    bottomLeft: {
      ...base,
      bottom: -HANDLE_SIZE / 2,
      left: -HANDLE_SIZE / 2,
      cursor: "nesw-resize",
    },
    bottomRight: {
      ...base,
      bottom: -HANDLE_SIZE / 2,
      right: -HANDLE_SIZE / 2,
      cursor: "nwse-resize",
    },
  };
}

function assigneeVisual(option: FieldAssigneeOption) {
  if (!option.role) {
    return {
      box: "border-2 border-dashed border-neutral-400 bg-neutral-50/90",
      badge: "border border-dashed border-neutral-500 bg-white text-neutral-500",
      chip: "text-neutral-500",
    };
  }
  if (option.role === "admin") {
    return {
      box: "border-l-[5px] border-l-brand-pink border-y border-r border-brand-pink/40 bg-brand-pink/10",
      badge: "bg-brand-pink text-white",
      chip: "text-brand-pink",
    };
  }
  return {
    box: "border-l-[5px] border-l-black border-y border-r border-neutral-400 bg-white",
    badge: "bg-black text-white",
    chip: "text-neutral-700",
  };
}

function AssigneeSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: FieldAssigneeOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const unassigned = options.filter((option) => option.group === "unassigned");
  const supplier = options.filter((option) => option.group === "supplier");
  const clients = options.filter((option) => option.group === "clients");

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      className="w-full border border-neutral-300 bg-white px-2 py-1.5 font-mono text-[11px] text-black disabled:opacity-50"
    >
      {unassigned.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      <optgroup label="Supplier">
        {supplier.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="Clients">
        {clients.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export default function DocumentFieldEditor({
  projectId,
  documentId,
  fileUrl,
  initialFields,
  copySourceDocuments,
  projectClients,
  initialSigners,
  documentStatus = "draft",
}: {
  projectId: string;
  documentId: string;
  fileUrl: string;
  initialFields: DocumentField[];
  copySourceDocuments: CopySourceDocument[];
  projectClients: ProjectClient[];
  initialSigners?: DocumentSigner[];
  documentStatus?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const assigneeOptions = useMemo(
    () => buildAssigneeOptions(projectClients),
    [projectClients],
  );

  const [fields, setFields] = useState<DocumentField[]>(initialFields);
  const [signers, setSigners] = useState<DocumentSigner[]>(initialSigners ?? []);
  const [pages, setPages] = useState<PageSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<PlacementTool>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
  const [copySourceId, setCopySourceId] = useState("");
  const [copying, setCopying] = useState(false);
  const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [doneSummary, setDoneSummary] = useState<string | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fieldCardRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canReorderSigners = documentStatus === "draft";

  function selectField(fieldId: string, scrollSidebar = true) {
    setSelectedFieldId(fieldId);
    if (!scrollSidebar) return;

    window.requestAnimationFrame(() => {
      const card = fieldCardRefs.current[fieldId];
      card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    setHighlightedFieldId(fieldId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedFieldId((current) => (current === fieldId ? null : current));
    }, 1400);
  }

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  async function refreshSigners() {
    const result = await listDocumentSigners(documentId);
    if (result.success) setSigners(result.data);
  }

  useEffect(() => {
    if (!initialSigners?.length) {
      void syncDocumentSigners(documentId).then((result) => {
        if (result.success) setSigners(result.data);
      });
    }
  }, [documentId, initialSigners]);

  async function handleFinishEditing() {
    setFinishing(true);
    setError(null);
    setDoneSummary(null);

    const result = await finishDocumentFieldEditing(documentId);
    setFinishing(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await refreshSigners();
    setDoneSummary(result.data.summary);
  }

  function confirmDoneAndLeave() {
    router.push(`/admin/projects/${projectId}/documents`);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);

      const { data, error: urlError } = await supabase.storage
        .from("documents")
        .createSignedUrl(fileUrl, 300);

      if (urlError || !data) {
        if (!cancelled) {
          setError("Couldn't load the PDF. Try again.");
          setLoading(false);
        }
        return;
      }

      const response = await fetch(data.signedUrl);
      if (!response.ok) {
        if (!cancelled) {
          setError("Couldn't download the PDF. Try again.");
          setLoading(false);
        }
        return;
      }

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

    loadPdf().catch((err: Error) => {
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

      const { data, error: urlError } = await supabase.storage
        .from("documents")
        .createSignedUrl(fileUrl, 300);

      if (urlError || !data || cancelled) return;

      const response = await fetch(data.signedUrl);
      if (!response.ok || cancelled) return;

      const arrayBuffer = await response.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;

      for (const pageInfo of pages) {
        const container = pageRefs.current[pageInfo.pageNumber];
        if (!container || cancelled) continue;

        const canvasHost = container.querySelector("[data-pdf-page-canvas]");
        if (!(canvasHost instanceof HTMLElement)) continue;

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

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        if (cancelled) return;
        canvasHost.replaceChildren(canvas);
      }
    }

    renderPages().catch((err: Error) => {
      if (!cancelled) setError(err.message);
    });

    return () => {
      cancelled = true;
    };
  }, [pages, fileUrl, supabase]);

  const fieldsByPage = useMemo(() => {
    const grouped = new Map<number, DocumentField[]>();
    for (const field of fields) {
      const pageFields = grouped.get(field.page_number) ?? [];
      pageFields.push(field);
      grouped.set(field.page_number, pageFields);
    }
    return grouped;
  }, [fields]);

  const persistFieldGeometry = useCallback(
    async (
      fieldId: string,
      geometry: {
        page_number: number;
        x: number;
        y: number;
        width: number;
        height: number;
      },
    ) => {
      setSavingFieldId(fieldId);
      setFields((current) =>
        current.map((field) =>
          field.id === fieldId ? { ...field, ...geometry } : field,
        ),
      );

      const result = await updateDocumentField(fieldId, geometry);
      setSavingFieldId(null);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setFields((current) =>
        current.map((field) => (field.id === fieldId ? result.data : field)),
      );
    },
    [],
  );

  async function handleAssigneeChange(fieldId: string, value: string) {
    const parsed = parseAssigneeValue(value, assigneeOptions);
    const nextAssignee = {
      assigned_to_role: parsed.role,
      assigned_to_client_id: parsed.clientId,
    };

    setSavingFieldId(fieldId);
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId ? { ...field, ...nextAssignee } : field,
      ),
    );

    const result = await updateDocumentField(fieldId, nextAssignee);
    setSavingFieldId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Merge server row onto local assignee so a partial/stale response can't
    // wipe the selection the admin just made.
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              ...result.data,
              assigned_to_role: result.data.assigned_to_role ?? null,
              assigned_to_client_id: result.data.assigned_to_client_id ?? null,
            }
          : field,
      ),
    );
    await refreshSigners();
  }

  async function moveSigner(signerId: string, direction: -1 | 1) {
    if (!canReorderSigners || reordering) return;
    const index = signers.findIndex((signer) => signer.id === signerId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= signers.length) return;

    const next = [...signers];
    const [removed] = next.splice(index, 1);
    next.splice(swapWith, 0, removed);
    setSigners(next.map((signer, order_index) => ({ ...signer, order_index })));
    setReordering(true);

    const result = await reorderDocumentSigners(
      documentId,
      next.map((signer) => signer.id),
    );
    setReordering(false);

    if (!result.success) {
      setError(result.error);
      await refreshSigners();
      return;
    }

    setSigners(result.data);
  }

  async function handlePlaceField(pageNumber: number, clientX: number, clientY: number) {
    if (!activeTool) return;

    const pageEl = pageRefs.current[pageNumber];
    const pageInfo = pages.find((page) => page.pageNumber === pageNumber);
    if (!pageEl || !pageInfo) return;

    const rect = pageEl.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const defaults = DEFAULT_FIELD_SIZE[activeTool];
    const widthPx = percentToPx(defaults.width, pageInfo.width);
    const heightPx = percentToPx(defaults.height, pageInfo.height);

    let xPx = clickX - widthPx / 2;
    let yPx = clickY - heightPx / 2;
    xPx = Math.max(0, Math.min(xPx, pageInfo.width - widthPx));
    yPx = Math.max(0, Math.min(yPx, pageInfo.height - heightPx));

    const payload = {
      field_type: activeTool,
      page_number: pageNumber,
      x: pxToPercent(xPx, pageInfo.width),
      y: pxToPercent(yPx, pageInfo.height),
      width: defaults.width,
      height: defaults.height,
      required: true,
      assigned_to_role: null,
      assigned_to_client_id: null,
    };

    const result = await createDocumentField(documentId, payload);
    if (!result.success) {
      setError(result.error);
      return;
    }

    setFields((current) => [
      ...current,
      {
        ...result.data,
        assigned_to_role: result.data.assigned_to_role ?? null,
        assigned_to_client_id: result.data.assigned_to_client_id ?? null,
      },
    ]);
    selectField(result.data.id);
    await refreshSigners();
  }

  async function handleDeleteField(fieldId: string) {
    const result = await deleteDocumentField(fieldId);
    if (!result.success) {
      setError(result.error);
      return;
    }

    setFields((current) => current.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    await refreshSigners();
  }

  async function handleToggleRequired(field: DocumentField) {
    const result = await updateDocumentField(field.id, { required: !field.required });
    if (!result.success) {
      setError(result.error);
      return;
    }

    setFields((current) =>
      current.map((item) => (item.id === field.id ? result.data : item)),
    );
  }

  async function handleCopyFields() {
    if (!copySourceId) return;
    setCopying(true);
    setError(null);

    const result = await copyDocumentFields(copySourceId, documentId);
    setCopying(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const { data: refreshedFields, error: refreshError } = await supabase
      .from("document_fields")
      .select("*")
      .eq("document_id", documentId)
      .order("page_number")
      .order("id");

    if (refreshError) {
      setError(refreshError.message);
      return;
    }

    setFields(
      ((refreshedFields ?? []) as DocumentField[]).map((field) => ({
        ...field,
        assigned_to_role:
          field.assigned_to_role === "admin" || field.assigned_to_role === "client"
            ? field.assigned_to_role
            : null,
        assigned_to_client_id: field.assigned_to_client_id ?? null,
      })),
    );
    setCopySourceId("");
    await refreshSigners();
  }

  function renderToolbarButton(type: DocumentFieldType, label: string) {
    const active = activeTool === type;
    return (
      <button
        type="button"
        onClick={() => setActiveTool(active ? null : type)}
        className={`w-full rounded-md px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
          active
            ? "bg-black text-white"
            : "border border-neutral-300 text-neutral-700 hover:border-black"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
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
                  className={`relative mx-auto max-w-full bg-white shadow-sm ${
                    activeTool ? "cursor-crosshair" : ""
                  }`}
                  style={{ width: pageInfo.width, height: pageInfo.height }}
                  onClick={(event) => {
                    if (!activeTool) return;
                    if ((event.target as HTMLElement).closest("[data-field-box]")) return;
                    handlePlaceField(pageInfo.pageNumber, event.clientX, event.clientY);
                  }}
                >
                  <div data-pdf-page-canvas className="absolute inset-0" aria-hidden />

                  {(fieldsByPage.get(pageInfo.pageNumber) ?? []).map((field) => {
                    const x = percentToPx(field.x, pageInfo.width);
                    const y = percentToPx(field.y, pageInfo.height);
                    const width = percentToPx(field.width, pageInfo.width);
                    const height = percentToPx(field.height, pageInfo.height);
                    const selected = selectedFieldId === field.id;
                    const showHandles =
                      !activeTool &&
                      (selected ||
                        hoveredFieldId === field.id ||
                        resizingFieldId === field.id);
                    const canInteract = !activeTool;
                    const minPx = MIN_FIELD_SIZE_PX[field.field_type];
                    const assignee = resolveAssigneeOption(field, assigneeOptions);
                    const visual = assigneeVisual(assignee);

                    return (
                      <Rnd
                        key={field.id}
                        bounds="parent"
                        size={{ width, height }}
                        position={{ x, y }}
                        minWidth={minPx.width}
                        minHeight={minPx.height}
                        lockAspectRatio={false}
                        enableResizing={canInteract ? RESIZE_HANDLES : false}
                        disableDragging={!canInteract}
                        resizeHandleStyles={resizeHandleStyles(showHandles)}
                        onMouseEnter={() => setHoveredFieldId(field.id)}
                        onMouseLeave={() =>
                          setHoveredFieldId((current) =>
                            current === field.id ? null : current,
                          )
                        }
                        onDragStart={() => selectField(field.id)}
                        onResizeStart={() => {
                          selectField(field.id, false);
                          setResizingFieldId(field.id);
                        }}
                        onDragStop={(_event, data) => {
                          void persistFieldGeometry(field.id, {
                            page_number: pageInfo.pageNumber,
                            x: pxToPercent(data.x, pageInfo.width),
                            y: pxToPercent(data.y, pageInfo.height),
                            width: field.width,
                            height: field.height,
                          });
                        }}
                        onResizeStop={(_event, _direction, ref, _delta, position) => {
                          setResizingFieldId(null);
                          void persistFieldGeometry(field.id, {
                            page_number: pageInfo.pageNumber,
                            x: pxToPercent(position.x, pageInfo.width),
                            y: pxToPercent(position.y, pageInfo.height),
                            width: pxToPercent(ref.offsetWidth, pageInfo.width),
                            height: pxToPercent(ref.offsetHeight, pageInfo.height),
                          });
                        }}
                        className={`document-field-box ${selected ? "z-20" : "z-10"}`}
                        style={{ display: "flex" }}
                      >
                        <div
                          data-field-box
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            selectField(field.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              selectField(field.id);
                            }
                          }}
                          className={`relative flex h-full w-full cursor-move flex-col justify-center gap-0.5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${visual.box} ${
                            selected ? "ring-2 ring-black ring-offset-1" : "hover:ring-1 hover:ring-black/40"
                          }`}
                        >
                          <span
                            className={`absolute left-1 top-1 rounded px-1 py-0.5 text-[8px] leading-none tracking-[0.06em] ${visual.badge}`}
                          >
                            {assignee.shortLabel}
                          </span>
                          <span className="mt-2 text-center text-black">
                            {fieldTypeLabel(field.field_type)}
                            {savingFieldId === field.id && (
                              <span className="ml-1 text-neutral-500">…</span>
                            )}
                          </span>
                        </div>
                      </Rnd>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
          <div>
            <h2 className="mb-3 font-serif text-xl text-black">Add field</h2>
            <div className="space-y-2">
              {renderToolbarButton("signature", "Add signature field")}
              {renderToolbarButton("date", "Add date field")}
              {renderToolbarButton("text", "Add text field")}
            </div>
            {activeTool && (
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-neutral-500">
                Click a page to place a {fieldTypeLabel(activeTool).toLowerCase()} field.
                New fields start unassigned. Pick a supplier or client before sending.
              </p>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-serif text-xl text-black">Placed fields</h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                {fields.length}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.08em]">
              <span className="inline-flex items-center gap-1.5 text-neutral-500">
                <span className="inline-block h-2.5 w-2.5 border border-dashed border-neutral-500" />
                Unassigned
              </span>
              <span className="inline-flex items-center gap-1.5 text-brand-pink">
                <span className="inline-block h-2.5 w-2.5 bg-brand-pink" />
                Supplier
              </span>
              <span className="inline-flex items-center gap-1.5 text-neutral-700">
                <span className="inline-block h-2.5 w-2.5 bg-black" />
                Client
              </span>
            </div>

            {fields.length === 0 ? (
              <p className="font-mono text-xs text-neutral-400">No fields placed yet.</p>
            ) : (
              <ul className="space-y-3">
                {pages.map((pageInfo) => {
                  const pageFields = fieldsByPage.get(pageInfo.pageNumber) ?? [];
                  if (pageFields.length === 0) return null;

                  return (
                    <li key={pageInfo.pageNumber}>
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                        Page {pageInfo.pageNumber}
                      </p>
                      <ul className="space-y-2">
                        {pageFields.map((field) => {
                          const assignee = resolveAssigneeOption(field, assigneeOptions);
                          const visual = assigneeVisual(assignee);
                          const highlighted = highlightedFieldId === field.id;

                          return (
                            <li
                              key={field.id}
                              ref={(node) => {
                                fieldCardRefs.current[field.id] = node;
                              }}
                              className={`rounded-md border px-3 py-2 transition-colors ${
                                highlighted
                                  ? "border-brand-pink bg-brand-pink/10 ring-2 ring-brand-pink/40"
                                  : selectedFieldId === field.id
                                    ? "border-black bg-neutral-50"
                                    : "border-neutral-200"
                              }`}
                            >
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => selectField(field.id, false)}
                                  className="text-left"
                                >
                                  <p className="font-mono text-xs text-black">
                                    {fieldTypeLabel(field.field_type)}
                                  </p>
                                  <p className={`mt-0.5 font-mono text-[10px] ${visual.chip}`}>
                                    {assignee.label}
                                  </p>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteField(field.id)}
                                  className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>

                              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                Assigned to
                              </label>
                              <AssigneeSelect
                                value={assigneeValueForField(field)}
                                options={assigneeOptions}
                                disabled={savingFieldId === field.id}
                                onChange={(value) => handleAssigneeChange(field.id, value)}
                              />

                              <label className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-500">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={() => handleToggleRequired(field)}
                                />
                                Required
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <h2 className="mb-2 font-serif text-xl text-black">Signing order</h2>
            <p className="mb-3 font-mono text-[11px] leading-relaxed text-neutral-500">
              Derived from field assignees. Supplier first by default; reorder before sending.
            </p>
            {signers.length === 0 ? (
              <p className="font-mono text-xs text-neutral-400">
                Assign fields to build the signing queue.
              </p>
            ) : (
              <ol className="space-y-2">
                {signers.map((signer, index) => (
                  <li
                    key={signer.id}
                    className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2"
                  >
                    <span className="font-mono text-[11px] text-neutral-400">{index + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs text-black">
                        {signer.display_name ??
                          (signer.role === "admin" ? "Supplier" : "Client")}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-400">
                        {signer.role === "admin" ? "Supplier" : "Client"}
                      </p>
                    </div>
                    {canReorderSigners && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0 || reordering}
                          onClick={() => moveSigner(signer.id, -1)}
                          className="font-mono text-[10px] text-neutral-500 hover:text-black disabled:opacity-30"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === signers.length - 1 || reordering}
                          onClick={() => moveSigner(signer.id, 1)}
                          className="font-mono text-[10px] text-neutral-500 hover:text-black disabled:opacity-30"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {!canReorderSigners && (
              <p className="mt-2 font-mono text-[10px] text-neutral-400">
                Order is locked after the document is sent.
              </p>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <h2 className="mb-2 font-serif text-xl text-black">Copy fields</h2>
            <p className="mb-3 font-mono text-[11px] leading-relaxed text-neutral-500">
              Duplicate a field layout from another PDF. Replaces fields on this document.
            </p>
            <select
              value={copySourceId}
              onChange={(e) => setCopySourceId(e.target.value)}
              className="mb-3 w-full border border-neutral-300 px-3 py-2 font-mono text-xs"
            >
              <option value="">Select a document…</option>
              {copySourceDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCopyFields}
              disabled={!copySourceId || copying}
              className="w-full bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {copying ? "Copying…" : "Copy fields"}
            </button>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            {doneSummary ? (
              <div className="space-y-3 rounded-md border border-green-200 bg-green-50 p-3">
                <p className="font-mono text-xs leading-relaxed text-green-900">{doneSummary}</p>
                <button
                  type="button"
                  onClick={confirmDoneAndLeave}
                  className="w-full bg-black px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
                >
                  Back to documents
                </button>
                <button
                  type="button"
                  onClick={() => setDoneSummary(null)}
                  className="w-full font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-black"
                >
                  Keep editing
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 font-mono text-[11px] leading-relaxed text-neutral-500">
                  Fields auto-save as you place them. When you&apos;re finished, confirm the setup
                  and return to the document list.
                </p>
                <button
                  type="button"
                  onClick={handleFinishEditing}
                  disabled={finishing}
                  className="w-full border border-black bg-white px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white disabled:opacity-40"
                >
                  {finishing ? "Checking…" : "Done: finish editing fields"}
                </button>
              </>
            )}
          </div>

          <p className="font-mono text-[10px] leading-relaxed text-neutral-400">
            Positions saved as page percentages ({PDF_RENDER_WIDTH}px render width).
          </p>
        </div>
      </aside>
    </div>
  );
}
