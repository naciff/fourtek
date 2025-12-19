'use client';
import React, { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function InventarioPage() {
  const supabase = supabaseBrowser();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [itemQuery, setItemQuery] = useState("");
  const [form, setForm] = useState({
    codigo: "",
    data_compra: "",
    grupo: "Ferramentas",
    item: "",
    qtd: "1",
    marca: "",
    modelo: "",
    valor: "0",
    nota_fiscal: "",
    observacao: "",
  });

  function maskDateBR(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
    return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)}`;
  }
  function brToISO(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    return `${m[3]}-${m[2]}-${m[1]}`;
  }
  function isoToBR(v: any) {
    const s = String(v || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}`;
    return s;
  }
  function numBR(v: any) {
    const s = String(v ?? "").trim();
    if (!s) return 0;
    if (/^[0-9]+([.,][0-9]+)?$/.test(s)) {
      const normalized = s.replace(/\./g, "").replace(",", ".");
      const n = Number(normalized);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  function valorNumero(v: any): number {
    const s = String(v ?? "");
    let n = numBR(s);
    if (n >= 10000 && !/,/.test(s)) n = n / 100;
    return n;
  }
  function valorFmt(v: any): string {
    return valorNumero(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  async function load() {
    try {
      setError(null);
      let q = supabase
        .from("inventario")
        .select("id,codigo,data_compra,grupo,item,qtd,marca,modelo,valor,nota_fiscal,observacao");
      if (filterGroup && filterGroup !== "Todos") q = q.eq("grupo", filterGroup);
      const res = await q.order("grupo", { ascending: true }).order("data_compra", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
    } catch (err: any) {
      setItems([]);
      setError(err?.message || "Falha ao carregar inventário");
    }
  }
  useEffect(()=>{ void load(); }, [filterGroup]);

  function onChange(e: React.ChangeEvent<any>) {
    const name = e.target.name;
    let val: any = e.target.value;
    if (name === "data_compra") val = e.target.value;
    if (name === "qtd") val = String(val).replace(/[^0-9]/g, "");
    if (name === "valor") val = String(val).replace(/[^0-9.,]/g, "");
    setForm((f)=> ({ ...f, [name]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id || null;
    if (!uid) { setLoading(false); setError("Usuário não autenticado"); return; }
    const codigo = form.codigo.trim();
    const itemNome = form.item.trim();
    const qtdNum = Number(form.qtd || "0");
    const valorNum = numBR(form.valor);
    const dataISO = brToISO(form.data_compra || new Date().toISOString().slice(0,10));
    if (!codigo) { setLoading(false); setError("Informe o código do item"); return; }
    if (!itemNome) { setLoading(false); setError("Informe o nome do item"); return; }
    if (!dataISO) { setLoading(false); setError("Data da compra inválida (DD/MM/AAAA)"); return; }
    if (!Number.isFinite(qtdNum) || qtdNum <= 0) { setLoading(false); setError("Quantidade deve ser maior que zero"); return; }
    if (!Number.isFinite(valorNum) || valorNum < 0) { setLoading(false); setError("Valor não pode ser negativo"); return; }
    const payload = {
      codigo,
      data_compra: dataISO,
      grupo: form.grupo,
      item: itemNome,
      qtd: qtdNum,
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      valor: valorNum,
      nota_fiscal: form.nota_fiscal.trim(),
      observacao: form.observacao.trim(),
      user_id: uid,
    };
    try {
      const res = editId
        ? await supabase.from("inventario").update(payload).eq("id", editId).select("id").single()
        : await supabase.from("inventario").insert(payload).select("id").single();
      if (res.error) throw new Error(res.error.message);
      setForm({ codigo: "", data_compra: "", grupo: "Ferramentas", item: "", qtd: "1", marca: "", modelo: "", valor: "0", nota_fiscal: "", observacao: "" });
      setEditId(null);
      setShowForm(false);
      setPage(1);
      void load();
    } catch (err: any) {
      setError(err?.message || "Falha ao salvar item");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    try {
      const ok = confirm("Deseja excluir este item?");
      if (!ok) return;
      const res = await supabase.from("inventario").delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
      setPage(1);
      void load();
    } catch (err: any) {
      setError(err?.message || "Falha ao excluir item");
    }
  }

  async function claimOrphanItems() {
    try {
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id || null;
      if (!uid) { setError("Usuário não autenticado"); return; }
      const res = await supabase
        .from("inventario")
        .update({ user_id: uid })
        .is("user_id", null)
        .select("id");
      if (res.error) throw new Error(res.error.message);
      setPage(1);
      void load();
    } catch (err: any) {
      setError(err?.message || "Falha ao assumir itens");
    }
  }

  const grouped = items.reduce((acc: Record<string, any[]>, curr: any) => {
    const g = String(curr?.grupo || "Outros");
    if (!acc[g]) acc[g] = [];
    acc[g].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const sorted = [...items].sort((a: any, b: any) => String(a?.codigo || "").localeCompare(String(b?.codigo || ""), "pt-BR", { numeric: true, sensitivity: "base" }));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = sorted.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  return (
    <div className="grid gap-4 p-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Inventário</h1>
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Pesquisar item..." value={itemQuery} onChange={(e)=> setItemQuery(e.target.value)} className="rounded border px-3 py-2 w-full sm:w-64" />
        <select value={filterGroup} onChange={(e)=> setFilterGroup(e.target.value)} className="rounded border px-3 py-2">
          <option value="">Todos</option>
          <option>Ferramentas</option>
          <option>Equipamento Informática</option>
        </select>
        <button onClick={claimOrphanItems} className="rounded bg-brand-blue-700 text-white px-3 py-2 text-sm">Assumir itens antigos</button>
        <button onClick={()=> { const maxCode = items.reduce((m:number, r:any)=> Math.max(m, Number(String(r?.codigo||"").replace(/\D/g, "")) || 0), 0); setEditId(null); setForm({ codigo: String(maxCode+1), data_compra: new Date().toISOString().slice(0,10), grupo: "Ferramentas", item: "", qtd: "1", marca: "", modelo: "", valor: "0", nota_fiscal: "", observacao: "" }); setShowForm(true); }} className="rounded bg-brand-green-600 text-white px-3 py-2 text-sm">Novo item</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {showForm ? (
        <form className="grid sm:grid-cols-2 gap-3 bg-white rounded-lg border p-4" onSubmit={onSubmit}>
          <label className="grid gap-1"><span className="text-sm">Código</span><input name="codigo" value={form.codigo} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm">Data da Compra</span><input lang="pt-BR" type="date" name="data_compra" value={form.data_compra} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm">Grupo</span>
            <select name="grupo" value={form.grupo} onChange={onChange} className="rounded border px-3 py-2">
              <option>Ferramentas</option>
              <option>Equipamento Informática</option>
            </select>
          </label>
          <label className="grid gap-1"><span className="text-sm">Qtd</span><input name="qtd" value={form.qtd} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Item</span><input name="item" value={form.item} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm">Marca</span><input name="marca" value={form.marca} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm">Modelo</span><input name="modelo" value={form.modelo} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm">Valor</span><input type="number" step="0.01" name="valor" value={form.valor} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm">Nota Fiscal</span><input name="nota_fiscal" value={form.nota_fiscal} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Observação</span><input name="observacao" value={form.observacao} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <div className="sm:col-span-2 flex gap-2">
            <button disabled={loading} className="rounded bg-brand-green-600 text-white px-4 py-2">{loading? (editId?"Atualizando...":"Salvando...") : (editId?"Atualizar":"Salvar")}</button>
            <button type="button" className="rounded bg-gray-200 text-gray-800 px-4 py-2" onClick={()=> { setShowForm(false); setEditId(null); }}>Cancelar</button>
          </div>
        </form>
      ) : null}

      {(() => {
        const base = items.filter((x:any)=> String(x?.item||"").toLowerCase().includes(String(itemQuery||"").toLowerCase()));
        if (!base.length) return null;
        const byGroup: Record<string, number> = {};
        for (const r of base) {
          const g = String(r?.grupo || "Outros");
          byGroup[g] = (byGroup[g] || 0) + valorNumero(r?.valor);
        }
        return (
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(byGroup).map(([g, total]) => (
              <div key={`sum-${g}`} className="inline-flex items-center rounded bg-brand-green-50 border px-2 py-1 text-sm">
                <span className="font-medium text-brand-blue-800">{g}</span>
                <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-800">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2C3E50] text-white"><tr><th scope="col" className="text-left p-2">Código</th><th scope="col" className="text-left p-2">Data da Compra</th><th scope="col" className="text-left p-2">Item</th><th scope="col" className="text-right p-2">Qtd</th><th scope="col" className="text-right p-2">Valor</th><th scope="col" className="text-left p-2">Ações</th></tr></thead>
          <tbody>
            {(() => {
              const base = items.filter((x:any)=> String(x?.item||"").toLowerCase().includes(String(itemQuery||"").toLowerCase()));
              const sortedLocal = [...base].sort((a:any,b:any)=> String(a?.codigo||"").localeCompare(String(b?.codigo||""), 'pt-BR', { numeric:true, sensitivity:'base' }));
              const startIdx = (page-1)*pageSize;
              const pageRows = sortedLocal.slice(startIdx, startIdx+pageSize);
              return pageRows.length ? pageRows.map((it:any, idx:number)=> (
                <tr key={String(it.id)} className={`${idx%2===0?'bg-white':'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}>
                  <td className="p-2">{it.codigo}</td>
                  <td className="p-2">{isoToBR(it.data_compra)}</td>
                  <td className="p-2">{it.item}</td>
                  <td className="p-2 text-right">{it.qtd}</td>
                  <td className="p-2 text-right font-bold">{valorFmt(it.valor)}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-gray-400" title="Editar" aria-label="Editar" onClick={()=> { setEditId(String(it.id)); setForm({ codigo: it.codigo||"", data_compra: String(it.data_compra||"").slice(0,10), grupo: it.grupo||"Ferramentas", item: it.item||"", qtd: String(it.qtd||"1"), marca: it.marca||"", modelo: it.modelo||"", valor: String(it.valor||"0"), nota_fiscal: it.nota_fiscal||"", observacao: it.observacao||"" }); setShowForm(true); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
                    </button>
                    <button className="text-gray-400" title="Excluir" aria-label="Excluir" onClick={()=> onDelete(String(it.id))}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12l-1 14H7L6 7z"/><path d="M9 4h6l1 2H8l1-2z"/></svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr className="border-t"><td className="p-2 text-gray-600" colSpan={6}>Nenhum item</td></tr>
              );
            })()}
          </tbody>
          <tfoot>
            {(() => {
              const base = items.filter((x:any)=> String(x?.item||"").toLowerCase().includes(String(itemQuery||"").toLowerCase()));
              const sortedLocal = [...base].sort((a:any,b:any)=> String(a?.codigo||"").localeCompare(String(b?.codigo||""), 'pt-BR', { numeric:true, sensitivity:'base' }));
              const startIdx = (page-1)*pageSize;
              const pageRows = sortedLocal.slice(startIdx, startIdx+pageSize);
              const total = pageRows.reduce((sum:number, it:any)=> sum + valorNumero(it?.valor), 0);
              return (
                <tr className="border-t bg-brand-green-100">
                  <td className="p-2" colSpan={4}></td>
                  <td className="p-2 font-bold text-brand-green-800 text-right">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="p-2"></td>
                </tr>
              );
            })()}
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-sm text-gray-700">Itens por página:</span>
        {[20,50,100].map((n)=> (
          <button key={`ps-${n}`} onClick={()=> { setPageSize(n); setPage(1); }} className={`rounded px-2 py-1 text-sm ${pageSize===n? 'bg-brand-green-600 text-white':'bg-gray-200 text-gray-800'}`}>{n}</button>
        ))}
        <span className="ml-4 text-sm text-gray-700">Página {page} de {totalPages}</span>
        <button className="ml-2 rounded bg-gray-200 text-gray-800 px-2 py-1 text-sm" onClick={()=> setPage(Math.max(1, page-1))}>Anterior</button>
        <button className="rounded bg-gray-200 text-gray-800 px-2 py-1 text-sm" onClick={()=> setPage(Math.min(totalPages, page+1))}>Próxima</button>
      </div>
    </div>
  );
}
