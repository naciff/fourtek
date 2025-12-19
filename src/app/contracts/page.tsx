import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import ContractFileActions from "./ContractFileActions";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ContractsListPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const supabase = supabaseServer();
  const clientId = searchParams?.clientId || "";
  const status = searchParams?.status || "";
  const close = searchParams?.close || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1"));
  const pageSizeRaw = parseInt(searchParams?.pageSize || "20");
  const pageSize = [20, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let closedCount = 0;
  if (close === "1") {
    const todayISO = new Date().toISOString().slice(0, 10);
    const res = await supabase
      .from("contracts")
      .update({ status: "encerrado" })
      .not("end_date", "is", null)
      .lte("end_date", todayISO)
      .eq("status", "ativo")
      .select("id");
    closedCount = (res.data ?? []).length;
  }
  let query = supabase
    .from("contracts")
    .select("id, client_id, start_date, end_date, due_day, total_value, status, client:clients(alias, trade_name, contract_image_url)")
    .order("alias", { foreignTable: "clients", ascending: true, nullsFirst: false })
    .order("trade_name", { foreignTable: "clients", ascending: true });
  if (clientId) query = query.eq("client_id", clientId);

  if (status) query = query.eq("status", status);
  const filterCount = supabase.from("contracts").select("id", { count: "exact", head: true });
  let countQuery = filterCount;
  if (clientId) countQuery = countQuery.eq("client_id", clientId);

  if (status) countQuery = countQuery.eq("status", status);
  const { count } = await countQuery;
  const { data: contractsRaw } = await query.range(from, to);
  const contracts = (contractsRaw || []).slice().sort((a: any, b: any) => {
    const an = String(((a as any).client?.alias || (a as any).client?.trade_name || "")).trim();
    const bn = String(((b as any).client?.alias || (b as any).client?.trade_name || "")).trim();
    return an.localeCompare(bn, 'pt-BR', { sensitivity: 'base' });
  });
  const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;
  const [clientsRes] = await Promise.all([
    supabase.from("clients").select("id, alias, trade_name").order("alias", { ascending: true, nullsFirst: false }).order("trade_name"),
  ]);
  const clients = clientsRes.data ?? [];

  function fmtDate(s?: string | null) {
    const v = String(s || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const yy = v.slice(2, 4);
      return `${v.slice(8, 10)}/${v.slice(5, 7)}/${yy}`;
    }
    return v;
  }

  function remainingBadge(end?: string | null) {
    const raw = String(end || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const endDate = new Date(`${raw}T00:00:00`);
    const now = new Date();
    // Normalize to local day start to reduce TZ drift
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (endDate < today) return null;
    const months = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth()) - (endDate.getDate() < today.getDate() ? 1 : 0);
    if (months >= 3) return null;
    if (months >= 1) {
      const label = months === 1 ? "Resta 1 mês" : `Restam ${months} meses`;
      return (<span className="inline-flex items-center rounded px-1.5 py-0.5 text-white uppercase text-[10px] bg-yellow-600 whitespace-nowrap">{label}</span>);
    }
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return null;
    const label = diffDays === 1 ? "Resta 1 dia" : `Restam ${diffDays} dias`;
    return (<span className="inline-flex items-center rounded px-1.5 py-0.5 text-white uppercase text-[10px] bg-yellow-600 whitespace-nowrap">{label}</span>);
  }


  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-brand-blue-800">Contratos</h1>
        <div className="flex items-center gap-2">
          <Link href="/contracts/new" className="rounded bg-brand-green-600 px-3 py-1.5 text-white">Novo contrato</Link>
          <Link href={{ pathname: "/contracts", query: { clientId, status, page, close: "1" } }} className="rounded bg-gray-600 px-3 py-1.5 text-white" title="Encerrar vencidos" aria-label="Encerrar vencidos">Encerrar vencidos</Link>
        </div>
      </div>
      {closedCount ? (
        <div className="rounded border bg-green-50 text-green-800 px-3 py-2">
          {closedCount} contrato(s) encerrado(s) por vencimento.
        </div>
      ) : null}
      <form className="grid md:grid-cols-3 gap-2">
        <select name="clientId" defaultValue={clientId} className="rounded border px-3 py-2">
          <option value="">Cliente</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.alias || c.trade_name}</option>
          ))}
        </select>

        <select name="status" defaultValue={status} className="rounded border px-3 py-2">
          <option value="">Situação</option>
          <option value="ativo">Ativo</option>
          <option value="encerrado">Encerrado</option>
          <option value="suspenso">Suspenso</option>
        </select>
        <div className="flex items-center gap-2">
          <button className="rounded bg-brand-blue-600 px-3 py-2 text-white">Filtrar</button>
          <Link href="/contracts" className="text-sm text-brand-blue-700">Limpar filtro</Link>
        </div>
      </form>
      <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-[#2C3E50] text-white">
            <tr>
              <th className="text-left p-2">Cliente</th>
              <th className="text-left p-2">Situação</th>
              <th className="text-left p-2">Início</th>
              <th className="text-left p-2">Término</th>
              <th className="text-center p-2">Vencimento</th>
              <th className="text-left p-2 w-[130px]">Valor</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contracts?.map((c, idx) => (
              <tr key={c.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}>
                <td className="p-2">{(c as any).client?.alias || (c as any).client?.trade_name}</td>
                <td className="p-2"><StatusBadge status={String(c.status)} /></td>
                <td className="p-2">{fmtDate(c.start_date)}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span>{fmtDate(c.end_date)}</span>
                    {remainingBadge(c.end_date)}
                  </div>
                </td>
                <td className="p-2 text-center">{(c as any).due_day ? String((c as any).due_day).padStart(2, "0") : fmtDate(c.end_date)}</td>
                <td className="p-2 font-bold text-left whitespace-nowrap w-[130px]">{Number(c.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="p-2 flex gap-2">
                  <Link href={`/contracts/${c.id}`} className="text-gray-400" title="Editar" aria-label="Editar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" /></svg>
                  </Link>
                  <Link href={{ pathname: `/contracts/${c.id}`, query: { duplicate: "1" } }} className="text-gray-400" title="Duplicar" aria-label="Duplicar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1z" /><path d="M20 5H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 14H8V7h12v12z" /></svg>
                  </Link>
                  <ContractFileActions clientId={(c as any).client_id} currentUrl={(c as any).client?.contract_image_url} />
                  <DeleteButton id={c.id as any} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#F5F5F5] bg-[#F9F9F9]">
              <td className="p-2" colSpan={5}></td>
              <td className="p-2 font-bold text-brand-green-800 text-left">{Number((contracts || []).reduce((sum, x) => sum + Number((x as any).total_value || 0), 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Pagination
        pathname="/contracts"
        params={{ clientId, status }}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        count={count ?? 0}
      />
    </div>
  );
}
