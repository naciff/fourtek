-- Operacional: contatos, acessos, servidores, relatórios, pcn, inventário histórico
-- Encoding: UTF-8
-- Depends on client with client_contract = 101 created in 01_core.sql

WITH cli AS (
  SELECT id AS client_id, user_id FROM public.clients WHERE client_contract = 101
), contact AS (
  INSERT INTO public.client_contacts (id, client_id, user_id, name, phone)
  SELECT gen_random_uuid(), client_id, user_id, 'Maria Oliveira', '(21) 97777-6666' FROM cli
  RETURNING client_id, user_id
), acesso AS (
  INSERT INTO public.dados_acesso (
    id, client_id, user_id, tipo_acesso, url_tactical, url_link_externo,
    usuario_link_externo, senha_link_externo, id_anydesk, senha_anydesk,
    usuario_vpn, senha_vpn, observacoes
  )
  SELECT gen_random_uuid(), client_id, user_id,
    'Tactical RMM', 'https://tactical.example.com', 'https://portal.example.com',
    'user.portal', 'senha123', '123-456-789', 'pwd-123',
    'vpn_user', 'vpn_pwd', 'Acesso principal ao portal'
  FROM cli
  RETURNING client_id, user_id
), servidor AS (
  INSERT INTO public.servidores (
    id, client_id, user_id, servidor, so, ip, usuario, senha,
    link_externo, modelo_equipamento, qtd_disco, tamanho, descricao
  )
  SELECT gen_random_uuid(), client_id, user_id,
    'Ferrari', 'Proxmox', '10.0.0.10', 'admin', 'segura',
    'https://idrac.example.com', 'Dell R740', 4, '1TB', 'Cluster Proxmox'
  FROM cli
  RETURNING client_id, user_id
), rel AS (
  INSERT INTO public.relatorios (id, client_id, user_id, tipo, data, versao, arquivo)
  SELECT gen_random_uuid(), client_id, user_id, 'Relatório de Não Conformidade', CURRENT_DATE, 'v1.0', NULL FROM cli
  RETURNING client_id, user_id
), pcn AS (
  INSERT INTO public.pcn (id, client_id, user_id, pcn, politica_backup, politica_ti, encaminhado, link)
  SELECT gen_random_uuid(), client_id, user_id, true, true, true, false, 'https://forms.gle/UsGRMi7imMLeEFT98' FROM cli
  RETURNING client_id, user_id
)
INSERT INTO public.inventario_historico (id, client_id, user_id, item, qtd, descricao)
SELECT gen_random_uuid(), client_id, user_id, 'Servidor', 1, 'Servidor principal instalado' FROM cli;

