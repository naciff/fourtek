-- Tabelas principais
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  corporate_name text not null,
  trade_name text,
  cnpj text not null,
  consulta_cnpj text,
  cns numeric,
  state_registration text,
  street text,
  number text,
  neighborhood text,
  complement text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  website text,
  alias text,
  situation text check (situation in ('Ativo','Cancelado')) default 'Ativo',
  company_type text check (company_type in ('Cartório','Empresa')),
  provimento_74 boolean default false,
  workstation_support boolean default false,
  cloud boolean default false,
  cloud_size text,
  cloud_date date,
  client_contract numeric,
  contract_done boolean default false,
  signed boolean default false,
  implemented boolean default false,
  contract_value numeric,
  contract_value_details text,
  installation_date date,
  cancellation_date date,
  contact_name text,
  contact_phone text,
  position text,
  services text,
  generate_pdf boolean default false,
  pdf_url text,
  logo_url text,
  contract_image_url text,
  cloud_image_url text,
  representatives_text text,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists public.representatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  cpf text not null,
  phone text,
  email text,
  created_at timestamp with time zone default now()
);
alter table public.representatives add column if not exists rg text;
alter table public.representatives add column if not exists birth_date date;
alter table public.representatives add column if not exists image_url text;
-- cargo deve ser definido no cliente, não no representante
alter table public.clients add column if not exists cargo text;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  start_date date,
  end_date date,
  due_day integer,
  total_value numeric,
  status text check (status in ('ativo','encerrado','suspenso')) default 'ativo',
  client_id uuid references public.clients(id) on delete cascade,
  created_at timestamp with time zone default now()
);
alter table public.contracts add column if not exists due_day integer;
alter table public.contracts drop column if exists contract_number;
drop index if exists contracts_client_unique_idx;
create unique index if not exists contracts_client_active_unique_idx on public.contracts (client_id) where status = 'ativo';
alter table public.contracts drop column if exists due_date;
alter table public.contracts drop column if exists payment_method;
alter table public.contracts drop column if exists representative_id;

-- Vínculo representantes x clientes (N:N)
create table if not exists public.client_representatives (
  client_id uuid references public.clients(id) on delete cascade,
  representative_id uuid references public.representatives(id) on delete cascade,
  user_id uuid not null,
  created_at timestamp with time zone default now(),
  primary key (client_id, representative_id)
);

