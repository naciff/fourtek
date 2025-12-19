-- Operacional: criação de tabelas auxiliares por cliente
-- Encoding: UTF-8
-- Este script cria tabelas de dados operacionais e políticas RLS

create extension if not exists pgcrypto;

-- Inventário Histórico do Cliente
create table if not exists public.inventario_historico (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null,
  item text not null,
  qtd integer not null default 1,
  descricao text,
  created_at timestamp with time zone default now()
);
alter table public.inventario_historico enable row level security;
drop policy if exists "Inventário histórico visível para dono" on public.inventario_historico;
create policy "Inventário histórico visível para dono" on public.inventario_historico for select using (auth.uid() = user_id);
drop policy if exists "Inventário histórico inserir dono" on public.inventario_historico;
create policy "Inventário histórico inserir dono" on public.inventario_historico for insert with check (auth.uid() = user_id);
drop policy if exists "Inventário histórico atualizar dono" on public.inventario_historico;
create policy "Inventário histórico atualizar dono" on public.inventario_historico for update using (auth.uid() = user_id);
drop policy if exists "Inventário histórico excluir dono" on public.inventario_historico;
create policy "Inventário histórico excluir dono" on public.inventario_historico for delete using (auth.uid() = user_id);
create index if not exists inventario_hist_client_idx on public.inventario_historico (client_id);
create index if not exists inventario_hist_item_idx on public.inventario_historico (item);

-- Dados de Acesso (links e credenciais)
create table if not exists public.dados_acesso (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null,
  tipo_acesso text,
  url_tactical text,
  url_link_externo text,
  usuario_link_externo text,
  senha_link_externo text,
  id_anydesk text,
  senha_anydesk text,
  usuario_vpn text,
  senha_vpn text,
  observacoes text,
  created_at timestamp with time zone default now()
);
alter table public.dados_acesso enable row level security;
drop policy if exists "Dados acesso visível para dono" on public.dados_acesso;
create policy "Dados acesso visível para dono" on public.dados_acesso for select using (auth.uid() = user_id);
drop policy if exists "Dados acesso inserir dono" on public.dados_acesso;
create policy "Dados acesso inserir dono" on public.dados_acesso for insert with check (auth.uid() = user_id);
drop policy if exists "Dados acesso atualizar dono" on public.dados_acesso;
create policy "Dados acesso atualizar dono" on public.dados_acesso for update using (auth.uid() = user_id);
drop policy if exists "Dados acesso excluir dono" on public.dados_acesso;
create policy "Dados acesso excluir dono" on public.dados_acesso for delete using (auth.uid() = user_id);
create index if not exists dados_acesso_client_idx on public.dados_acesso (client_id);
create index if not exists dados_acesso_tipo_idx on public.dados_acesso (tipo_acesso);

-- Servidores do Cliente
create table if not exists public.servidores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null,
  servidor text not null,
  so text not null,
  ip text,
  usuario text,
  senha text,
  link_externo text,
  modelo_equipamento text,
  qtd_disco integer,
  tamanho text,
  descricao text,
  created_at timestamp with time zone default now()
);
alter table public.servidores enable row level security;
drop policy if exists "Servidores visível para dono" on public.servidores;
create policy "Servidores visível para dono" on public.servidores for select using (auth.uid() = user_id);
drop policy if exists "Servidores inserir dono" on public.servidores;
create policy "Servidores inserir dono" on public.servidores for insert with check (auth.uid() = user_id);
drop policy if exists "Servidores atualizar dono" on public.servidores;
create policy "Servidores atualizar dono" on public.servidores for update using (auth.uid() = user_id);
drop policy if exists "Servidores excluir dono" on public.servidores;
create policy "Servidores excluir dono" on public.servidores for delete using (auth.uid() = user_id);
create index if not exists servidores_client_idx on public.servidores (client_id);
create index if not exists servidores_servidor_idx on public.servidores (servidor);

select pg_notify('pgrst','reload schema');
