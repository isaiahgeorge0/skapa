"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { acceptClientInvite } from "@/app/actions/client-invites";

export default function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setSubmitting(true);
    setError(null);

    const result = await acceptClientInvite(token, password);
    if (!result.success) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    router.push(signInError ? "/login" : "/portal");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">Confirm password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
      </div>
      {error && <p className="font-mono text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full bg-black py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50">
        {submitting ? "Setting up…" : "Set password & continue"}
      </button>
    </form>
  );
}
