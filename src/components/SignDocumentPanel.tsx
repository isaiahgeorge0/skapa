"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signDocument } from "@/app/actions/sign-document";

type Doc = {
  id: string;
  type: string;
  file_url: string;
  status: string;
};

async function hashFile(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SignDocumentPanel({ doc, onSigned }: { doc: Doc; onSigned: () => void }) {
  const [supabase] = useState(() => createClient());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function viewDocument() {
    const { data, error: signError } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_url, 300);
    if (signError || !data) {
      setError("Couldn't load the document. Try again.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleSign() {
    if (!name.trim() || !agreed) return;
    setSubmitting(true);
    setError(null);

    // Hash the exact file being signed, computed from the actual bytes —
    // this is what lets you later prove nothing changed after signing.
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(doc.file_url);

    if (downloadError || !fileData) {
      setSubmitting(false);
      setError("Couldn't verify the document for signing. Try again.");
      return;
    }

    const fileHash = await hashFile(fileData);
    const result = await signDocument(doc.id, name, fileHash);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    onSigned();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
      >
        Review &amp; sign
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      <p className="mb-4 font-mono text-sm text-neutral-700">
        Please review the document before signing.
      </p>
      <button
        onClick={viewDocument}
        className="mb-5 font-mono text-[11px] uppercase tracking-[0.08em] text-brand-pink underline hover:no-underline"
      >
        Open document to review →
      </button>

      <div className="mb-4">
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          Type your full name to sign
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full legal name"
          className="w-full border border-neutral-300 bg-white px-3 py-2 font-serif text-lg text-black"
        />
      </div>

      <label className="mb-5 flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          I have read this document and agree to be legally bound by its terms.
        </span>
      </label>

      {error && <p className="mb-4 font-mono text-xs text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSign}
          disabled={!name.trim() || !agreed || submitting}
          className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {submitting ? "Signing…" : "Sign document"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
