-- Usuários (cadastro interno)
-- Encoding: UTF-8

create extension if not exists pgcrypto;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  email text not null,
  "group" text,
  permissions jsonb,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

alter table public.usuarios enable row level security;
drop policy if exists "Usuarios select dono" on public.usuarios;
create policy "Usuarios select dono" on public.usuarios for select using (auth.uid() = user_id);
drop policy if exists "Usuarios insert dono" on public.usuarios;
create policy "Usuarios insert dono" on public.usuarios for insert with check (auth.uid() = user_id);
drop policy if exists "Usuarios update dono" on public.usuarios;
create policy "Usuarios update dono" on public.usuarios for update using (auth.uid() = user_id);
drop policy if exists "Usuarios delete dono" on public.usuarios;
create policy "Usuarios delete dono" on public.usuarios for delete using (auth.uid() = user_id);

create unique index if not exists usuarios_email_unique_idx on public.usuarios (email);
create index if not exists usuarios_user_idx on public.usuarios (user_id);

select pg_notify('pgrst','reload schema');

