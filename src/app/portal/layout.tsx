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
    ? await (async () => {
        const { data: additionalLinks } = await supabase
          .from("project_clients")
          .select("project_id")
          .eq("client_id", profile.client_id);
        const additionalIds = (additionalLinks ?? []).map((l) => l.project_id);
        const orFilter = additionalIds.length
          ? `client_id.eq.${profile.client_id},id.in.(${additionalIds.join(",")})`
          : `client_id.eq.${profile.client_id}`;

        return supabase
          .from("projects")
          .select("id, name")
          .or(orFilter)
          .order("created_at", { ascending: false });
      })()
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
