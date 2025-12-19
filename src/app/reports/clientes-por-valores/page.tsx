"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ClientesPorValoresPage() {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const actRes = await supabase.from("contracts").select("id, client_id, status, total_value").eq("status", "ativo");
      const contracts = actRes.data || [];
      const contractIds = contracts.map((c: any) => c.id);
      const clientIds = contracts.map((c: any) => c.client_id);
      const [cRes, itRes, svcRes] = await Promise.all([
        supabase.from("clients").select("id, client_contract, alias, company_type").in("id", clientIds),
        contractIds.length ? supabase.from("contract_items").select("contract_id, service_name_snapshot, quantity, unit_price, discount").in("contract_id", contractIds) : Promise.resolve({ data: [] as any[] }),
        clientIds.length ? supabase.from("client_services").select("client_id, service:services(name)").in("client_id", clientIds) : Promise.resolve({ data: [] as any[] })
      ]);
      const clients = (cRes.data || []) as any[];
      const items = (itRes as any).data || [];
      const svcLinks = (svcRes as any).data || [];
      const itemsByContract = new Map<string, any[]>();
      items.forEach((it: any) => {
        const key = String(it.contract_id);
        const arr = itemsByContract.get(key) || [];
        arr.push(it);
        itemsByContract.set(key, arr);
      });
      const contractByClient = new Map<string, any>();
      contracts.forEach((c: any) => contractByClient.set(String(c.client_id), c));
      const svcByClient = new Map<string, string[]>();
      svcLinks.forEach((l: any) => {
        const id = String(l.client_id);
        const name = String((l as any).service?.name || '').trim();
        if (!name) return;
        const arr = svcByClient.get(id) || [];
        if (!arr.includes(name)) arr.push(name);
        svcByClient.set(id, arr);
      });
      const rows = clients.map((cl: any) => {
        const c = contractByClient.get(String(cl.id));
        const its = c ? (itemsByContract.get(String(c.id)) || []) : [];
        const sumItems = its.reduce((sum: number, it: any) => sum + (Number(it.quantity) * Number(it.unit_price) - Number(it.discount)), 0);
        const total = Number(c?.total_value || 0) > 0 ? Number(c.total_value) : sumItems;
        const fromLinks = svcByClient.get(String(cl.id)) || [];
        const fromItems = Array.from(new Set(its.map((it: any) => String(it.service_name_snapshot || "").trim()).filter(Boolean)));
        const svcNames = (fromLinks.length ? fromLinks : fromItems);
        return {
          contrato: String(cl.client_contract || '').padStart(3,'0'),
          apelido: cl.alias,
          valor: total,
          tipoEmpresa: cl.company_type,
          servicos: svcNames.join(", ")
        };
      }).sort((a, b) => b.valor - a.valor);
      setRows(rows);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Clientes por Valores</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#2C3E50] text-white">
              <tr>
                <th scope="col" className="text-left p-2">Contrato</th>
                <th scope="col" className="text-left p-2">Apelido</th>
                <th scope="col" className="text-right p-2">Valor do Contrato</th>
                <th scope="col" className="text-left p-2">Tipo de Empresa</th>
                <th scope="col" className="text-left p-2">Serviços</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={`${idx%2===0?'bg-white':'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}>
                  <td className="p-2">{r.contrato}</td>
                  <td className="p-2">{r.apelido}</td>
                  <td className="p-2 text-right font-semibold">
                    <div className="flex items-center justify-end gap-2">
                      <span>{Number(r.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      {Number(r.valor || 0) === 0 ? (
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-white uppercase text-[10px] bg-gray-500">Sem itens</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-2">{r.tipoEmpresa}</td>
                  <td className="p-2">{r.servicos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
