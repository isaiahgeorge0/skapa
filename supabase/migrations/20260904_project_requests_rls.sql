-- Client project requests (portal ↔ admin)
-- Table already exists in production; this migration documents expected RLS.

alter table public.project_requests enable row level security;

-- Clients: read/create their own requests on projects they can access
drop policy if exists "Clients can view own project requests" on public.project_requests;
create policy "Clients can view own project requests"
  on public.project_requests
  for select
  to authenticated
  using (
    client_id = (select client_id from public.profiles where id = auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Clients can insert own project requests" on public.project_requests;
create policy "Clients can insert own project requests"
  on public.project_requests
  for insert
  to authenticated
  with check (
    client_id = (select client_id from public.profiles where id = auth.uid())
    and (
      exists (
        select 1 from public.projects pr
        where pr.id = project_id
          and pr.client_id = (select client_id from public.profiles where id = auth.uid())
      )
      or exists (
        select 1 from public.project_clients pc
        where pc.project_id = project_requests.project_id
          and pc.client_id = (select client_id from public.profiles where id = auth.uid())
      )
    )
  );

drop policy if exists "Admins can update project requests" on public.project_requests;
create policy "Admins can update project requests"
  on public.project_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
