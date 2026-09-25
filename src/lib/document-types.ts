/** Document type helpers — stored values stay lowercase; UI uses labels. */

export type DocumentType =
  | "proposal"
  | "agreement"
  | "welcome"
  | "invoice"
  | "other";

export const DOCUMENT_TYPES: DocumentType[] = [
  "proposal",
  "agreement",
  "welcome",
  "invoice",
  "other",
];

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  proposal: "Proposal",
  agreement: "Agreement",
  welcome: "Welcome",
  invoice: "Invoice",
  other: "Other",
};

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as string[]).includes(value);
}

export function documentTypeLabel(type: string | null | undefined): string {
  if (!type) return "Document";
  if (isDocumentType(type)) return DOCUMENT_TYPE_LABELS[type];
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Default for the upload form — agreement assumes signing; everything else is share-only. */
export function defaultRequiresSignature(type: DocumentType): boolean {
  return type === "agreement";
}

/** Safe default when the type string may be unknown/invalid. */
export function requiresSignatureDefaultForType(type: string): boolean {
  return isDocumentType(type) ? defaultRequiresSignature(type) : false;
}
