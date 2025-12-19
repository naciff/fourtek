"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { formatCNPJ } from "@/lib/format";

export default function FornecedoresPage() {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [form, setForm] = useState({ razao_social: "", cnpj: "", objeto: "", data_contrato: "", responsavel: "", contato: "", situacao: "Ativo", imagem_contrato: "" });
  useEffect(()=>{ (async()=>{ const res = await supabase.from('fornecedores').select('*').order('created_at', { ascending: false }); setRows(res.data||[]); })(); }, []);
  function maskDateBR(v:string){ const d=v.replace(/\D/g,'').slice(0,8); if(d.length<=2) return d; if(d.length<=4) return `${d.slice(0,2)}/${d.slice(2)}`; return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)}`; }
  function isoFromBR(v:string){ const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if(!m) return null; return `${m[3]}-${m[2]}-${m[1]}`; }
  function onChange(e:any){ const n=e.target.name; let v=e.target.value; if(n==='cnpj') v=formatCNPJ(v); if(n==='data_contrato') v=maskDateBR(v); setForm((f)=>({ ...f, [n]: v })); }
  async function onFile(e:any){ const file=e.target.files?.[0]; if(!file) return; const { data: userData } = await supabase.auth.getUser(); const uid=userData?.user?.id||'anon'; const path=`${uid}/fornecedores/${Date.now()}-${file.name}`; await supabase.storage.from('files').upload(path, file, { upsert:true }); const { data } = supabase.storage.from('files').getPublicUrl(path); setForm((f)=>({ ...f, imagem_contrato: data.publicUrl })); }
  async function onSubmit(e: FormEvent){ e.preventDefault(); setError(null); setLoading(true); const { data: userData } = await supabase.auth.getUser(); const uid=userData?.user?.id||null; if(!uid){ setLoading(false); setError('Usuário não autenticado'); return; } const payload:any={ user_id: uid, razao_social: form.razao_social||null, cnpj: form.cnpj||null, objeto: form.objeto||null, data_contrato: isoFromBR(form.data_contrato), responsavel: form.responsavel||null, contato: form.contato||null, situacao: form.situacao||null, imagem_contrato: form.imagem_contrato||null };
    const res=await supabase.from('fornecedores').insert(payload).select('id').single(); setLoading(false); if(res.error){ setError(res.error.message); return; } setForm({ razao_social: "", cnpj: "", objeto: "", data_contrato: "", responsavel: "", contato: "", situacao: "Ativo", imagem_contrato: "" }); const reload=await supabase.from('fornecedores').select('*').order('created_at', { ascending:false }); setRows(reload.data||[]); }
  async function onDelete(idRow:string){ const ok=confirm('Excluir este fornecedor?'); if(!ok) return; const res=await supabase.from('fornecedores').delete().eq('id', idRow); if(!res.error){ const reload=await supabase.from('fornecedores').select('*').order('created_at', { ascending:false }); setRows(reload.data||[]); } }
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Fornecedores</h1>
      <form className="grid sm:grid-cols-2 gap-3 bg-white rounded-lg border p-4" onSubmit={onSubmit}>
        <label className="grid gap-1"><span className="text-sm">Razão Social</span><input name="razao_social" value={form.razao_social} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">CNPJ</span><input name="cnpj" value={form.cnpj} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Objeto</span><input name="objeto" value={form.objeto} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Data Contrato</span><input name="data_contrato" placeholder="DD/MM/AAAA" value={form.data_contrato} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Responsável</span><input name="responsavel" value={form.responsavel} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Contato</span><input name="contato" value={form.contato} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Situação</span><select name="situacao" value={form.situacao} onChange={onChange} className="rounded border px-3 py-2"><option>Ativo</option><option>Suspenso</option><option>Encerrado</option></select></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Imagem Contrato</span><input type="file" accept="image/*,application/pdf,.pdf" onChange={onFile} /></label>
        {error && <div className="text-sm text-red-600 sm:col-span-2">{error}</div>}
        <div className="sm:col-span-2"><button disabled={loading} className="rounded bg-brand-green-600 text-white px-4 py-2">{loading? 'Salvando...' : 'Salvar'}</button></div>
      </form>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2C3E50] text-white"><tr><th className="text-left p-2">Razão Social</th><th className="text-left p-2">CNPJ</th><th className="text-left p-2">Situação</th><th className="text-left p-2">Ações</th></tr></thead>
          <tbody>
            {rows.length? rows.map((r:any, idx:number)=> (
              <tr key={r.id} className={`${idx%2===0?'bg-white':'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}><td className="p-2">{r.razao_social}</td><td className="p-2">{r.cnpj}</td><td className="p-2">{r.situacao}</td><td className="p-2"><button className="text-red-600" onClick={()=> onDelete(String(r.id))}>Excluir</button></td></tr>
            )) : (<tr className="border-t border-[#F5F5F5]"><td className="p-2 text-gray-600" colSpan={4}>Nenhum registro</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

