-- Core seed: Clients, Representatives, Services, Contracts, Links
-- Encoding: UTF-8
-- This script creates a base client and related data, ensuring referential integrity.

-- Create or upsert base services and capture their IDs
WITH up_cloud AS (
  INSERT INTO public.services (name, slug, active)
  VALUES ('Cloud', 'cloud', true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active
  RETURNING id AS cloud_id
), up_fire AS (
  INSERT INTO public.services (name, slug, active)
  VALUES ('Firewall', 'firewall', true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active
  RETURNING id AS fire_id
), owner AS (
  SELECT gen_random_uuid() AS user_id
), cli AS (
  INSERT INTO public.clients (
    id, user_id, corporate_name, trade_name, cnpj, state_registration,
    street, number, neighborhood, city, state, zip,
    phone, email, alias, situation, company_type,
    client_contract, installation_date
  )
  SELECT gen_random_uuid(), owner.user_id,
    'Fourtek Ltda', 'Fourtek', '12.345.678/0001-99', 'ISENTO',
    'Av. Brasil', '1000', 'Centro', 'Rio de Janeiro', 'RJ', '20000-000',
    '(21) 99999-0000', 'contato@fourtek.com.br', 'Fourtek', 'Ativo', 'Empresa',
    101, CURRENT_DATE
  FROM owner
  RETURNING id, user_id
), rep AS (
  INSERT INTO public.representatives (id, user_id, full_name, cpf, phone, email, rg, birth_date)
  SELECT gen_random_uuid(), (SELECT user_id FROM cli), 'João Silva', '123.456.789-09', '(21) 98888-7777', 'joao@fourtek.com.br', 'MG-12.345.678', DATE '1990-05-20'
  RETURNING id
), link_rep AS (
  INSERT INTO public.client_representatives (client_id, representative_id, user_id)
  SELECT (SELECT id FROM cli), (SELECT id FROM rep), (SELECT user_id FROM cli)
  RETURNING client_id
), link_cloud AS (
  INSERT INTO public.client_services (client_id, service_id, user_id)
  SELECT (SELECT client_id FROM link_rep), (SELECT cloud_id FROM up_cloud), (SELECT user_id FROM cli)
  RETURNING client_id
), link_fire AS (
  INSERT INTO public.client_services (client_id, service_id, user_id)
  SELECT (SELECT client_id FROM link_cloud), (SELECT fire_id FROM up_fire), (SELECT user_id FROM cli)
  RETURNING client_id
), contract_ins AS (
  INSERT INTO public.contracts (id, user_id, start_date, end_date, due_day, status, client_id)
  SELECT gen_random_uuid(), (SELECT user_id FROM cli), CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 10, 'ativo', (SELECT client_id FROM link_fire)
  RETURNING id, client_id
), item_cloud AS (
  INSERT INTO public.contract_items (id, contract_id, service_id, service_name_snapshot, quantity, unit_price, discount)
  SELECT gen_random_uuid(), (SELECT id FROM contract_ins), (SELECT cloud_id FROM up_cloud), 'Cloud Backup', 1, 299.90, 0
  RETURNING contract_id
)
INSERT INTO public.contract_items (id, contract_id, service_id, service_name_snapshot, quantity, unit_price, discount)
SELECT gen_random_uuid(), (SELECT contract_id FROM item_cloud), (SELECT fire_id FROM up_fire), 'Firewall Gerenciado', 1, 199.90, 0;

-- Note: triggers update_contract_total and contracts_sync_client_value
-- will compute totals and propagate to clients.contract_value automatically.

