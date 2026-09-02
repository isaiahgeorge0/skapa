"use client";

import { useState } from "react";
import { updateClientAccentColor } from "@/app/actions/client-accent";
import {
  DEFAULT_CLIENT_ACCENT,
  hasPoorContrastOnWhite,
  isValidHexColor,
  normalizeHexColor,
} from "@/lib/brand";

export default function ClientAccentColorEditor({
  clientId,
  initialAccentColor,
}: {
  clientId: string;
  initialAccentColor: string | null;
}) {
  const [value, setValue] = useState(initialAccentColor ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [persisted, setPersisted] = useState<string | null>(initialAccentColor);

  const trimmed = value.trim();
  const valid = trimmed === "" || isValidHexColor(trimmed);
  const preview = normalizeHexColor(trimmed) ?? DEFAULT_CLIENT_ACCENT;
  const usingFallback = trimmed === "";
  const poorContrast = valid && !usingFallback && hasPoorContrastOnWhite(trimmed);

  async function save() {
    if (!valid) {
      setError("Enter a valid hex colour (e.g. #FF2791) or leave blank for the default.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateClientAccentColor(
      clientId,
      trimmed === "" ? null : trimmed,
    );

    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }

    setPersisted(result.accentColor);
    setValue(result.accentColor ?? "");
    setSaved(true);
  }

  return (
    <div className="border-t border-neutral-200 pt-6">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
        Portal accent
      </p>
      <p className="mb-4 max-w-md text-sm text-neutral-500">
        Used in this client&apos;s portal for CTAs and section markers. Leave blank to
        use skapa pink ({DEFAULT_CLIENT_ACCENT}).
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: preview }}
          title={usingFallback ? `Default ${DEFAULT_CLIENT_ACCENT}` : preview}
        />
        <input
          type="color"
          value={preview}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            setSaved(false);
          }}
          className="h-9 w-12 cursor-pointer border border-neutral-300 bg-white p-1"
          aria-label="Pick accent colour"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder={DEFAULT_CLIENT_ACCENT}
          spellCheck={false}
          className={`w-36 border px-3 py-2 font-mono text-sm ${
            valid ? "border-neutral-300" : "border-red-400"
          }`}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !valid}
          className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save accent"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setSaved(false);
            }}
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>

      {!valid && (
        <p className="mt-3 font-mono text-xs text-red-600">
          Use a hex value like #FF2791 or #F29.
        </p>
      )}
      {poorContrast && (
        <p className="mt-3 font-mono text-xs text-amber-700">
          Low contrast against white — this may be hard to read on portal CTAs and
          markers. You can still save it.
        </p>
      )}
      {error && <p className="mt-3 font-mono text-xs text-red-600">{error}</p>}
      {saved && !error && (
        <p className="mt-3 font-mono text-xs text-neutral-500">
          Accent saved
          {persisted ? ` (${persisted})` : " (using default)"}. Portal will pick this
          up on reload.
        </p>
      )}
    </div>
  );
}
