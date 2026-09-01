import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user!.id)
    .single();
  if (profile?.role !== "admin") redirect("/portal");

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar adminName={profile.full_name} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
