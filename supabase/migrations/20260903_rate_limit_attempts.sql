-- Rate-limit attempts for public form submissions (service-role only).
-- Apply in the Supabase SQL editor if migrations are not run via CLI.

create table if not exists public.rate_limit_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  endpoint text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_attempts_ip_endpoint_created_at_idx
  on public.rate_limit_attempts (ip_address, endpoint, created_at desc);

alter table public.rate_limit_attempts enable row level security;

-- No policies: anon/authenticated cannot read or write. Service role bypasses RLS.
