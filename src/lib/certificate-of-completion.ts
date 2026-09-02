import { createHash } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createAdminClient } from "@/lib/supabase/admin";
import { fieldTypeLabel, type DocumentFieldType } from "@/lib/documents";

export function certificateStoragePath(projectId: string, documentId: string): string {
  return `${projectId}/certificates/${documentId}-certificate.pdf`;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function formatTs(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }) + " UTC";
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

type CertificateInput = {
  documentName: string;
  projectName: string;
  documentHash: string;
  completedAt: string;
  signers: {
    name: string;
    roleLabel: string;
    email: string;
    ip: string;
    userAgent: string;
    signedAt: string | null;
  }[];
  fields: {
    signerName: string;
    fieldType: DocumentFieldType;
    pageNumber: number;
    valueText: string | null;
    signatureBytes: Uint8Array | null;
  }[];
  events: {
    eventType: string;
    actorRole: string | null;
    detail: string | null;
    createdAt: string;
  }[];
};

export async function buildCertificatePdf(input: CertificateInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const drawLine = (text: string, size = 10, bold = false, color = rgb(0.1, 0.1, 0.1)) => {
    const usedFont = bold ? fontBold : font;
    for (const line of wrapText(text, 92)) {
      ensureSpace(size + 4);
      page.drawText(line, {
        x: margin,
        y: y - size,
        size,
        font: usedFont,
        color,
      });
      y -= size + 4;
    }
  };

  const section = (title: string) => {
    y -= 10;
    ensureSpace(28);
    page.drawText(title, {
      x: margin,
      y: y - 12,
      size: 12,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 12;
  };

  drawLine("CERTIFICATE OF COMPLETION", 16, true);
  drawLine("skapa Creative — electronic signature record", 9, false, rgb(0.35, 0.35, 0.35));
  y -= 6;
  drawLine(`Document: ${input.documentName}`);
  drawLine(`Project: ${input.projectName}`);
  drawLine(`Completed: ${formatTs(input.completedAt)}`);
  drawLine(`Source file SHA-256: ${input.documentHash}`, 8);
  drawLine(
    "This certificate summarises the audit trail for the signed document. The original file bytes were not modified after signing.",
    8,
    false,
    rgb(0.35, 0.35, 0.35),
  );

  section("Signers");
  for (const [index, signer] of input.signers.entries()) {
    drawLine(`${index + 1}. ${signer.name} (${signer.roleLabel})`, 10, true);
    drawLine(`   Email: ${signer.email}`);
    drawLine(`   Signed at: ${formatTs(signer.signedAt)}`);
    drawLine(`   IP address: ${signer.ip}`);
    for (const line of wrapText(`User agent: ${signer.userAgent}`, 88)) {
      drawLine(`   ${line}`, 8, false, rgb(0.25, 0.25, 0.25));
    }
    y -= 4;
  }

  section("Completed fields");
  if (input.fields.length === 0) {
    drawLine("No field values recorded.");
  }
  for (const field of input.fields) {
    drawLine(
      `${fieldTypeLabel(field.fieldType)} · Page ${field.pageNumber} · ${field.signerName}`,
      10,
      true,
    );
        if (field.signatureBytes) {
      try {
        let image;
        try {
          image = await pdf.embedPng(field.signatureBytes);
        } catch {
          image = await pdf.embedJpg(field.signatureBytes);
        }
        const maxW = 160;
        const maxH = 48;
        const scale = Math.min(maxW / image.width, maxH / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        ensureSpace(h + 16);
        page.drawImage(image, {
          x: margin + 8,
          y: y - h,
          width: w,
          height: h,
        });
        y -= h + 10;
      } catch {
        drawLine("   [Signature image could not be embedded]");
      }
    } else {
      drawLine(`   Value: ${field.valueText || "—"}`);
    }
    y -= 2;
  }

  section("Event log");
  for (const event of input.events) {
    const role = event.actorRole ? ` [${event.actorRole}]` : "";
    drawLine(`${formatTs(event.createdAt)} — ${event.eventType}${role}`, 9, true);
    if (event.detail) {
      for (const line of wrapText(event.detail, 90)) {
        drawLine(`   ${line}`, 8, false, rgb(0.3, 0.3, 0.3));
      }
    }
  }

  y -= 16;
  ensureSpace(40);
  drawLine(
    "End of certificate. This record is generated once when signing completes and is stored separately from the source document.",
    8,
    false,
    rgb(0.4, 0.4, 0.4),
  );

  return pdf.save();
}

/**
 * Generate and store the Certificate of Completion once.
 * Safe to call multiple times — existing object is left alone.
 */
export async function generateAndStoreCertificate(
  documentId: string,
): Promise<{ success: true; path: string } | { success: false; error: string }> {
  const admin = createAdminClient();

  const { data: document, error: docError } = await admin
    .from("documents")
    .select("id, type, file_url, project_id, status, signature_hash, signed_at, projects(name)")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    return { success: false, error: "Document not found." };
  }

  if (document.status !== "signed") {
    return { success: false, error: "Certificate is only available for signed documents." };
  }

  const path = certificateStoragePath(document.project_id, documentId);

  // Idempotent: never regenerate if the PDF already exists in storage.
  const { data: existingFile } = await admin.storage
    .from("documents")
    .list(`${document.project_id}/certificates`, {
      search: `${documentId}-certificate`,
    });
  if (existingFile?.some((file) => file.name === `${documentId}-certificate.pdf`)) {
    await admin.from("documents").update({ certificate_url: path }).eq("id", documentId);
    return { success: true, path };
  }

  const { data: fileBlob, error: downloadError } = await admin.storage
    .from("documents")
    .download(document.file_url);

  if (downloadError || !fileBlob) {
    return { success: false, error: "Could not download source document for hashing." };
  }

  const sourceBytes = new Uint8Array(await fileBlob.arrayBuffer());
  const documentHash = document.signature_hash || sha256Hex(sourceBytes);

  if (!document.signature_hash) {
    await admin
      .from("documents")
      .update({ signature_hash: documentHash })
      .eq("id", documentId);
  }

  const projectData = document.projects as { name: string } | { name: string }[] | null;
  const projectName = Array.isArray(projectData)
    ? projectData[0]?.name
    : projectData?.name;

  const { data: signers } = await admin
    .from("document_signers")
    .select("*")
    .eq("document_id", documentId)
    .order("order_index", { ascending: true });

  const clientIds = (signers ?? [])
    .map((signer) => signer.client_id as string | null)
    .filter((id): id is string => Boolean(id));

  const { data: clients } =
    clientIds.length > 0
      ? await admin.from("clients").select("id, name, email").in("id", clientIds)
      : { data: [] as { id: string; name: string; email: string | null }[] };

  const clientById = new Map((clients ?? []).map((client) => [client.id, client]));

  const certificateSigners = (signers ?? [])
    .filter((signer) => signer.status === "signed")
    .map((signer) => {
      const signerIp = (signer.signer_ip as string | null | undefined) ?? null;
      const signerUa = (signer.signer_user_agent as string | null | undefined) ?? null;

      if (signer.role === "admin") {
        return {
          name: "Isaiah / Skapa (Supplier)",
          roleLabel: "Supplier",
          email: "hello@skapa.uk",
          // Always from this signer's own row — never documents.signer_ip.
          ip: signerIp || "—",
          userAgent: signerUa || "—",
          signedAt: signer.signed_at as string | null,
        };
      }
      const client = signer.client_id ? clientById.get(signer.client_id) : null;
      return {
        name: client?.name ?? "Client",
        roleLabel: "Client",
        email: client?.email ?? "—",
        ip: signerIp || "—",
        userAgent: signerUa || "—",
        signedAt: signer.signed_at as string | null,
      };
    });

  const { data: fields } = await admin
    .from("document_fields")
    .select("id, field_type, page_number, assigned_to_role, assigned_to_client_id")
    .eq("document_id", documentId)
    .order("page_number", { ascending: true });

  const fieldIds = (fields ?? []).map((field) => field.id as string);
  const { data: values } =
    fieldIds.length > 0
      ? await admin
          .from("document_field_values")
          .select("document_field_id, value, filled_by")
          .in("document_field_id", fieldIds)
      : { data: [] as { document_field_id: string; value: string; filled_by: string }[] };

  const valueByField = new Map(
    (values ?? []).map((value) => [value.document_field_id, value]),
  );

  const certificateFields: CertificateInput["fields"] = [];
  for (const field of fields ?? []) {
    const value = valueByField.get(field.id);
    if (!value) continue;

    let signerName = "Unknown";
    if (field.assigned_to_role === "admin") {
      signerName = "Isaiah / Skapa (Supplier)";
    } else if (field.assigned_to_client_id) {
      signerName = clientById.get(field.assigned_to_client_id)?.name ?? "Client";
    } else {
      signerName = "Client";
    }

    let signatureBytes: Uint8Array | null = null;
    let valueText: string | null = value.value;
    if (field.field_type === "signature") {
      valueText = null;
      const { data: sigBlob } = await admin.storage.from("documents").download(value.value);
      if (sigBlob) {
        signatureBytes = new Uint8Array(await sigBlob.arrayBuffer());
      }
    }

    certificateFields.push({
      signerName,
      fieldType: field.field_type as DocumentFieldType,
      pageNumber: field.page_number as number,
      valueText,
      signatureBytes,
    });
  }

  const { data: events } = await admin
    .from("document_events")
    .select("event_type, actor_role, detail, created_at")
    .eq("document_id", documentId)
    .order("created_at", { ascending: true });

  const pdfBytes = await buildCertificatePdf({
    documentName: String(document.type),
    projectName: projectName ?? "Project",
    documentHash,
    completedAt: (document.signed_at as string) || new Date().toISOString(),
    signers: certificateSigners,
    fields: certificateFields,
    events: (events ?? []).map((event) => ({
      eventType: String(event.event_type),
      actorRole: (event.actor_role as string | null) ?? null,
      detail: (event.detail as string | null) ?? null,
      createdAt: String(event.created_at),
    })),
  });

  const { error: uploadError } = await admin.storage.from("documents").upload(path, pdfBytes, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (uploadError) {
    // If a concurrent request already uploaded, treat as success.
    if (/already exists|Duplicate|409/i.test(uploadError.message)) {
      await admin.from("documents").update({ certificate_url: path }).eq("id", documentId);
      return { success: true, path };
    }
    console.error("Certificate upload failed:", uploadError);
    return { success: false, error: uploadError.message };
  }

  await admin.from("documents").update({ certificate_url: path }).eq("id", documentId);

  await admin.from("document_events").insert({
    document_id: documentId,
    event_type: "status_changed",
    actor_role: "admin",
    detail: "Certificate of Completion generated",
  });

  return { success: true, path };
}
