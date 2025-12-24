# Migrações SQL - Sistema Multi-Tenant

## ⚠️ IMPORTANTE - Execute nesta ordem!

### 1. `20251223_01_create_organizations.sql`
Cria tabelas `organizations` e `user_organizations`, organização padrão "Fourtek" e vincula usuários.

### 2. `20251223_02_add_organization_columns.sql`  
Adiciona coluna `organization_id` em 14 tabelas e migra dados existentes.

### 3. `20251223_03_update_rls_policies.sql`
Atualiza políticas RLS para acesso baseado em organization.

## Como Aplicar

**Via Supabase Dashboard:**
1. Abra SQL Editor
2. Cole TODO o conteúdo de cada arquivo
3. Execute em ordem (1, 2, 3)
4. Aguarde confirmação de sucesso

**Via Supabase CLI (se configurado):**
```bash
supabase db push
```

## Verificação

Após aplicar, teste:
1. Login com Ramon
2. Login com Clarissa
3. Ambos devem ver os mesmos clientes ✅