-- Catálogo de serviços e vínculo com clientes
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.client_services (
  client_id uuid references public.clients(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  user_id uuid not null,
  created_at timestamp with time zone default now(),
  primary key (client_id, service_id)
);

-- Remoção de colunas obsoletas em clients
alter table public.clients drop column if exists cloud;
alter table public.clients drop column if exists workstation_support;
alter table public.clients drop column if exists provimento_74;
alter table public.clients drop column if exists generate_pdf;
alter table public.clients drop column if exists pdf_url;

-- RLS
alter table public.clients enable row level security;
alter table public.representatives enable row level security;
alter table public.contracts enable row level security;
alter table public.client_representatives enable row level security;
alter table public.services enable row level security;
alter table public.client_services enable row level security;

create policy "Clientes visíveis para o dono" on public.clients
  for select using (auth.uid() = user_id);
create policy "Inserir clientes como dono" on public.clients
  for insert with check (auth.uid() = user_id);
create policy "Atualizar clientes do dono" on public.clients
  for update using (auth.uid() = user_id);
create policy "Excluir clientes do dono" on public.clients
  for delete using (auth.uid() = user_id);

create policy "Representantes visíveis para o dono" on public.representatives
  for select using (auth.uid() = user_id);
create policy "Inserir representantes como dono" on public.representatives
  for insert with check (auth.uid() = user_id);
create policy "Atualizar representantes do dono" on public.representatives
  for update using (auth.uid() = user_id);
create policy "Excluir representantes do dono" on public.representatives
  for delete using (auth.uid() = user_id);

create policy "Contratos visíveis para o dono" on public.contracts
  for select using (auth.uid() = user_id);
create policy "Inserir contratos como dono" on public.contracts
  for insert with check (auth.uid() = user_id);
create policy "Atualizar contratos do dono" on public.contracts
  for update using (auth.uid() = user_id);
create policy "Excluir contratos do dono" on public.contracts
  for delete using (auth.uid() = user_id);

create policy "Vínculos visíveis para o dono" on public.client_representatives
  for select using (auth.uid() = user_id);
create policy "Inserir vínculos como dono" on public.client_representatives
  for insert with check (auth.uid() = user_id);
create policy "Excluir vínculos do dono" on public.client_representatives
  for delete using (auth.uid() = user_id);

create policy if not exists "Serviços visíveis (todos)" on public.services
  for select using (true);
create policy if not exists "Inserir serviços (auth)" on public.services
  for insert with check (true);
create policy if not exists "Atualizar serviços (auth)" on public.services
  for update using (true);
create policy if not exists "Excluir serviços (auth)" on public.services
  for delete using (true);

create policy "Cliente-Serviço visível para o dono" on public.client_services
  for select using (auth.uid() = user_id);
create policy "Inserir Cliente-Serviço como dono" on public.client_services
  for insert with check (auth.uid() = user_id);
create policy "Excluir Cliente-Serviço do dono" on public.client_services
  for delete using (auth.uid() = user_id);

-- Índices comuns para performance
create index if not exists clients_corporate_name_idx on public.clients (corporate_name);
create index if not exists clients_city_idx on public.clients (city);
create unique index if not exists clients_client_contract_unique_idx on public.clients (client_contract) where client_contract is not null;
create index if not exists contracts_status_idx on public.contracts (status);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null,
  name text not null,
  phone text,
  created_at timestamp with time zone default now()
);
alter table public.client_contacts enable row level security;
create policy "Contatos visíveis para dono" on public.client_contacts for select using (auth.uid() = user_id);
create policy "Inserir contato como dono" on public.client_contacts for insert with check (auth.uid() = user_id);
create policy "Atualizar contato do dono" on public.client_contacts for update using (auth.uid() = user_id);
create policy "Excluir contato do dono" on public.client_contacts for delete using (auth.uid() = user_id);
create index if not exists client_contacts_client_idx on public.client_contacts (client_id);

create table if not exists public.client_representatives (
  client_id uuid references public.clients(id) on delete cascade,
  representative_id uuid references public.representatives(id) on delete cascade,
  user_id uuid not null,
  created_at timestamp with time zone default now(),
  primary key (client_id, representative_id)
);
alter table public.client_representatives enable row level security;
create policy "Vínculo representante visível" on public.client_representatives for select using (auth.uid() = user_id);
create policy "Vínculo representante inserir" on public.client_representatives for insert with check (auth.uid() = user_id);
create policy "Vínculo representante excluir" on public.client_representatives for delete using (auth.uid() = user_id);
create index if not exists client_representatives_rep_idx on public.client_representatives (representative_id);
create index if not exists contracts_client_idx on public.contracts (client_id);
create index if not exists client_representatives_client_idx on public.client_representatives (client_id);
create index if not exists client_representatives_rep_idx on public.client_representatives (representative_id);
create index if not exists services_user_idx on public.services (user_id);
create index if not exists client_services_client_idx on public.client_services (client_id);
create index if not exists client_services_service_idx on public.client_services (service_id);

create table if not exists public.diretoria (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  cargo text,
  estado_civil text,
  rg text,
  orgao_expedidor text,
  cpf text,
  endereco text,
  data_nascimento date,
  email_corporativo text,
  email_pessoal text,
  celular text,
  chave_pix text,
  created_at timestamp with time zone default now()
);
alter table public.diretoria enable row level security;
create policy "Diretoria visível para o dono" on public.diretoria for select using (auth.uid() = user_id);
create policy "Inserir diretoria como dono" on public.diretoria for insert with check (auth.uid() = user_id);
create policy "Atualizar diretoria do dono" on public.diretoria for update using (auth.uid() = user_id);
create policy "Excluir diretoria do dono" on public.diretoria for delete using (auth.uid() = user_id);
create index if not exists diretoria_user_idx on public.diretoria (user_id);

