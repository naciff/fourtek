-- Drop the restrictive check constraint on inventario_historico to allow new item types like 'Storage' or 'Estação de Trabalho'
ALTER TABLE public.inventario_historico DROP CONSTRAINT IF EXISTS inventario_historico_item_check;
