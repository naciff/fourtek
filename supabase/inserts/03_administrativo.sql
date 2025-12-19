-- Administrativo: Inventário, Gestão, Parceiros, Fornecedores, Colaboradores
-- Encoding: UTF-8
-- Depends on client with client_contract = 101 created in 01_core.sql

WITH cli AS (
  SELECT id AS client_id, user_id FROM public.clients WHERE client_contract = 101
)
INSERT INTO public.inventario (id, user_id, codigo, data_compra, grupo, item, qtd, marca, modelo, valor, nota_fiscal, observacao)
SELECT gen_random_uuid(), (SELECT user_id FROM cli),
  'INV-0001', CURRENT_DATE, 'Equipamento Informática', 'Notebook', 1, 'Dell', 'Latitude', 5679.90, 'NF-12345', 'Notebook do gestor';

WITH owner AS (
  SELECT user_id FROM public.clients WHERE client_contract = 101
)
INSERT INTO public.gestao (id, user_id, grupo, descricao, usuario, senha, link, arquivo, observacao)
SELECT gen_random_uuid(), user_id, 'Pagamentos', 'Conta no gateway', 'admin.gateway', 'senha#segura', 'https://pagamentos.example.com', NULL, 'Acesso ao painel de pagamentos'
FROM owner;

WITH owner AS (
  SELECT user_id FROM public.clients WHERE client_contract = 101
)
INSERT INTO public.parceiros (id, user_id, razao_social, cnpj, objeto, categoria, comissao, data_parceria, responsavel, contato, telefone, situacao, imagem_contrato, observacao)
SELECT gen_random_uuid(), user_id,
  'Parceiro Alpha', '11.111.111/0001-11', 'Prestação de serviços', 'Tecnologia', 10.00, CURRENT_DATE,
  'Carlos Lima', 'Comercial', '(21) 95555-4444', 'Ativo', NULL, 'Parceria estratégica';

WITH owner AS (
  SELECT user_id FROM public.clients WHERE client_contract = 101
)
INSERT INTO public.fornecedores (id, user_id, razao_social, cnpj, objeto, data_contrato, responsavel, contato, situacao, imagem_contrato)
SELECT gen_random_uuid(), user_id,
  'Fornecedor Beta', '22.222.222/0001-22', 'Fornecimento de hardware', CURRENT_DATE,
  'Ana Souza', 'Compras', 'Ativo', NULL
FROM owner;

WITH owner AS (
  SELECT user_id FROM public.clients WHERE client_contract = 101
)
INSERT INTO public.colaboradores (id, user_id, foto, nome, cargo, estado_civil, cpf, data_nascimento, endereco, email, contato_empresa, contato_particular, data_contratacao, valor_salario, imagem_confiabilidade)
SELECT gen_random_uuid(), user_id,
  NULL, 'Marcos Pereira', 'Analista de Sistemas', 'Solteiro', '123.456.789-00', DATE '1995-03-12',
  'Rua das Flores, 200 - Centro - RJ', 'marcos@fourtek.com.br', '(21) 91234-5678', '(21) 97654-3210', CURRENT_DATE, 4500.00, NULL
FROM owner;

