"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "@/components/ui/Pagination";

export default function RespondentesInterinoPage() {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("clients").select("id, client_contract, alias, state, position").order("alias"),
      supabase.from("client_representatives").select("client_id, representative:representatives(full_name)"),
      supabase.from("contracts").select("id, client_id, status").eq("status", "ativo")
    ]).then(([cRes, linksRes, actRes]) => {
      const clients = (cRes.data || []).filter((c: any) => {
        const cargo = String((c as any).position || "").trim().toLowerCase();
        return cargo === "respondente (interino)" || (cargo.includes("respondente") && cargo.includes("interino"));
      });
      const activeSet = new Set<string>((actRes.data || []).map((a: any) => String(a.client_id)));
      const filtered = clients.filter((c: any) => activeSet.has(String(c.id)));
      const repMap = new Map<string, string[]>();
      (linksRes.data || []).forEach((l: any) => {
        const id = String(l.client_id);
        const name = String((l as any).representative?.full_name || "").trim();
        if (!name) return;
        const arr = repMap.get(id) || [];
        arr.push(name);
        repMap.set(id, arr);
      });
      let rows = filtered.map((c: any) => ({
        contrato: String(c.client_contract || '').padStart(3, '0'),
        apelido: c.alias,
        uf: c.state,
        representante: (repMap.get(String(c.id)) || []).join(", "),
        cargo: (c as any).position,
      })).sort((a: any, b: any) => Number(a.contrato || 0) - Number(b.contrato || 0));
      setRows(rows);
      setLoading(false);
    });
  }, []);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows.map((r) => ({
      Contrato: r.contrato,
      Apelido: r.apelido,
      UF: r.uf,
      Representante: r.representante,
      Cargo: r.cargo,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Respondentes");
    XLSX.writeFile(wb, "respondentes-interino.xlsx");
  }

  function exportPdf() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Contrato", "Apelido", "UF", "Representante", "Cargo"]],
      body: rows.map((r) => [r.contrato, r.apelido, r.uf, r.representante, r.cargo]),
    });
    doc.save("respondentes-interino.pdf");
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Respondentes (Interino)</h1>
      <div className="flex gap-2">
        <button onClick={exportExcel} className="rounded bg-brand-blue-600 px-3 py-1.5 text-white">Exportar Excel</button>
        <button onClick={exportPdf} className="rounded bg-brand-green-600 px-3 py-1.5 text-white">Exportar PDF</button>
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#2C3E50] text-white">
              <tr>
                <th scope="col" className="text-left p-2">Contrato</th>
                <th scope="col" className="text-left p-2">Apelido</th>
                <th scope="col" className="text-left p-2">UF</th>
                <th scope="col" className="text-left p-2">Representante</th>
                <th scope="col" className="text-left p-2">Cargo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}>
                  <td className="p-2">{r.contrato}</td>
                  <td className="p-2">{r.apelido}</td>
                  <td className="p-2">{r.uf}</td>
                  <td className="p-2">{r.representante}</td>
                  <td className="p-2">{r.cargo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2">
            <Pagination pathname="/reports/respondentes" params={{}} page={1} pageSize={rows.length || 1} totalPages={1} count={rows.length} sizes={[]} />
          </div>
        </div>
      )}
    </div>
  );
}
