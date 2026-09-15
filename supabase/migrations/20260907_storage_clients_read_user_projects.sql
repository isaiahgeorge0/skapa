-- Fix: secondary project clients (project_clients) could upload signatures
-- via user_project_ids(), but could not createSignedUrl / read PDFs because
-- the SELECT policy only allowed the primary projects.client_id.
-- Supabase returns that denial as HTTP 400 + "Object not found".

drop policy if exists "clients read own documents storage" on storage.objects;

create policy "clients read own documents storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (select user_project_ids())
  );
