"use server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendAccountReadyEmail,
  sendClientPortalInviteEmail,
} from "@/lib/email";

type ActionResult = { success: true } | { success: false; error: string };

export async function sendClientInvite(
  clientId: string,
  email: string,
  clientName: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Only admins can send invites." };
  }

  const token = randomBytes(32).toString("hex");

  const { error: insertError } = await supabase.from("client_invites").insert({
    client_id: clientId,
    email: email.trim().toLowerCase(),
    token,
    invited_by: user!.id,
  });

  if (insertError) {
    console.error("Failed to create invite:", insertError);
    return { success: false, error: "Failed to create the invite." };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;

  const emailResult = await sendClientPortalInviteEmail({
    to: email.trim(),
    clientName,
    projectName: project?.name ?? "your project",
    inviteUrl,
  });

  if (!emailResult.success) {
    // The invite record still exists even if the email failed — worth
    // surfacing this distinctly so the admin knows to resend rather than
    // assuming it went out.
    return {
      success: false,
      error: "Invite created, but the email failed to send. Try resending it.",
    };
  }

  return { success: true };
}

export async function revokeClientInvite(inviteId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("client_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function revokeClientAccess(profileId: string): Promise<ActionResult> {
  const supabase = await createClient();
  // Cuts off portal access without deleting the person's account entirely —
  // unlinking client_id means RLS no longer resolves any projects for them.
  const { error } = await supabase
    .from("profiles")
    .update({ client_id: null })
    .eq("id", profileId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function acceptClientInvite(
  token: string,
  password: string,
): Promise<ActionResult> {
  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("client_invites")
    .select("id, client_id, email, status, expires_at")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return { success: false, error: "This invite link isn't valid." };
  }

  if (invite.status !== "pending") {
    return { success: false, error: "This invite has already been used or revoked." };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { success: false, error: "This invite has expired. Ask for a new one." };
  }

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
  });

  if (createError || !newUser.user) {
    console.error("Failed to create user from invite:", createError);
    return {
      success: false,
      error: createError?.message ?? "Failed to create your account.",
    };
  }

  // handle_new_user's trigger already created a basic profile row (role:
  // client, no client_id yet) — link it to the invited client now.
  const { error: linkError } = await admin
    .from("profiles")
    .update({ client_id: invite.client_id })
    .eq("id", newUser.user.id);

  if (linkError) {
    console.error("Account created but failed to link client:", linkError);
    return { success: false, error: "Account created, but setup didn't finish. Contact skapa." };
  }

  await admin
    .from("client_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  const { data: client } = await admin
    .from("clients")
    .select("name")
    .eq("id", invite.client_id)
    .maybeSingle();

  const accountReady = await sendAccountReadyEmail({
    to: invite.email,
    clientName: client?.name ?? "there",
  });

  if (!accountReady.success) {
    // Account is live — don't fail setup if the follow-up email misses.
    console.error("Account ready email failed after invite accept:", accountReady.error);
  }

  return { success: true };
}
