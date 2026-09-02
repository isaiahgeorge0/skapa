export type DocumentFieldType = "signature" | "date" | "text";
export type DocumentFieldAssigneeRole = "admin" | "client";
export type DocumentSignerStatus = "pending" | "sent" | "signed";
export type DocumentSignerRole = "admin" | "client";

export type DocumentField = {
  id: string;
  document_id: string;
  field_type: DocumentFieldType;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  assigned_to_role: DocumentFieldAssigneeRole | null;
  assigned_to_client_id: string | null;
};

export type DocumentSigner = {
  id: string;
  document_id: string;
  role: DocumentSignerRole;
  client_id: string | null;
  order_index: number;
  status: DocumentSignerStatus;
  signed_at: string | null;
  notified_at: string | null;
  display_name?: string;
};

export type DocumentFieldValue = {
  id: string;
  document_field_id: string;
  value: string;
  filled_by: string;
  created_at?: string;
};

export type FieldAssigneeOption = {
  value: string;
  label: string;
  role: DocumentFieldAssigneeRole | null;
  clientId: string | null;
  shortLabel: string;
  group: "unassigned" | "supplier" | "clients";
};

export const PDF_RENDER_WIDTH = 800;

export const SUPPLIER_ASSIGNEE_VALUE = "admin";
export const UNASSIGNED_ASSIGNEE_VALUE = "unassigned";

/** Default size as % of page width / height when placing a new field. */
export const DEFAULT_FIELD_SIZE: Record<
  DocumentFieldType,
  { width: number; height: number }
> = {
  signature: { width: 22, height: 5 },
  date: { width: 14, height: 3.5 },
  text: { width: 24, height: 4 },
};

/**
 * Minimum usable size in pixels at PDF_RENDER_WIDTH.
 * Converted to % of the current page when applied to <Rnd>.
 */
export const MIN_FIELD_SIZE_PX: Record<
  DocumentFieldType,
  { width: number; height: number }
> = {
  signature: { width: 120, height: 36 },
  date: { width: 72, height: 24 },
  text: { width: 96, height: 28 },
};

export function pxToPercent(px: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((px / total) * 10000) / 100;
}

export function percentToPx(percent: number, total: number): number {
  return (percent / 100) * total;
}

export function fieldTypeLabel(type: DocumentFieldType): string {
  switch (type) {
    case "signature":
      return "Signature";
    case "date":
      return "Date";
    case "text":
      return "Text";
  }
}

export function buildAssigneeOptions(
  clients: { id: string; name: string }[],
): FieldAssigneeOption[] {
  const unassigned: FieldAssigneeOption = {
    value: UNASSIGNED_ASSIGNEE_VALUE,
    label: "Unassigned",
    role: null,
    clientId: null,
    shortLabel: "Unassigned",
    group: "unassigned",
  };

  const supplier: FieldAssigneeOption = {
    value: SUPPLIER_ASSIGNEE_VALUE,
    label: "Isaiah / Skapa (Supplier)",
    role: "admin",
    clientId: null,
    shortLabel: "Supplier",
    group: "supplier",
  };

  const clientOptions: FieldAssigneeOption[] =
    clients.length === 0
      ? [
          {
            value: "client",
            label: "Client",
            role: "client",
            clientId: null,
            shortLabel: "Client",
            group: "clients",
          },
        ]
      : clients.length === 1
        ? [
            {
              value: "client",
              label: clients[0].name,
              role: "client",
              clientId: null,
              shortLabel: clients[0].name.split(" ")[0] || "Client",
              group: "clients",
            },
          ]
        : clients.map((client) => ({
            value: `client:${client.id}`,
            label: client.name,
            role: "client" as const,
            clientId: client.id,
            shortLabel: client.name.split(" ")[0] || "Client",
            group: "clients" as const,
          }));

  return [unassigned, supplier, ...clientOptions];
}

export function assigneeValueForField(field: DocumentField): string {
  if (!field.assigned_to_role) return UNASSIGNED_ASSIGNEE_VALUE;
  if (field.assigned_to_role === "admin") return SUPPLIER_ASSIGNEE_VALUE;
  if (field.assigned_to_client_id) return `client:${field.assigned_to_client_id}`;
  return "client";
}

export function parseAssigneeValue(
  value: string,
  options: FieldAssigneeOption[],
): { role: DocumentFieldAssigneeRole | null; clientId: string | null } {
  if (value === UNASSIGNED_ASSIGNEE_VALUE || value === "") {
    return { role: null, clientId: null };
  }

  const match = options.find((option) => option.value === value);
  if (match) {
    return { role: match.role, clientId: match.clientId };
  }
  if (value === SUPPLIER_ASSIGNEE_VALUE) {
    return { role: "admin", clientId: null };
  }
  if (value.startsWith("client:")) {
    return { role: "client", clientId: value.slice("client:".length) || null };
  }
  if (value === "client") {
    return { role: "client", clientId: null };
  }
  return { role: null, clientId: null };
}

export function resolveAssigneeOption(
  field: DocumentField,
  options: FieldAssigneeOption[],
): FieldAssigneeOption {
  const value = assigneeValueForField(field);
  const match = options.find((option) => option.value === value);
  if (match) return match;

  if (!field.assigned_to_role) {
    return {
      value: UNASSIGNED_ASSIGNEE_VALUE,
      label: "Unassigned",
      role: null,
      clientId: null,
      shortLabel: "Unassigned",
      group: "unassigned",
    };
  }

  return {
    value,
    label: field.assigned_to_role === "admin" ? "Isaiah / Skapa (Supplier)" : "Client",
    role: field.assigned_to_role,
    clientId: field.assigned_to_client_id,
    shortLabel: field.assigned_to_role === "admin" ? "Supplier" : "Client",
    group: field.assigned_to_role === "admin" ? "supplier" : "clients",
  };
}

export function fieldBelongsToSigner(
  field: DocumentField,
  signer: { role: DocumentSignerRole; client_id: string | null },
  primaryClientId: string | null,
): boolean {
  if (!field.assigned_to_role) return false;
  if (signer.role === "admin") {
    return field.assigned_to_role === "admin";
  }
  if (field.assigned_to_role !== "client") return false;
  if (field.assigned_to_client_id) {
    return field.assigned_to_client_id === signer.client_id;
  }
  return Boolean(signer.client_id) && signer.client_id === primaryClientId;
}

export function signerKey(role: DocumentSignerRole, clientId: string | null): string {
  return role === "admin" ? "admin" : `client:${clientId ?? "primary"}`;
}
