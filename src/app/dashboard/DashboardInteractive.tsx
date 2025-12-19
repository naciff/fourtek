"use client";
import { useMemo, useState } from "react";

function PieInteractive({ data, colors, labels, onSelect }: { data: number[]; colors: string[]; labels: string[]; onSelect: (label: string) => void }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const radius = 60;
  const cx = 70;
  const cy = 70;
  let start = 0;
  const segments = data.map((v, i) => {
    const angle = (v / total) * Math.PI * 2;
    const seg = { v, label: labels[i], color: colors[i], start, end: start + angle };
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
          <path
            key={`seg-${i}`}
            d={arcPathFrom(seg.start, seg.end)}
            fill={seg.color}
            stroke="#fff"
            strokeWidth={1}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(seg.label)}
          />
        ))}
        {segments.map((seg, i) => {
          const mid = (seg.start + seg.end) / 2;
          const rx = cx + radius * 0.6 * Math.cos(mid);
          const ry = cy + radius * 0.6 * Math.sin(mid);
          return (
            <text key={`txt-${i}`} x={rx} y={ry} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={14} fontWeight={600}>
              {data[i]}
            </text>
          );
        })}
      </svg>
      <div className="text-sm grid gap-2">
        {labels.map((label, i) => (
          <button
            key={label}
            className="flex items-center gap-2 text-left"
            onClick={() => onSelect(label)}
            aria-label={`Filtrar por ${label}`}
          >
            <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: colors[i] }} />
            <span className="text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardInteractive({ clients, systems }: { clients: Array<{ id: string; name?: string; alias?: string; contract?: number; company_type?: string; city?: string; state?: string; situation?: string; cloud?: boolean; systems?: string[] }>, systems?: { data: number[]; labels: string[] } }) {
  const [filter, setFilter] = useState<{ type?: "situation" | "state" | "cloud" | "company_type" | "system"; value?: string } | null>(null);
  const counts = useMemo(() => {
    const sit = { Ativo: 0, Cancelado: 0, Aguardando: 0, Suspenso: 0 } as Record<string, number>;
    const uf = {} as Record<string, number>;
    let cloudYes = 0;
    let cloudNo = 0;
    let tipoCartorio = 0;
    let tipoEmpresa = 0;
    clients.forEach((c) => {
      const s = String(c.situation || "");
      if (s) sit[s] = (sit[s] || 0) + 1;
      const st = String(c.state || "").trim();
      if (st && s === "Ativo") uf[st] = (uf[st] || 0) + 1;
      if (s === "Ativo") { if (c.cloud) cloudYes++; else cloudNo++; }
      if (s === "Ativo") {
        const tipo = String(c.company_type || "").toLowerCase();
        if (tipo.includes("cart")) tipoCartorio++;
        else if (tipo.includes("empre")) tipoEmpresa++;
      }
    });
    const sortedEntries = Object.entries(uf).sort((a, b) => b[1] - a[1]);
    const TOP = 6;
    const top = sortedEntries.slice(0, TOP);
    const others = sortedEntries.slice(TOP);
    const othersSum = others.reduce((sum, [, count]) => sum + count, 0);
    const ufLabels = othersSum ? [...top.map((x) => x[0]), "Outros"] : top.map((x) => x[0]);
    const ufData = othersSum ? [...top.map((x) => x[1]), othersSum] : top.map((x) => x[1]);
    return {
      sitData: [sit["Ativo"] || 0, sit["Cancelado"] || 0, sit["Aguardando"] || 0, sit["Suspenso"] || 0],
      sitLabels: ["Ativo", "Cancelado", "Aguardando", "Suspenso"],
      ufData,
      ufLabels,
      cloudData: [cloudYes, cloudNo],
      cloudLabels: ["Sim", "Não"],
      tipoData: [tipoCartorio, tipoEmpresa],
      tipoLabels: ["Cartório", "Empresa"],
    };
  }, [clients]);

  const filtered = useMemo(() => {
    if (!filter?.type || !filter.value) return clients;
    if (filter.type === "situation") return clients.filter((c) => String(c.situation) === filter.value);
    if (filter.type === "state") return clients.filter((c) => String(c.state) === filter.value);
    if (filter.type === "cloud") return clients.filter((c) => String(c.situation) === "Ativo" && (filter.value === "Sim" ? c.cloud : !c.cloud));
    if (filter.type === "company_type") return clients.filter((c) => String(c.situation) === "Ativo" && String(c.company_type).toLowerCase().includes(String(filter.value).toLowerCase()));
    if (filter.type === "system") return clients.filter((c) => String(c.situation) === "Ativo" && Array.isArray(c.systems) && c.systems.includes(String(filter.value)));
    return clients;
  }, [clients, filter]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a: any, b: any) => Number(a.contract || 0) - Number(b.contract || 0));
  }, [filtered]);

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
          Clientes por Situação
        </div>
        <div className="mt-1">
          <PieInteractive
            data={counts.sitData}
            colors={["#10b981", "#ef4444", "#3b82f6", "#9ca3af"]}
            labels={counts.sitLabels}
            onSelect={(label) => setFilter({ type: "situation", value: label })}
          />
        </div>
      </div>
      <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
          Clientes por UF (Ativos)
        </div>
        <div className="mt-1">
          <PieInteractive
            data={counts.ufData}
            colors={["#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#f97316", "#14b8a6", "#ef4444"].slice(0, counts.ufLabels.length)}
            labels={counts.ufLabels}
            onSelect={(label) => setFilter({ type: "state", value: label })}
          />
        </div>
      </div>
      <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
          Cloud
        </div>
        <div className="mt-1">
          <PieInteractive
            data={counts.cloudData}
            colors={["#3b82f6", "#ef4444"]}
            labels={counts.cloudLabels}
            onSelect={(label) => setFilter({ type: "cloud", value: label })}
          />
        </div>
      </div>

      {(systems && systems.labels.length) ? (
        <div className="sm:col-span-3 grid sm:grid-cols-2 gap-4">
          <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
              Clientes por Sistemas (Ativos)
            </div>
            <div className="mt-1">
              <PieInteractive
                data={systems.data}
                colors={(function () {
                  const base = ["#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#06b6d4", "#84cc16", "#a855f7", "#22c55e"].slice(0, systems.labels.length);
                  return systems.labels.map((lbl, i) => {
                    if (lbl === "Tri7") return "#f59e0b"; // Amarelo
                    if (lbl === "DeMaria") return "#9ca3af"; // Cinza
                    if (lbl === "Softwiki") return "#ec4899"; // Rosa
                    return base[i];
                  });
                })()}
                labels={systems.labels}
                onSelect={(label) => setFilter({ type: "system", value: label })}
              />
            </div>
          </div>
          <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
              Clientes por Tipo de Empresa
            </div>
            <div className="mt-1">
              <PieInteractive
                data={counts.tipoData}
                colors={["#10b981", "#6366f1"]}
                labels={counts.tipoLabels}
                onSelect={(label) => setFilter({ type: "company_type", value: label })}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 sm:col-span-3 dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500">
            Clientes por Tipo de Empresa
          </div>
          <div className="mt-1">
            <PieInteractive
              data={counts.tipoData}
              colors={["#10b981", "#6366f1"]}
              labels={counts.tipoLabels}
              onSelect={(label) => setFilter({ type: "company_type", value: label })}
            />
          </div>
        </div>
      )}

      {filter?.type ? (
        <div className="relative sm:col-span-3 rounded-lg border border-gray-300 bg-white px-4 py-4 pt-5 dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-xs text-brand-green-700 dark:bg-gray-800 dark:text-brand-green-500 flex justify-between w-[calc(100%-16px)]">
            <span>Resultados</span>
          </div>
          <div className="absolute top-[-10px] right-4 bg-white px-1">
            <button className="text-sm text-brand-blue-700 hover:underline" onClick={() => setFilter(null)}>Limpar filtro</button>
          </div>

          <div className="mt-1">
            {filtered.length === 0 ? (
              <span className="text-sm text-gray-600">Nenhum cliente encontrado</span>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-brand-green-100 dark:bg-gray-900/50">
                  <tr>
                    <th className="text-left p-2 dark:text-gray-300">Contrato</th>
                    <th className="text-left p-2 dark:text-gray-300">Apelido</th>
                    <th className="text-left p-2 dark:text-gray-300">Tipo de Empresa</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((c) => (
                    <tr key={c.id} className="border-t dark:border-gray-700">
                      <td className="p-2 dark:text-gray-300">{c.contract as any}</td>
                      <td className="p-2 dark:text-gray-300">{c.alias || c.name}</td>
                      <td className="p-2 dark:text-gray-300">{c.company_type || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
