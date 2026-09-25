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

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const inviteEmail = invite.email.trim().toLowerCase();

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: inviteEmail,
    password,
    email_confirm: true,
  });

  let userId = newUser?.user?.id ?? null;

  if (createError || !userId) {
    if (!isEmailTakenError(createError)) {
      console.error("Failed to create user from invite:", createError);
      return {
        success: false,
        error: createError?.message ?? "Failed to create your account.",
      };
    }

    // Account already exists (e.g. access was revoked earlier — profile stayed,
    // client_id was cleared). Complete acceptance against that user instead of
    // stopping at "already registered".
    const existing = await findAuthUserByEmail(admin, inviteEmail);
    if (!existing) {
      return {
        success: false,
        error:
          "An account with this email already exists, but we couldn't finish linking it. Contact skapa.",
      };
    }

    const { data: existingProfile, error: profileLoadError } = await admin
      .from("profiles")
      .select("id, client_id, role")
      .eq("id", existing.id)
      .maybeSingle();

    if (profileLoadError) {
      console.error("Failed to load existing profile for invite accept:", profileLoadError);
      return { success: false, error: "Couldn't finish linking your account. Contact skapa." };
    }

    if (existingProfile?.role === "admin") {
      return {
        success: false,
        error: "This email belongs to a studio account and can't accept a client invite.",
      };
    }

    if (
      existingProfile?.client_id &&
      existingProfile.client_id !== invite.client_id
    ) {
      return {
        success: false,
        error:
          "This email is already linked to a different client. Contact skapa if you need access moved.",
      };
    }

    const { error: passwordError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });

    if (passwordError) {
      console.error("Failed to update password for existing invite user:", passwordError);
      return {
        success: false,
        error: "Couldn't update your password. Try logging in with your existing password, or contact skapa.",
      };
    }

    userId = existing.id;
  }

  // New users get a profile from handle_new_user (role: client, no client_id).
  // Existing revoked users already have a profile with client_id null.
  const { error: linkError } = await admin
    .from("profiles")
    .update({ client_id: invite.client_id })
    .eq("id", userId);

  if (linkError) {
    console.error("Account ready but failed to link client:", linkError);
    return { success: false, error: "Account created, but setup didn't finish. Contact skapa." };
  }

  const acceptedAt = new Date().toISOString();
  const { error: acceptError } = await admin
    .from("client_invites")
    .update({ status: "accepted", accepted_at: acceptedAt })
    .eq("id", invite.id)
    .eq("status", "pending");

  if (acceptError) {
    console.error("Failed to mark invite accepted:", acceptError);
    return {
      success: false,
      error: "Account linked, but the invite didn't finish updating. Contact skapa.",
    };
  }

  const { data: client } = await admin
    .from("clients")
    .select("name")
    .eq("id", invite.client_id)
    .maybeSingle();

  const accountReady = await sendAccountReadyEmail({
    to: inviteEmail,
    clientName: client?.name ?? "there",
  });

  if (!accountReady.success) {
    // Account is live — don't fail setup if the follow-up email misses.
    console.error("Account ready email failed after invite accept:", accountReady.error);
  }

  return { success: true };
}

function isEmailTakenError(error: { message?: string; status?: number } | null | undefined): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("user already exists") ||
    message.includes("email address has already") ||
    message.includes("duplicate") ||
    error.status === 422
  );
}

async function findAuthUserByEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  email: string,
): Promise<{ id: string; email?: string } | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error("Failed to list users while accepting invite:", error);
      return null;
    }

    const users = data?.users ?? [];
    const match = users.find(
      (user: { id: string; email?: string | null }) =>
        (user.email ?? "").trim().toLowerCase() === normalized,
    );
    if (match) return match;

    const total = typeof data?.total === "number" ? data.total : users.length;
    if (users.length === 0 || page * 200 >= total) return null;
    page += 1;
  }
}
