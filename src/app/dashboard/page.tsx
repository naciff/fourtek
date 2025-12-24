import { supabaseServer } from "@/lib/supabase-server";
import ClientsMap from "./ClientsMap";
import DashboardInteractive from "./DashboardInteractive";
import CountUp from "@/components/ui/CountUp";

function Pie({ data, colors, labels }: { data: number[]; colors: string[]; labels: string[] }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const radius = 60;
  const cx = 70;
  const cy = 70;
  let start = 0;
  const segments = data.map((v) => {
    const angle = (v / total) * Math.PI * 2;
    const seg = { v, start, end: start + angle };
    start += angle;
    return seg;
  });
  function arcPathFrom(s: number, e: number) {
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const largeArc = e - s > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }
  return (
    <div className="flex gap-4">
      <svg width={140} height={140} viewBox="0 0 140 140">
        {segments.map((seg, i) => (
          <path key={`seg-${i}`} d={arcPathFrom(seg.start, seg.end)} fill={colors[i]} stroke="#fff" strokeWidth={1} />
        ))}
        {segments.map((seg, i) => {
          const mid = (seg.start + seg.end) / 2;
          const rx = cx + radius * 0.6 * Math.cos(mid);
          const ry = cy + radius * 0.6 * Math.sin(mid);
          return (
            <text
              key={`txt-${i}`}
              x={rx}
              y={ry}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={14}
              fontWeight={600}
            >
              {data[i]}
            </text>
          );
        })}
      </svg>
      <div className="text-sm grid gap-2">
        {data.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: colors[i] }} />
            <span className="text-gray-700">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const all = await supabase.from("clients").select("situation,state");
  const rows = all.data || [];
  const active = rows.filter((r: any) => r.situation === "Ativo").length;
  const canceled = rows.filter((r: any) => r.situation === "Cancelado").length;
  const map: Record<string, number> = {};
  rows.forEach((r: any) => { const uf = String(r.state || "").trim(); if (uf) map[uf] = (map[uf] || 0) + 1; });
  const ufCounts = Object.entries(map).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  const reps = await supabase.from("representatives").select("id,full_name,birth_date");
  const repsData = reps.data || [];
  const repLinks = await supabase.from("client_representatives").select("representative_id, client:clients(alias, trade_name)");
  const repClientsMap = new Map<string, string[]>();
  (repLinks.data || []).forEach((row: any) => {
    const rid = String(row.representative_id);
    const name = String(row?.client?.alias || row?.client?.trade_name || "").trim();
    if (!name) return;
    const arr = repClientsMap.get(rid) || [];
    arr.push(name);
    repClientsMap.set(rid, arr);
  });
  const now = new Date();
  const mmNow = String(now.getMonth() + 1).padStart(2, "0");
  const monthBirthdays = repsData
    .filter((r: any) => typeof r.birth_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.birth_date) && r.birth_date.slice(5, 7) === mmNow)
    .map((r: any) => ({ id: r.id, name: r.full_name, day: r.birth_date.slice(8, 10), clients: repClientsMap.get(String(r.id)) || [] }))
    .sort((a: any, b: any) => parseInt(a.day) - parseInt(b.day));



  // Totais: contratos (ativos), cloud (itens) e investimento (inventário) – totais gerais
  const contractsTotals = await supabase.from("contracts").select("total_value,status");
  const totalContracts = (contractsTotals.data || [])
    .filter((c: any) => String(c.status || "") === "ativo")
    .reduce((sum: number, c: any) => sum + Number(c.total_value || 0), 0);

  const cloudServices = await supabase
    .from("services")
    .select("id,slug,name")
    .or("slug.ilike.%cloud%,name.ilike.%cloud%");
  const cloudServiceIds: string[] = (cloudServices.data || []).map((s: any) => s.id);
  const activeContractsRes = await supabase.from("contracts").select("id, client_id").eq("status", "ativo");
  const activeContractIds: string[] = (activeContractsRes.data || []).map((c: any) => c.id);
  const cloudById = cloudServiceIds.length && activeContractIds.length
    ? await supabase.from("contract_items").select("id,quantity,unit_price,discount,service_id,contract_id").in("service_id", cloudServiceIds).in("contract_id", activeContractIds)
    : { data: [] } as any;
  const cloudByName = activeContractIds.length
    ? await supabase
      .from("contract_items")
      .select("id,quantity,unit_price,discount,service_name_snapshot,contract_id")
      .ilike("service_name_snapshot", "%cloud%")
      .in("contract_id", activeContractIds)
    : { data: [] } as any;
  const cloudMap = new Map<string, any>();
  (cloudById.data || []).forEach((it: any) => cloudMap.set(String(it.id), it));
  (cloudByName.data || []).forEach((it: any) => cloudMap.set(String(it.id), it));
  const totalCloud = Array.from(cloudMap.values()).reduce((sum: number, it: any) => sum + (Number(it.quantity || 0) * Number(it.unit_price || 0) - Number(it.discount || 0)), 0);

  let totalInventory = 0;
  try {
    const inv = await supabase.from("inventario").select("valor");
    totalInventory = (inv.data || []).reduce((sum: number, r: any) => sum + parseFloat(String(r.valor ?? 0)), 0);
  } catch { }

  const svcLinks = await supabase.from("client_services").select("client_id, service:services(slug,name)");
  const cloudIds = new Set<string>();
  (svcLinks.data || []).forEach((row: any) => {
    const slug = String(row?.service?.slug || "").toLowerCase();
    const name = String(row?.service?.name || "").toLowerCase();
    if (slug.includes("cloud") || name.includes("cloud")) cloudIds.add(row.client_id);
  });
  const clientsRes = await supabase.from("clients").select("*");
  const withCoords = (clientsRes.data || [])
    .map((c: any) => ({ id: c.id, name: c.trade_name || c.alias || c.corporate_name, address: [c.street, c.number, c.complement, c.neighborhood, c.city, c.state, c.zip].filter((v: any) => String(v || "").trim()).join(", "), lat: c.latitude ? Number(c.latitude) : undefined, lng: c.longitude ? Number(c.longitude) : undefined }))
    .filter((p: any) => typeof p.lat === "number" && typeof p.lng === "number");

  const clientsAll = await supabase.from("clients").select("id, trade_name, alias, city, state, situation, company_type, client_contract");
  const clientList: any[] = clientsAll.data || [];
  let clientsForInteractive = clientList.map((c: any) => ({ id: c.id, name: c.trade_name || c.alias || c.corporate_name, alias: c.alias, contract: c.client_contract, company_type: c.company_type, city: c.city, state: c.state, situation: c.situation, cloud: cloudIds.has(c.id) }));
  const activeClientIds = new Set<string>(clientList.filter((c: any) => String(c.situation) === "Ativo").map((c: any) => c.id));
  const sistemasLinks = await supabase.from("client_sistemas").select("client_id, sistema:sistemas(name)");
  const sistemasCountMap = new Map<string, number>();
  (sistemasLinks.data || []).forEach((row: any) => {
    const cid = String(row.client_id || "");
    if (!activeClientIds.has(cid)) return;
    const name = String(row?.sistema?.name || "Outro");
    sistemasCountMap.set(name, (sistemasCountMap.get(name) || 0) + 1);
  });
  const sistemasLabels = Array.from(sistemasCountMap.keys());
  const sistemasData = sistemasLabels.map((l) => sistemasCountMap.get(l) || 0);
  const clientSystemsMap = new Map<string, string[]>();
  (sistemasLinks.data || []).forEach((row: any) => {
    const cid = String(row.client_id || "");
    const name = String(row?.sistema?.name || "Outro");
    const arr = clientSystemsMap.get(cid) || [];
    arr.push(name);
    clientSystemsMap.set(cid, arr);
  });
  clientsForInteractive = clientList.map((c: any) => ({ id: c.id, name: c.trade_name || c.alias || c.corporate_name, alias: c.alias, contract: c.client_contract, company_type: c.company_type, city: c.city, state: c.state, situation: c.situation, cloud: cloudIds.has(c.id), systems: clientSystemsMap.get(c.id) || [] }));

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Dashboard</h1>
      <div className="flex justify-end">
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-600">
          <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
            Valor Total de Entradas
          </div>
          <div className="text-2xl font-bold text-brand-green-800 dark:text-brand-green-400">
            <CountUp end={Number(totalContracts)} currency />
          </div>
        </div>
        <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-600">
          <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
            Valor Total Backup (Cloud)
          </div>
          <div className="text-2xl font-bold text-brand-green-800 dark:text-brand-green-400">
            <CountUp end={Number(totalCloud)} currency />
          </div>
        </div>
        <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-600">
          <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-red-600 dark:bg-gray-800 dark:text-red-500">
            Total de Investimento
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            <CountUp end={Number(totalInventory)} currency />
          </div>
        </div>
      </div>
      <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
          Aniversariantes do mês
        </div>
        <div className="mt-1 grid gap-2 sm:grid-cols-3">
          {monthBirthdays.length === 0 ? (
            <span className="text-sm text-gray-600">Nenhum aniversariante neste mês</span>
          ) : (
            monthBirthdays.map((r: any) => (
              <div key={`${r.name}-${r.day}`} className="rounded-xl bg-green-50 border border-green-100 p-2 flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold">
                  <span>{r.day}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-700"><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h16zm-2-7a3 3 0 0 0-3 3h-1a3 3 0 0 0-3-3c-1.654 0-3 1.346-3 3h-1v3h16V8h-1a3 3 0 0 0-3-3zm-7 0a1 1 0 0 1 1 1v2H9V6a1 1 0 0 1 1-1zm6 0a1 1 0 0 1 1 1v2h-3V6a1 1 0 0 1 1-1z" /></svg>
                </div>
                <div className="flex-1">
                  <div className="text-green-800 font-semibold text-xs leading-tight">{r.name}</div>
                  {r.clients.length ? (
                    <div className="text-[10px] text-gray-700 mt-1 leading-tight">{r.clients.join(", ")}</div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DashboardInteractive clients={clientsForInteractive} systems={{ data: sistemasData, labels: sistemasLabels }} />
      <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-600">
        <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
          Mapa de Clientes
        </div>
        <div className="mt-1">
          <ClientsMap points={withCoords} />
        </div>
      </div>
    </div>
  );
}
