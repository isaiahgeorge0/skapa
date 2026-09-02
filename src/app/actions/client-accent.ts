"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeHexColor } from "@/lib/brand";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Unauthorized" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, user: null, error: "Unauthorized" as const };
  }

  return { supabase, user, error: null };
}

export async function updateClientAccentColor(
  clientId: string,
  accentColor: string | null,
): Promise<{ success: true; accentColor: string | null } | { success: false; error: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError || !supabase) {
    return { success: false, error: authError ?? "Unauthorized" };
  }

  const trimmed = (accentColor ?? "").trim();
  let next: string | null = null;

  if (trimmed !== "") {
    next = normalizeHexColor(trimmed);
    if (!next) {
      return {
        success: false,
        error: "Enter a valid hex colour (e.g. #FF2791) or leave blank for the default.",
      };
    }
  }

  const { data, error } = await supabase
    .from("clients")
    .update({ accent_color: next })
    .eq("id", clientId)
    .select("accent_color")
    .single();

  if (error) {
    console.error("Failed to update accent_color:", error);
    return { success: false, error: error.message };
  }

  // Portal layout + project pages read this value — bust any cached RSC payload.
  revalidatePath("/portal", "layout");
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);

  return { success: true, accentColor: data.accent_color as string | null };
}
