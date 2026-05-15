-- ECE Echo Feedback & Satisfaction Command System
-- Run in Supabase SQL editor before deploying production environment variables.

create extension if not exists "pgcrypto";

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null unique default 'ECE-' || upper(substr(gen_random_uuid()::text, 1, 8)),
  feedback_type text not null check (feedback_type in ('workplace','service','visitor','applicant','account')),
  full_name text,
  email text,
  is_anonymous boolean default false,
  site text not null check (site in ('Noel','Macias','Consuelo')),
  floor text,
  account text,
  department text,
  service_type text,
  staff_involved text,
  visit_purpose text,
  person_visited text,
  position_applied text,
  recruitment_stage text,
  operational_concern text,
  rating smallint not null check (rating between 1 and 5),
  sentiment text not null check (sentiment in ('very_positive','positive','neutral','negative','very_negative')),
  category text not null,
  message text not null check (char_length(message) <= 500),
  attachment_url text,
  attachment_name text,
  attachment_type text,
  status text not null default 'new' check (status in ('new','reviewed','in_progress','resolved','archived')),
  admin_notes text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_attachments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  url text not null,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  file_size integer not null check (file_size <= 5242880),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_feedback_created_at on public.feedback(created_at desc);
create index if not exists idx_feedback_type on public.feedback(feedback_type);
create index if not exists idx_feedback_site on public.feedback(site);
create index if not exists idx_feedback_account on public.feedback(account);
create index if not exists idx_feedback_rating on public.feedback(rating);
create index if not exists idx_feedback_sentiment on public.feedback(sentiment);
create index if not exists idx_feedback_status on public.feedback(status);
create index if not exists idx_feedback_attachments_feedback_id on public.feedback_attachments(feedback_id);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_feedback_updated_at on public.feedback;
create trigger trg_feedback_updated_at
  before update on public.feedback
  for each row execute function public.update_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.feedback enable row level security;
alter table public.feedback_attachments enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "anon_insert" on public.feedback;
create policy "anon_insert"
on public.feedback for insert
to anon, authenticated
with check (true);

drop policy if exists "service_all" on public.feedback;
create policy "service_all"
on public.feedback for all
to service_role
using (true)
with check (true);

-- Needed while this remains a static Vite app with Supabase Auth.
-- Remove these admin policies once all admin reads/updates move behind server-only API routes.
drop policy if exists "admin_read_feedback" on public.feedback;
create policy "admin_read_feedback"
on public.feedback for select
to authenticated
using (public.is_admin());

drop policy if exists "admin_update_feedback" on public.feedback;
create policy "admin_update_feedback"
on public.feedback for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "anon_insert_attachments" on public.feedback_attachments;
create policy "anon_insert_attachments"
on public.feedback_attachments for insert
to anon, authenticated
with check (true);

drop policy if exists "admin_read_attachments" on public.feedback_attachments;
create policy "admin_read_attachments"
on public.feedback_attachments for select
to authenticated
using (public.is_admin());

drop policy if exists "service_all_attachments" on public.feedback_attachments;
create policy "service_all_attachments"
on public.feedback_attachments for all
to service_role
using (true)
with check (true);

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin() or id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback-attachments', 'feedback-attachments', true, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload feedback attachments" on storage.objects;
create policy "Anyone can upload feedback attachments"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'feedback-attachments');

drop policy if exists "Anyone can read feedback attachments" on storage.objects;
create policy "Anyone can read feedback attachments"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'feedback-attachments');
