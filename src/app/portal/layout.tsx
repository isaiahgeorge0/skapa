import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalSidebar from "@/components/PortalSidebar";
import PortalScrollToTop from "@/components/PortalScrollToTop";
import PortalAccentVars from "@/components/PortalAccentVars";
import { noindexNofollow } from "@/lib/seo";
import { getClientAccentColor, portalAccentStyle } from "@/lib/portal-accent";

export const metadata: Metadata = noindexNofollow;

/** Always read a fresh accent_color — never serve a stale portal shell. */
export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, client_id")
    .eq("id", user!.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");

  const { data: projects } = profile?.client_id
    ? await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false })
    : { data: [] as { id: string; name: string }[] };

  const accent = await getClientAccentColor(profile?.client_id);

  return (
    <div
      className="flex min-h-screen flex-col bg-white md:flex-row"
      style={portalAccentStyle(accent)}
    >
      <PortalAccentVars accent={accent} />
      <PortalScrollToTop />
      <PortalSidebar
        clientName={profile?.full_name || user!.email || "Account"}
        projects={projects ?? []}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