create table if not exists public.empresa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  razao_social text not null,
  cnpj text not null,
  data_abertura date,
  consulta_cnpj text,
  inscricao_municipal text,
  inscricao_estadual text,
  endereco_completo text,
  email text,
  contato text,
  site text,
  dados_bancarios text,
  chave_pix text,
  chave_pix_imagem text,
  contrato_social text,
  imagem_cnpj text,
  created_at timestamp with time zone default now()
);
alter table public.empresa enable row level security;
create policy "Empresa visível para o dono" on public.empresa for select using (auth.uid() = user_id);
create policy "Inserir empresa como dono" on public.empresa for insert with check (auth.uid() = user_id);
create policy "Atualizar empresa do dono" on public.empresa for update using (auth.uid() = user_id);
create policy "Excluir empresa do dono" on public.empresa for delete using (auth.uid() = user_id);
create index if not exists empresa_user_idx on public.empresa (user_id);
create index if not exists empresa_cnpj_idx on public.empresa (cnpj);

-- Ajuste de tipo para preservar zeros à esquerda no CNS
alter table public.clients alter column cns type text using cns::text;
-- Contract items table and trigger to keep contracts.total_value in sync
create extension if not exists pgcrypto;

create table if not exists public.contract_items (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  service_id uuid references public.services(id),
  service_name_snapshot text not null,
  quantity numeric(12,4) not null default 1,
  unit_price numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  total_price numeric(12,2) generated always as ((quantity * unit_price) - discount) stored
);

create index if not exists contract_items_contract_idx on public.contract_items (contract_id);
create index if not exists contract_items_service_idx on public.contract_items (service_id);

-- Habilitar RLS para contract_items alinhado ao dono do contrato
alter table public.contract_items enable row level security;
drop policy if exists "Itens visíveis para dono do contrato" on public.contract_items;
drop policy if exists "Inserir itens com contrato do dono" on public.contract_items;
drop policy if exists "Atualizar itens do contrato do dono" on public.contract_items;
drop policy if exists "Excluir itens do contrato do dono" on public.contract_items;
create policy "Itens visíveis para dono do contrato" on public.contract_items
  for select using (exists (
    select 1 from public.contracts c
    where c.id = contract_items.contract_id and c.user_id = auth.uid()
  ));
create policy "Inserir itens com contrato do dono" on public.contract_items
  for insert with check (exists (
    select 1 from public.contracts c
    where c.id = contract_items.contract_id and c.user_id = auth.uid()
  ));
create policy "Atualizar itens do contrato do dono" on public.contract_items
  for update using (exists (
    select 1 from public.contracts c
    where c.id = contract_items.contract_id and c.user_id = auth.uid()
  ));
create policy "Excluir itens do contrato do dono" on public.contract_items
  for delete using (exists (
    select 1 from public.contracts c
    where c.id = contract_items.contract_id and c.user_id = auth.uid()
  ));

create or replace function public.update_contract_total()
returns trigger
language plpgsql
as $$
begin
  update public.contracts c
     set total_value = coalesce((
       select sum(ci.total_price)
       from public.contract_items ci
       where ci.contract_id = c.id
     ), 0)
   where c.id = (coalesce(new.contract_id, old.contract_id));
  return null;
end
$$;

drop trigger if exists contract_items_aiud on public.contract_items;

create trigger contract_items_aiud
after insert or update or delete on public.contract_items
for each row
execute function public.update_contract_total();

-- Keep clients.contract_value synced with contracts.total_value
create or replace function public.update_client_contract_value()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    update public.clients
       set contract_value = 0
     where id = old.client_id;
  else
    update public.clients
       set contract_value = coalesce(new.total_value, 0)
     where id = new.client_id;
  end if;
  return null;
end
$$;

