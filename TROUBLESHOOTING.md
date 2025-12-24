# Troubleshooting - Dados não aparecem

## Status
✅ Banco configurado corretamente
✅ Organizations criadas
✅ Usuários vinculados  
✅ Clientes com organization_id
✅ Políticas RLS aplicadas
❌ Dados não aparecem na interface

## Próximos Passos de Diagnóstico

### 1. Verificar Console do Navegador
Abrir DevTools (F12) e verificar se há erros JavaScript ou erros do Supabase.

### 2. Verificar Cache
- Limpar cache do navegador
- Hard refresh (Ctrl+F5)
- Testar em aba anônima

### 3. Verificar Política RLS com WITH CHECK
Política atual só tem USING, pode precisar de WITH CHECK explícito:
```sql
CREATE POLICY "Clients org access" ON public.clients
  FOR ALL
  USING (...)
  WITH CHECK (...); -- Adicionar isso
```

### 4. Testar Query Direta
Console → executar:
```javascript
const { data, error } = await supabase.from('clients').select('*');
console.log({data, error});
```
