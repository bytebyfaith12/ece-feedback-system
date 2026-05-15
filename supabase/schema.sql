-- ECE Echo Feedback & Satisfaction Command System
-- Run this in the Supabase SQL editor before setting Vercel environment variables.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null unique,
  feedback_type text not null check (feedback_type in ('workplace', 'service', 'visitor', 'applicant', 'account')),
  full_name text not null,
  email text,
  is_anonymous boolean not null default false,
  site text not null check (site in ('Noel', 'Macias', 'Consuelo')),
  floor text,
  account text,
  department text,
  service_type text,
  visit_purpose text,
  person_visited text,
  position_applied text,
  recruitment_stage text,
  operational_concern text,
  rating integer not null check (rating between 1 and 5),
  sentiment text not null check (sentiment in ('Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive')),
  category text not null,
  message text not null check (char_length(message) <= 500),
  attachment_url text,
  attachment_name text,
  attachment_type text,
  status text not null default 'New' check (status in ('New', 'Reviewed', 'In Progress', 'Resolved', 'Archived')),
  admin_notes text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_submissions_created_at_idx on public.feedback_submissions(created_at desc);
create index if not exists feedback_submissions_feedback_type_idx on public.feedback_submissions(feedback_type);
create index if not exists feedback_submissions_site_idx on public.feedback_submissions(site);
create index if not exists feedback_submissions_account_idx on public.feedback_submissions(account);
create index if not exists feedback_submissions_rating_idx on public.feedback_submissions(rating);
create index if not exists feedback_submissions_sentiment_idx on public.feedback_submissions(sentiment);
create index if not exists feedback_submissions_status_idx on public.feedback_submissions(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_feedback_submissions_updated_at on public.feedback_submissions;
create trigger set_feedback_submissions_updated_at
before update on public.feedback_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.feedback_submissions enable row level security;

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin() or id = auth.uid());

drop policy if exists "Admins can manage feedback" on public.feedback_submissions;
create policy "Admins can manage feedback"
on public.feedback_submissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone can submit feedback" on public.feedback_submissions;
create policy "Anyone can submit feedback"
on public.feedback_submissions for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and site in ('Noel', 'Macias', 'Consuelo')
  and feedback_type in ('workplace', 'service', 'visitor', 'applicant', 'account')
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback-attachments', 'feedback-attachments', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif','application/pdf'])
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
