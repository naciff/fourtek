-- Empresa
-- Encoding: UTF-8
-- Independent insert (uses a new owner id)

WITH owner AS (
  SELECT gen_random_uuid() AS user_id
)
INSERT INTO public.empresa (
  id, user_id, razao_social, cnpj, data_abertura, consulta_cnpj, inscricao_municipal,
  inscricao_estadual, endereco_completo, email, contato, site, dados_bancarios,
  chave_pix, chave_pix_imagem, contrato_social, imagem_cnpj
)
SELECT gen_random_uuid(), user_id,
  'Fourtek Tecnologia Ltda', '12.345.678/0001-99', CURRENT_DATE, 'https://receita.fazenda.gov.br', '123456',
  'ISENTO', 'Rua Principal, 1000, Centro, RJ', 'contato@fourtek.com.br', '(21) 99999-0000', 'https://fourtek.com.br', 'Banco X - Ag 0001 - Cc 12345-6',
  'chave@pix.com', NULL, NULL, NULL
FROM owner;

