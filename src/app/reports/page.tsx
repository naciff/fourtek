"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const supabase = supabaseBrowser();
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [filters, setFilters] = useState({ clientId: "", status: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase
        .from("contracts")
        .select("status, total_value, client:clients(trade_name)")
        .match({
          ...(filters.clientId ? { client_id: filters.clientId } : {}),
          ...(filters.status ? { status: filters.status } : {}),
        }),
      supabase.from("clients").select("id, trade_name").order("trade_name"),
    ]).then(([c, cl]) => {
      setContracts(c.data ?? []);
      setClients(cl.data ?? []);
      setLoading(false);
    });
  }, [filters]);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  }

  function exportExcel() {
    const rows = contracts.map((c) => ({
      Cliente: (c as any).client?.trade_name,
      Situacao: c.status,
      Valor: c.total_value,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contratos");
    XLSX.writeFile(wb, "relatorio-contratos.xlsx");
  }

  function exportPdf() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Cliente", "Situação", "Valor"]],
      body: contracts.map((c) => [
        (c as any).client?.trade_name,
        c.status,
        String(c.total_value),
      ]),
    });
    doc.save("relatorio-contratos.pdf");
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Relatórios</h1>
      <div className="grid md:grid-cols-3 gap-2">
        <select name="clientId" value={filters.clientId} onChange={onChange} className="rounded border px-3 py-2">
          <option value="">Cliente</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.trade_name}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={onChange} className="rounded border px-3 py-2">
          <option value="">Situação</option>
          <option value="ativo">Ativo</option>
          <option value="encerrado">Encerrado</option>
          <option value="suspenso">Suspenso</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={exportExcel} className="rounded bg-brand-blue-600 px-3 py-1.5 text-white">Exportar Excel</button>
        <button onClick={exportPdf} className="rounded bg-brand-green-600 px-3 py-1.5 text-white">Exportar PDF</button>
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-blue-100">
              <tr>
                <th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Situação</th>
                <th className="text-left p-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{(c as any).client?.trade_name}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2">{Number(c.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}