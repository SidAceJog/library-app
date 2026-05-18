-- Society Library Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users/Residents table (extends Supabase auth.users)
create table public.residents (
  id uuid references auth.users(id) on delete cascade primary key,
  flat_number text not null unique,
  name text not null default '',
  whatsapp_number text not null default '',
  email text not null default '',
  role text not null default 'resident' check (role in ('resident', 'admin')),
  must_change_password boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- App settings (admin-configurable)
create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Insert default settings
insert into public.app_settings (key, value) values
  ('max_books_per_resident', '1'),
  ('default_due_weeks', '2');

-- Book catalog (built organically via checkouts)
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  isbn text not null unique,
  title text not null default 'Unknown Title',
  author text not null default 'Unknown Author',
  cover_url text,
  added_at timestamptz not null default now()
);

-- Borrowing records
create table public.borrowings (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid not null references public.books(id),
  resident_id uuid not null references public.residents(id),
  borrowed_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  checked_out_by uuid references public.residents(id),
  checked_in_by uuid references public.residents(id)
);

-- Volunteer requests
create table public.volunteer_requests (
  id uuid default uuid_generate_v4() primary key,
  resident_id uuid not null references public.residents(id),
  requested_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  approved_by uuid references public.residents(id),
  created_at timestamptz not null default now()
);

-- Temporary admin access (granted to volunteers for a day)
create table public.temp_admin_access (
  id uuid default uuid_generate_v4() primary key,
  resident_id uuid not null references public.residents(id),
  granted_date date not null,
  expires_at timestamptz not null,
  granted_by uuid references public.residents(id),
  created_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.residents enable row level security;
alter table public.books enable row level security;
alter table public.borrowings enable row level security;
alter table public.volunteer_requests enable row level security;
alter table public.temp_admin_access enable row level security;
alter table public.app_settings enable row level security;

-- Helper function: check if user is admin (permanent or temp)
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.residents where id = user_id and role = 'admin'
  ) or exists (
    select 1 from public.temp_admin_access
    where resident_id = user_id
      and granted_date = current_date
      and expires_at > now()
  );
end;
$$ language plpgsql security definer;

-- Residents policies
create policy "Users can view own profile" on public.residents
  for select using (auth.uid() = id);

create policy "Admins can view all residents" on public.residents
  for select using (public.is_admin(auth.uid()));

create policy "Admins can update residents" on public.residents
  for update using (public.is_admin(auth.uid()));

create policy "Users can update own profile" on public.residents
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Books policies (everyone can read, admins can write)
create policy "Anyone can view books" on public.books
  for select using (auth.uid() is not null);

create policy "Admins can manage books" on public.books
  for all using (public.is_admin(auth.uid()));

-- Borrowings policies
create policy "Users can view own borrowings" on public.borrowings
  for select using (resident_id = auth.uid());

create policy "Admins can view all borrowings" on public.borrowings
  for select using (public.is_admin(auth.uid()));

create policy "Admins can manage borrowings" on public.borrowings
  for all using (public.is_admin(auth.uid()));

-- Volunteer requests policies
create policy "Users can view own requests" on public.volunteer_requests
  for select using (resident_id = auth.uid());

create policy "Users can create own requests" on public.volunteer_requests
  for insert with check (resident_id = auth.uid());

create policy "Admins can manage volunteer requests" on public.volunteer_requests
  for all using (public.is_admin(auth.uid()));

-- Temp admin access policies
create policy "Admins can manage temp access" on public.temp_admin_access
  for all using (public.is_admin(auth.uid()));

create policy "Users can view own temp access" on public.temp_admin_access
  for select using (resident_id = auth.uid());

-- App settings policies
create policy "Anyone can read settings" on public.app_settings
  for select using (auth.uid() is not null);

create policy "Admins can update settings" on public.app_settings
  for update using (public.is_admin(auth.uid()));

-- ============================================
-- SEED: Generate 488 flat accounts
-- Run this AFTER setting up Supabase Auth
-- See README for instructions on bulk user creation
-- ============================================
