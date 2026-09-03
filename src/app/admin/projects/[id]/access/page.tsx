import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ClientAccessPanel from "@/components/ClientAccessPanel";

type ClientRef = { id: string; name: string; email: string | null };

export default async function ProjectAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("client_id, clients!client_id(id, name, email)")
    .eq("id", id)
    .single();

  if (!project) return null;

  const { data: additionalRows } = await supabase
    .from("project_clients")
    .select("clients(id, name, email)")
    .eq("project_id", id);

  const primary = (
    project as unknown as { clients: ClientRef | null }
  ).clients;

  const additional = (additionalRows ?? []).flatMap((row) => {
    const linked = row.clients as ClientRef | ClientRef[] | null;
    if (!linked) return [];
    return Array.isArray(linked) ? linked : [linked];
  });

  const clients: ClientRef[] = [...(primary ? [primary] : []), ...additional];
  const clientIds = clients.map((c) => c.id);

  if (clientIds.length === 0) {
    return <ClientAccessPanel initialAccess={[]} />;
  }

  const [{ data: invites }, { data: profiles }] = await Promise.all([
    supabase
      .from("client_invites")
      .select("id, client_id, email, created_at, expires_at")
      .in("client_id", clientIds)
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id, client_id, created_at")
      .in("client_id", clientIds)
      .not("client_id", "is", null),
  ]);

  const profileIds = (profiles ?? []).map((p) => p.id);
  const emailByProfileId: Record<string, string> = {};

  if (profileIds.length > 0) {
    const admin = createAdminClient();
    const { data: usersData } = await admin.auth.admin.listUsers();
    for (const user of usersData?.users ?? []) {
      if (profileIds.includes(user.id) && user.email) {
        emailByProfileId[user.id] = user.email;
      }
    }
  }

  const initialAccess = clients.map((client) => ({
    clientId: client.id,
    clientName: client.name,
    clientEmail: client.email,
    entries: [
      ...(profiles ?? [])
        .filter((p) => p.client_id === client.id)
        .map((p) => ({
          kind: "active" as const,
          profileId: p.id,
          email: emailByProfileId[p.id] ?? client.email ?? "Unknown",
          joinedAt: p.created_at,
        })),
      ...(invites ?? [])
        .filter((i) => i.client_id === client.id)
        .map((i) => ({
          kind: "pending" as const,
          inviteId: i.id,
          email: i.email,
          sentAt: i.created_at,
          expiresAt: i.expires_at,
        })),
    ],
  }));

  return <ClientAccessPanel initialAccess={initialAccess} />;
}
