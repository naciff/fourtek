import { supabaseServer } from "@/lib/supabase-server";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function RepresentativeContractsPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: rep } = await supabase.from("representatives").select("full_name").eq("id", params.id).single();
  const { data: links } = await supabase.from("client_representatives").select("client_id").eq("representative_id", params.id);
  const clientIds = (links ?? []).map((l: any)=> l.client_id);
  const base = supabase
    .from("contracts")
    .select("id, start_date, end_date, due_day, total_value, status, client:clients(trade_name)")
    .order("start_date", { ascending: false });
  const { data: contracts } = clientIds.length ? await base.in("client_id", clientIds) : await base.limit(0);
  function fmtDate(s?: string | null) {
    const v = String(s || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const yy = v.slice(2,4);
      return `${v.slice(8,10)}/${v.slice(5,7)}/${yy}`;
    }
    return v;
  }
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Contratos de {rep?.full_name}</h1>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-blue-100">
            <tr>
              <th className="text-left p-2">Cliente</th>
              <th className="text-left p-2">Situação</th>
              <th className="text-left p-2">Início</th>
              <th className="text-left p-2">Término</th>
              <th className="text-left p-2">Vencimento</th>
              <th className="text-left p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {contracts?.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{(c as any).client?.trade_name}</td>
                <td className="p-2"><span className={`inline-flex items-center rounded px-2 py-1 text-white uppercase text-xs ${String(c.status).toLowerCase()==="ativo"?"bg-brand-green-600":String(c.status).toLowerCase()==="encerrado"?"bg-gray-600":"bg-yellow-500"}`}>{String(c.status).toLowerCase()}</span></td>
                <td className="p-2">{fmtDate(c.start_date)}</td>
                <td className="p-2">{fmtDate(c.end_date)}</td>
                <td className="p-2">{(c as any).due_day ? String((c as any).due_day).padStart(2, "0") : fmtDate(c.end_date)}</td>
                <td className="p-2 font-bold">{Number(c.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}