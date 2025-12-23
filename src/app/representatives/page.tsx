import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import Pagination from "@/components/ui/Pagination";

function isoToDayMonth(v: string | null | undefined) {
  const s = String(v || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s.slice(8, 10)}/${s.slice(5, 7)}`;
  return "";
}

export default async function RepresentativesListPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const supabase = supabaseServer();
  const q = searchParams?.q || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1"));
  const pageSizeRaw = parseInt(searchParams?.pageSize || "20");
  const pageSize = [20, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const viewId = searchParams?.view || "";
  let cq = supabase.from("representatives").select("id", { count: "exact", head: true });
  if (q) cq = cq.ilike("full_name", `%${q}%`);
  const { count } = await cq;
  let lq = supabase.from("representatives").select("id, full_name, cpf, email, phone, birth_date").order("full_name");
  if (q) lq = lq.ilike("full_name", `%${q}%`);
  const { data: reps } = await lq.range(from, to);
  const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;
  const viewRep = viewId ? (await supabase.from("representatives").select("*", { count: "exact" }).eq("id", viewId).single()).data : null;
  let companies: any[] = [];
  if (viewId) {
    const compRes = await supabase
      .from("client_representatives")
      .select("client:clients(client_contract, alias, trade_name, situation, company_type)")
      .eq("representative_id", viewId);
    const raw = compRes.data || [];
    companies = raw
      .map((l: any) => {
        const cl = (l as any).client || {};
        return {
          contract: cl.client_contract,
          situation: cl.situation,
          alias: cl.alias || cl.trade_name,
          company_type: cl.company_type,
        };
      })
      .filter((x: any) => x.alias);
  }
  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-brand-blue-800 dark:text-brand-blue-400">Representantes</h1>
        <Link href="/representatives/new" className="rounded bg-brand-green-600 px-3 py-1.5 text-white hover:bg-brand-green-700 transition-colors">Novo representante</Link>
      </div>
      <form className="grid sm:grid-cols-5 gap-2">
        <input name="q" placeholder="Nome" defaultValue={q} className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 sm:col-span-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-brand-green-600 outline-none" />
        <div className="flex items-center gap-2 sm:col-span-2">
          <button className="rounded bg-brand-green-600 px-3 py-2 text-white hover:bg-brand-green-700 transition-colors">Filtrar</button>
          <Link href="/representatives" className="text-sm text-brand-blue-700 dark:text-brand-blue-400 hover:underline">Limpar filtro</Link>
        </div>
      </form>
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-gray-700 dark:text-gray-300">
          <thead className="bg-[#2C3E50] dark:bg-gray-950 text-white">
            <tr>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">CPF</th>
              <th className="text-left p-2">Telefone</th>
              <th className="text-left p-2">Aniversário</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {reps?.map((r, idx) => (
              <tr key={r.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800/40' : 'bg-[#F9F9F9] dark:bg-gray-800/60'} border-t border-[#F5F5F5] dark:border-gray-700/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
                <td className="p-2">
                  <Link href={{ pathname: "/representatives", query: { q, pageSize, page, view: (r as any).id } }} className="text-brand-blue-700 dark:text-brand-blue-400 font-medium">
                    {r.full_name}
                  </Link>
                </td>
                <td className="p-2">{r.cpf}</td>
                <td className="p-2">{r.phone}</td>
                <td className="p-2">{isoToDayMonth((r as any).birth_date)}</td>
                <td className="p-2 flex gap-2">
                  <Link href={`/representatives/${r.id}`} className="text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors" title="Editar" aria-label="Editar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" /></svg>
                  </Link>
                  <Link href={`/representatives/${r.id}/contracts`} className="text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors" title="Contratos" aria-label="Contratos">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M14 2v6h6" /></svg>
                  </Link>
                  <DeleteButton id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewRep ? (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-4">
              <h2 className="text-lg font-bold text-brand-blue-800 dark:text-brand-blue-400">Visualizar Representante</h2>
              <Link href={{ pathname: "/representatives", query: { q, pageSize, page } }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Fechar" aria-label="Fechar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-1 sm:col-span-2"><span className="text-sm text-gray-700 dark:text-gray-300">Nome Completo</span><input readOnly value={String((viewRep as any)?.full_name ?? "")} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></label>
              <label className="grid gap-1"><span className="text-sm text-gray-700 dark:text-gray-300">CPF</span><input readOnly value={String((viewRep as any)?.cpf ?? "")} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></label>
              <label className="grid gap-1"><span className="text-sm text-gray-700 dark:text-gray-300">RG</span><input readOnly value={String((viewRep as any)?.rg ?? "")} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></label>
              <label className="grid gap-1"><span className="text-sm text-gray-700 dark:text-gray-300">Celular</span><input readOnly value={String((viewRep as any)?.phone ?? "")} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></label>
              <label className="grid gap-1"><span className="text-sm text-gray-700 dark:text-gray-300">E-mail</span><input readOnly value={String((viewRep as any)?.email ?? "")} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></label>
              <label className="grid gap-1"><span className="text-sm text-gray-700 dark:text-gray-300">Data de Aniversário</span><input readOnly value={isoToDayMonth((viewRep as any)?.birth_date)} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></label>
              <div className="sm:col-span-2 grid gap-1 mt-2">
                <span className="text-sm text-brand-blue-800 dark:text-brand-blue-400 font-bold">Empresas Vinculadas</span>
                <div className="rounded-lg border dark:border-gray-700 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-200">
                      <tr>
                        <th className="text-left p-2">Contrato</th>
                        <th className="text-left p-2">Situação</th>
                        <th className="text-left p-2">Apelido</th>
                        <th className="text-left p-2">Tipo de Empresa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.sort((a: any, b: any) => Number(a.contract || 0) - Number(b.contract || 0)).map((c: any, idx: number) => (
                        <tr key={idx} className={`border-t dark:border-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800/40' : 'bg-[#F9F9F9] dark:bg-gray-800/60'} text-gray-700 dark:text-gray-300`}>
                          <td className="p-2">{String(c.contract || '').padStart(3, '0')}</td>
                          <td className="p-2">{c.situation}</td>
                          <td className="p-2">{c.alias}</td>
                          <td className="p-2">{c.company_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-end">
        <Link href="/representatives" className="text-sm text-brand-blue-700">Limpar filtro</Link>
      </div>
      <Pagination
        pathname="/representatives"
        params={{ q }}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        count={count ?? 0}
      />
    </div>
  );
}
