"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ColaboradoresPage() {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [form, setForm] = useState({ foto: "", nome: "", cargo: "", estado_civil: "", cpf: "", data_nascimento: "", endereco: "", email: "", contato_empresa: "", contato_particular: "", data_contratacao: "", valor_salario: "", imagem_confiabilidade: "" });
  useEffect(()=>{ (async()=>{ const res = await supabase.from('colaboradores').select('*').order('created_at', { ascending: false }); setRows(res.data||[]); })(); }, []);
  function maskDateBR(v:string){ const d=v.replace(/\D/g,'').slice(0,8); if(d.length<=2) return d; if(d.length<=4) return `${d.slice(0,2)}/${d.slice(2)}`; return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)}`; }
  function isoFromBR(v:string){ const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if(!m) return null; return `${m[3]}-${m[2]}-${m[1]}`; }
  function onChange(e:any){ const n=e.target.name; let v=e.target.value; if(n==='data_nascimento' || n==='data_contratacao') v=maskDateBR(v); setForm((f)=>({ ...f, [n]: v })); }
  async function onFile(e:any, field:string){ const file=e.target.files?.[0]; if(!file) return; const { data: userData } = await supabase.auth.getUser(); const uid=userData?.user?.id||'anon'; const path=`${uid}/colaboradores/${Date.now()}-${file.name}`; await supabase.storage.from('files').upload(path, file, { upsert:true }); const { data } = supabase.storage.from('files').getPublicUrl(path); setForm((f)=>({ ...f, [field]: data.publicUrl })); }
  async function onSubmit(e: FormEvent){ e.preventDefault(); setError(null); setLoading(true); const { data: userData } = await supabase.auth.getUser(); const uid=userData?.user?.id||null; if(!uid){ setLoading(false); setError('Usuário não autenticado'); return; } const payload:any={ user_id: uid, foto: form.foto||null, nome: form.nome||null, cargo: form.cargo||null, estado_civil: form.estado_civil||null, cpf: form.cpf||null, data_nascimento: isoFromBR(form.data_nascimento), endereco: form.endereco||null, email: form.email||null, contato_empresa: form.contato_empresa||null, contato_particular: form.contato_particular||null, data_contratacao: isoFromBR(form.data_contratacao), valor_salario: form.valor_salario? Number(String(form.valor_salario).replace(/,/g,'.')): null, imagem_confiabilidade: form.imagem_confiabilidade||null };
    const res=await supabase.from('colaboradores').insert(payload).select('id').single(); setLoading(false); if(res.error){ setError(res.error.message); return; } setForm({ foto: "", nome: "", cargo: "", estado_civil: "", cpf: "", data_nascimento: "", endereco: "", email: "", contato_empresa: "", contato_particular: "", data_contratacao: "", valor_salario: "", imagem_confiabilidade: "" }); const reload=await supabase.from('colaboradores').select('*').order('created_at', { ascending:false }); setRows(reload.data||[]); }
  async function onDelete(idRow:string){ const ok=confirm('Excluir este colaborador?'); if(!ok) return; const res=await supabase.from('colaboradores').delete().eq('id', idRow); if(!res.error){ const reload=await supabase.from('colaboradores').select('*').order('created_at', { ascending:false }); setRows(reload.data||[]); } }
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Colaboradores</h1>
      <form className="grid sm:grid-cols-2 gap-3 bg-white rounded-lg border p-4" onSubmit={onSubmit}>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Foto</span><input type="file" accept="image/*" onChange={(e)=> onFile(e,'foto')} /></label>
        <label className="grid gap-1"><span className="text-sm">Nome</span><input name="nome" value={form.nome} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Cargo</span><input name="cargo" value={form.cargo} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Estado Civil</span><input name="estado_civil" value={form.estado_civil} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">CPF</span><input name="cpf" value={form.cpf} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Data de Nascimento</span><input name="data_nascimento" placeholder="DD/MM/AAAA" value={form.data_nascimento} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Endereço</span><input name="endereco" value={form.endereco} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">E-mail</span><input type="email" name="email" value={form.email} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Contato Empresa</span><input name="contato_empresa" value={form.contato_empresa} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Contato Particular</span><input name="contato_particular" value={form.contato_particular} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Data Contratação</span><input name="data_contratacao" placeholder="DD/MM/AAAA" value={form.data_contratacao} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Valor Salário</span><input type="number" step="0.01" name="valor_salario" value={form.valor_salario} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Imagem Confiabilidade</span><input type="file" accept="image/*" onChange={(e)=> onFile(e,'imagem_confiabilidade')} /></label>
        {error && <div className="text-sm text-red-600 sm:col-span-2">{error}</div>}
        <div className="sm:col-span-2"><button disabled={loading} className="rounded bg-brand-green-600 text-white px-4 py-2">{loading? 'Salvando...' : 'Salvar'}</button></div>
      </form>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2C3E50] text-white"><tr><th className="text-left p-2">Nome</th><th className="text-left p-2">Cargo</th><th className="text-left p-2">E-mail</th><th className="text-left p-2">Ações</th></tr></thead>
          <tbody>
            {rows.length? rows.map((r:any, idx:number)=> (
              <tr key={r.id} className={`${idx%2===0?'bg-white':'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}><td className="p-2">{r.nome}</td><td className="p-2">{r.cargo}</td><td className="p-2">{r.email}</td><td className="p-2"><button className="text-red-600" onClick={()=> onDelete(String(r.id))}>Excluir</button></td></tr>
            )) : (<tr className="border-t border-[#F5F5F5]"><td className="p-2 text-gray-600" colSpan={4}>Nenhum registro</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

