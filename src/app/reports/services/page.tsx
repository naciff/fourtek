"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsServicesPage() {
  const supabase = supabaseBrowser();
  const [clients, setClients] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [svcLinks, setSvcLinks] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("clients").select("id, client_contract, alias, company_type, situation").order("alias"),
      supabase.from("client_representatives").select("client_id, representative:representatives(full_name)"),
      supabase.from("client_services").select("client_id, service:services(name)"),
      supabase.from("services").select("id,name").order("name")
    ]).then(([cRes, lRes, csRes, sRes]) => {
      setClients(cRes.data || []);
      setLinks(lRes.data || []);
      setSvcLinks(csRes.data || []);
      setServices(sRes.data || []);
      setLoading(false);
    });
  }, []);

  const repMap = useMemo(() => {
    const m = new Map<string, string[]>();
    (links || []).forEach((l: any) => {
      const id = String(l.client_id);
      const name = String((l as any).representative?.full_name || "").trim();
      if (!name) return;
      const arr = m.get(id) || [];
      arr.push(name);
      m.set(id, arr);
    });
    return m;
  }, [links]);

  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    const svcMap = new Map<string, string[]>();
    (svcLinks || []).forEach((l: any) => {
      const id = String(l.client_id);
      const name = String((l as any).service?.name || "").trim();
      if (!name) return;
      const arr = svcMap.get(id) || [];
      if (!arr.includes(name)) arr.push(name);
      svcMap.set(id, arr);
    });
    (clients || []).forEach((c: any) => {
      if (String(c.situation || "") !== "Ativo") return;
      const list = svcMap.get(String(c.id)) || [];
      const rep = (repMap.get(String(c.id)) || []).join(", ");
      if (!list.length) {
        const key = "Sem serviço";
        const arr = map.get(key) || [];
        arr.push({ contrato: c.client_contract, apelido: c.alias, tipo: c.company_type, representante: rep });
        map.set(key, arr);
      } else {
        list.forEach((svc) => {
          const arr = map.get(svc) || [];
          arr.push({ contrato: c.client_contract, apelido: c.alias, tipo: c.company_type, representante: rep });
          map.set(svc, arr);
        });
      }
    });
    let entries = Array.from(map.entries());
    if (selectedServices.length) {
      const set = new Set(selectedServices.map((s) => s.toLowerCase()));
      entries = entries.filter(([svc]) => set.has(String(svc).toLowerCase()));
    }
    return entries.sort((a, b) => a[0].localeCompare(b[0], "pt-BR", { sensitivity: "base" }));
  }, [clients, repMap, selectedServices, svcLinks]);

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    groups.forEach(([service, rows]) => {
      const safe = String(service).slice(0, 31) || "SemServico";
      const ws = XLSX.utils.json_to_sheet((rows as any[]).map((r) => ({
        Contrato: r.contrato,
        Apelido: r.apelido,
        Tipo: r.tipo,
        Representante: r.representante,
      })));
      XLSX.utils.book_append_sheet(wb, ws, safe);
    });
    XLSX.writeFile(wb, "servicos-por-cliente.xlsx");
  }

  function exportPdf() {
    const doc = new jsPDF();
    let y = 10;
    groups.forEach(([service, rows], idx) => {
      doc.setFontSize(12);
      doc.text(String(service), 10, y);
      autoTable(doc, {
        startY: y + 4,
        head: [["Contrato", "Apelido", "Tipo de Empresa", "Representante"]],
        body: (rows as any[]).map((r) => [r.contrato, r.apelido, r.tipo, r.representante]),
      });
      y = (doc as any).lastAutoTable.finalY + 10;
      if (idx < groups.length - 1 && y > 260) { doc.addPage(); y = 10; }
    });
    doc.save("servicos-por-cliente.pdf");
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Lista de Serviços</h1>
      <div className="rounded border bg-white p-3">
        <div className="text-sm font-medium text-brand-green-700 mb-2">Filtrar por serviço</div>
        <div className="flex flex-wrap gap-2">
          {services.map((s:any)=>{
            const name = String(s.name || "");
            const checked = selectedServices.includes(name);
            return (
              <label key={s.id} className="inline-flex items-center gap-1 text-sm">
                <input type="checkbox" checked={checked} onChange={(e)=>{
                  setSelectedServices((prev)=>{
                    if (e.target.checked) return [...prev, name];
                    return prev.filter((n)=> n !== name);
                  });
                }} />
                <span>{name}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={exportExcel} className="rounded bg-brand-blue-600 px-3 py-1.5 text-white">Exportar Excel</button>
        <button onClick={exportPdf} className="rounded bg-brand-green-600 px-3 py-1.5 text-white">Exportar PDF</button>
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {groups.map(([service, rows]) => (
            <div key={service} className="rounded-lg border bg-white overflow-hidden">
              <div className="px-3 py-2 font-medium text-[#0000FF]">{String(service)} <span className="ml-1 text-sm text-gray-600">({(rows as any[]).length})</span></div>
              <table className="w-full text-sm">
                <thead className="bg-[#2C3E50] text-white">
                  <tr>
                    <th scope="col" className="text-left p-2">Contrato</th>
                    <th scope="col" className="text-left p-2">Apelido</th>
                    <th scope="col" className="text-left p-2">Tipo de Empresa</th>
                    <th scope="col" className="text-left p-2">Representante</th>
                  </tr>
                </thead>
                <tbody>
                  {(rows as any[]).map((r, idx) => (
                    <tr key={idx} className={`${idx%2===0?'bg-white':'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}>
                      <td className="p-2">{r.contrato}</td>
                      <td className="p-2">{r.apelido}</td>
                      <td className="p-2">{r.tipo}</td>
                      <td className="p-2">{r.representante}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
