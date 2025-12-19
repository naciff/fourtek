import { supabaseServer } from "@/lib/supabase-server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ClientContractsPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: client } = await supabase.from("clients").select("trade_name").eq("id", params.id).single();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, start_date, end_date, due_day, total_value, status")
    .eq("client_id", params.id)
    .order("start_date", { ascending: false });

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
      <h1 className="text-2xl font-semibold text-brand-blue-800">Contratos de {client?.trade_name}</h1>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-blue-100">
            <tr>
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
                <td className="p-2">{c.status}</td>
                <td className="p-2">{fmtDate(c.start_date)}</td>
                <td className="p-2">{fmtDate(c.end_date)}</td>
                <td className="p-2">{(c as any).due_day ? String((c as any).due_day).padStart(2, "0") : fmtDate(c.end_date)}</td>
                <td className="p-2">{Number(c.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}