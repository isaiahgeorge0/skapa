import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import AcceptInviteForm from "@/components/AcceptInviteForm";
import { noindexNofollow } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Accept invite",
  ...noindexNofollow,
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("client_invites")
    .select("id, email, status, expires_at, clients(name)")
    .eq("token", token)
    .single();

  const client = (invite as unknown as { clients: { name: string } | null } | null)?.clients;
  const isValid = invite && invite.status === "pending" && new Date(invite.expires_at) > new Date();

  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="mb-3 font-serif text-2xl text-black">This invite isn&apos;t valid</h1>
          <p className="font-mono text-sm text-neutral-500">
            It may have already been used, revoked, or expired. Ask skapa to send a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-serif text-2xl text-black">
          skapa <span className="italic text-brand-pink">Creative</span>
        </h1>
        <p className="mb-8 font-mono text-sm text-neutral-500">
          Set a password to access {client?.name ?? "your"} project portal as {invite!.email}.
        </p>
        <AcceptInviteForm token={token} email={invite!.email} />
      </div>
    </div>
  );
}
