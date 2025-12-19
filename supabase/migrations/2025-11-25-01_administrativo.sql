-- Administrativo: criação de tabelas novas
-- Encoding: UTF-8
-- Este script cria tabelas administrativas e políticas RLS

create extension if not exists pgcrypto;

-- Gestão
create table if not exists public.gestao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  grupo text check (grupo in ('Pagamentos','Redes Sociais','CPainel','Site','Segurança')) not null,
  descricao text,
  usuario text,
  senha text,
  link text,
  arquivo text,
  observacao text,
  created_at timestamp with time zone default now()
);
alter table public.gestao enable row level security;
drop policy if exists "Gestao visível para dono" on public.gestao;
create policy "Gestao visível para dono" on public.gestao for select using (auth.uid() = user_id);
drop policy if exists "Gestao inserir dono" on public.gestao;
create policy "Gestao inserir dono" on public.gestao for insert with check (auth.uid() = user_id);
drop policy if exists "Gestao atualizar dono" on public.gestao;
create policy "Gestao atualizar dono" on public.gestao for update using (auth.uid() = user_id);
drop policy if exists "Gestao excluir dono" on public.gestao;
create policy "Gestao excluir dono" on public.gestao for delete using (auth.uid() = user_id);
create index if not exists gestao_grupo_idx on public.gestao (grupo);
create index if not exists gestao_user_idx on public.gestao (user_id);

-- Parceiros
create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  razao_social text not null,
  cnpj text,
  objeto text,
  categoria text,
  comissao numeric(12,2),
  data_parceria date,
  responsavel text,
  contato text,
  telefone text,
  situacao text,
  imagem_contrato text,
  observacao text,
  created_at timestamp with time zone default now()
);
alter table public.parceiros enable row level security;
drop policy if exists "Parceiros visível para dono" on public.parceiros;
create policy "Parceiros visível para dono" on public.parceiros for select using (auth.uid() = user_id);
drop policy if exists "Parceiros inserir dono" on public.parceiros;
create policy "Parceiros inserir dono" on public.parceiros for insert with check (auth.uid() = user_id);
drop policy if exists "Parceiros atualizar dono" on public.parceiros;
create policy "Parceiros atualizar dono" on public.parceiros for update using (auth.uid() = user_id);
drop policy if exists "Parceiros excluir dono" on public.parceiros;
create policy "Parceiros excluir dono" on public.parceiros for delete using (auth.uid() = user_id);
create index if not exists parceiros_razao_idx on public.parceiros (razao_social);
create index if not exists parceiros_cnpj_idx on public.parceiros (cnpj);
create index if not exists parceiros_user_idx on public.parceiros (user_id);

-- Fornecedores
create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  razao_social text not null,
  cnpj text,
  objeto text,
  data_contrato date,
  responsavel text,
  contato text,
  situacao text,
  imagem_contrato text,
  created_at timestamp with time zone default now()
);
alter table public.fornecedores enable row level security;
drop policy if exists "Fornecedores visível para dono" on public.fornecedores;
create policy "Fornecedores visível para dono" on public.fornecedores for select using (auth.uid() = user_id);
drop policy if exists "Fornecedores inserir dono" on public.fornecedores;
create policy "Fornecedores inserir dono" on public.fornecedores for insert with check (auth.uid() = user_id);
drop policy if exists "Fornecedores atualizar dono" on public.fornecedores;
create policy "Fornecedores atualizar dono" on public.fornecedores for update using (auth.uid() = user_id);
drop policy if exists "Fornecedores excluir dono" on public.fornecedores;
create policy "Fornecedores excluir dono" on public.fornecedores for delete using (auth.uid() = user_id);
create index if not exists fornecedores_razao_idx on public.fornecedores (razao_social);
create index if not exists fornecedores_cnpj_idx on public.fornecedores (cnpj);
create index if not exists fornecedores_user_idx on public.fornecedores (user_id);

-- Colaboradores
create table if not exists public.colaboradores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  foto text,
  nome text not null,
  cargo text,
  estado_civil text,
  cpf text,
  data_nascimento date,
  endereco text,
  email text,
  contato_empresa text,
  contato_particular text,
  data_contratacao date,
  valor_salario numeric(12,2),
  imagem_confiabilidade text,
  created_at timestamp with time zone default now()
);
alter table public.colaboradores enable row level security;
drop policy if exists "Colaboradores visível para dono" on public.colaboradores;
create policy "Colaboradores visível para dono" on public.colaboradores for select using (auth.uid() = user_id);
drop policy if exists "Colaboradores inserir dono" on public.colaboradores;
create policy "Colaboradores inserir dono" on public.colaboradores for insert with check (auth.uid() = user_id);
drop policy if exists "Colaboradores atualizar dono" on public.colaboradores;
create policy "Colaboradores atualizar dono" on public.colaboradores for update using (auth.uid() = user_id);
drop policy if exists "Colaboradores excluir dono" on public.colaboradores;
create policy "Colaboradores excluir dono" on public.colaboradores for delete using (auth.uid() = user_id);
create index if not exists colaboradores_nome_idx on public.colaboradores (nome);
create index if not exists colaboradores_cpf_idx on public.colaboradores (cpf);
create index if not exists colaboradores_user_idx on public.colaboradores (user_id);

select pg_notify('pgrst','reload schema');