drop trigger if exists contracts_sync_client_value on public.contracts;
create trigger contracts_sync_client_value
after insert or update or delete on public.contracts
for each row
execute function public.update_client_contract_value();
-- Drop clients.contract_value_details if exists
alter table if exists public.clients drop column if exists contract_value_details;
select pg_notify('pgrst','reload schema');
-- Mensagens públicas para tela de login
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  text text,
  mensagem text,
  content text,
  active boolean default true,
  created_at timestamp with time zone default now()
);
alter table public.messages enable row level security;
drop policy if exists messages_public_select on public.messages;
create policy messages_public_select on public.messages for select using (true);
alter table public.messages add column if not exists message text;

-- Inventário
create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  codigo text,
  data_compra date,
  grupo text check (grupo in ('Ferramentas','Equipamento Informática')),
  item text,
  qtd integer,
  marca text,
  modelo text,
  valor numeric(12,2),
  nota_fiscal text,
  observacao text,
  created_at timestamp with time zone default now()
);
alter table public.inventario enable row level security;
create policy if not exists "Inventário visível para o dono" on public.inventario
  for select using (auth.uid() = user_id);
create policy if not exists "Inventário visível sem dono" on public.inventario
  for select using (user_id is null);
create policy if not exists "Inserir inventário como dono" on public.inventario
  for insert with check (auth.uid() = user_id);
create policy if not exists "Atualizar inventário do dono" on public.inventario
  for update using (auth.uid() = user_id);
create policy if not exists "Atualizar inventário sem dono" on public.inventario
  for update using (user_id is null) with check (auth.uid() = user_id);
create policy if not exists "Excluir inventário do dono" on public.inventario
  for delete using (auth.uid() = user_id);
create index if not exists inventario_data_idx on public.inventario (data_compra);
create index if not exists inventario_grupo_idx on public.inventario (grupo);

-- Administrativo: Gestão
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
create policy if not exists "Gestao visível para dono" on public.gestao for select using (auth.uid() = user_id);
create policy if not exists "Gestao inserir dono" on public.gestao for insert with check (auth.uid() = user_id);
create policy if not exists "Gestao atualizar dono" on public.gestao for update using (auth.uid() = user_id);
create policy if not exists "Gestao excluir dono" on public.gestao for delete using (auth.uid() = user_id);
create index if not exists gestao_grupo_idx on public.gestao (grupo);

-- Administrativo: Parceiros
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
create policy if not exists "Parceiros visível para dono" on public.parceiros for select using (auth.uid() = user_id);
create policy if not exists "Parceiros inserir dono" on public.parceiros for insert with check (auth.uid() = user_id);
create policy if not exists "Parceiros atualizar dono" on public.parceiros for update using (auth.uid() = user_id);
create policy if not exists "Parceiros excluir dono" on public.parceiros for delete using (auth.uid() = user_id);
create index if not exists parceiros_razao_idx on public.parceiros (razao_social);
create index if not exists parceiros_cnpj_idx on public.parceiros (cnpj);

-- Administrativo: Fornecedores
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
create policy if not exists "Fornecedores visível para dono" on public.fornecedores for select using (auth.uid() = user_id);
create policy if not exists "Fornecedores inserir dono" on public.fornecedores for insert with check (auth.uid() = user_id);
create policy if not exists "Fornecedores atualizar dono" on public.fornecedores for update using (auth.uid() = user_id);
create policy if not exists "Fornecedores excluir dono" on public.fornecedores for delete using (auth.uid() = user_id);
create index if not exists fornecedores_razao_idx on public.fornecedores (razao_social);
create index if not exists fornecedores_cnpj_idx on public.fornecedores (cnpj);

-- Administrativo: Colaboradores
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
create policy if not exists "Colaboradores visível para dono" on public.colaboradores for select using (auth.uid() = user_id);
create policy if not exists "Colaboradores inserir dono" on public.colaboradores for insert with check (auth.uid() = user_id);
create policy if not exists "Colaboradores atualizar dono" on public.colaboradores for update using (auth.uid() = user_id);
create policy if not exists "Colaboradores excluir dono" on public.colaboradores for delete using (auth.uid() = user_id);
create index if not exists colaboradores_nome_idx on public.colaboradores (nome);
create index if not exists colaboradores_cpf_idx on public.colaboradores (cpf);
