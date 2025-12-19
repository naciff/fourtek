"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function GestaoPage() {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [form, setForm] = useState({ grupo: "Pagamentos", descricao: "", usuario: "", senha: "", link: "", observacao: "", arquivo: "" });
  useEffect(()=>{ (async()=>{ const res = await supabase.from('gestao').select('*').order('created_at', { ascending: false }); setRows(res.data||[]); })(); }, []);
  function onChange(e:any){ const n=e.target.name; const v=e.target.value; setForm((f)=>({ ...f, [n]: v })); }
  async function onFile(e:any){ const file=e.target.files?.[0]; if(!file) return; const { data: userData } = await supabase.auth.getUser(); const uid=userData?.user?.id||'anon'; const path=`${uid}/gestao/${Date.now()}-${file.name}`; await supabase.storage.from('files').upload(path, file, { upsert:true }); const { data } = supabase.storage.from('files').getPublicUrl(path); setForm((f)=>({ ...f, arquivo: data.publicUrl })); }
  async function onSubmit(e: FormEvent){ e.preventDefault(); setError(null); setLoading(true); const { data: userData } = await supabase.auth.getUser(); const uid=userData?.user?.id||null; if(!uid){ setLoading(false); setError('Usuário não autenticado'); return; } const payload:any={ user_id: uid, grupo: form.grupo, descricao: form.descricao||null, usuario: form.usuario||null, senha: form.senha||null, link: form.link||null, arquivo: form.arquivo||null, observacao: form.observacao||null }; const res=await supabase.from('gestao').insert(payload).select('id').single(); setLoading(false); if(res.error){ setError(res.error.message); return; } setForm({ grupo: "Pagamentos", descricao: "", usuario: "", senha: "", link: "", observacao: "", arquivo: "" }); const reload=await supabase.from('gestao').select('*').order('created_at', { ascending:false }); setRows(reload.data||[]); }
  async function onDelete(idRow:string){ const ok=confirm('Excluir este registro?'); if(!ok) return; const res=await supabase.from('gestao').delete().eq('id', idRow); if(!res.error){ const reload=await supabase.from('gestao').select('*').order('created_at', { ascending:false }); setRows(reload.data||[]); } }
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Gestão</h1>
      <form className="grid sm:grid-cols-2 gap-3 bg-white rounded-lg border p-4" onSubmit={onSubmit}>
        <label className="grid gap-1"><span className="text-sm">Grupo</span><select name="grupo" value={form.grupo} onChange={onChange} className="rounded border px-3 py-2"><option>Pagamentos</option><option>Redes Sociais</option><option>CPainel</option><option>Site</option><option>Segurança</option></select></label>
        <label className="grid gap-1"><span className="text-sm">Descrição</span><input name="descricao" value={form.descricao} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Usuário</span><input name="usuario" value={form.usuario} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1"><span className="text-sm">Senha</span><input type="password" name="senha" value={form.senha} onChange={onChange} className="rounded border px-3 py-2" /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Link</span><div className="flex items-center gap-2"><input name="link" value={form.link} onChange={onChange} className="rounded border px-3 py-2 flex-1" />{form.link?.trim()?<a href={form.link.startsWith('http')?form.link:`http://${form.link}`} target="_blank" rel="noopener noreferrer" className="rounded bg-brand-blue-600 px-3 py-2 text-white">Abrir</a>:null}</div></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Arquivo</span><input type="file" onChange={onFile} /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-sm">Observação</span><textarea name="observacao" value={form.observacao} onChange={onChange} className="rounded border px-3 py-2 min-h-[80px]" /></label>
        {error && <div className="text-sm text-red-600 sm:col-span-2">{error}</div>}
        <div className="sm:col-span-2"><button disabled={loading} className="rounded bg-brand-green-600 text-white px-4 py-2">{loading? 'Salvando...' : 'Salvar'}</button></div>
      </form>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2C3E50] text-white"><tr><th className="text-left p-2">Grupo</th><th className="text-left p-2">Descrição</th><th className="text-left p-2">Link</th><th className="text-left p-2">Ações</th></tr></thead>
          <tbody>
            {rows.length? rows.map((r:any, idx:number)=> (
              <tr key={r.id} className={`${idx%2===0?'bg-white':'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}><td className="p-2">{r.grupo}</td><td className="p-2">{r.descricao}</td><td className="p-2">{r.link? (<a href={r.link} target="_blank" rel="noopener noreferrer">Abrir</a>): ''}</td><td className="p-2"><button className="text-red-600" onClick={()=> onDelete(String(r.id))}>Excluir</button></td></tr>
            )) : (<tr className="border-t border-[#F5F5F5]"><td className="p-2 text-gray-600" colSpan={4}>Nenhum registro</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

