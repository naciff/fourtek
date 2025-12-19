"use client";
import { useState, useEffect } from "react";

const ALL_SCREENS = ["Dashboard", "Relatórios", "Configurações"] as const;
const PERMISSION_GROUPS = ["admin", "gestor", "leitor"] as const;

export default function UserCreatePage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
    group: "gestor" as (typeof PERMISSION_GROUPS)[number],
    screens: new Set<string>(),
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [checks, setChecks] = useState({ len: false, num: false, special: false, upper: false, lower: false });
  const [showForm, setShowForm] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleScreen(screen: string) {
    const next = new Set(form.screens);
    next.has(screen) ? next.delete(screen) : next.add(screen);
    setForm({ ...form, screens: next });
  }

  function validateEmail(s: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 255; }
  function validatePassword(p: string) {
    const c = {
      len: p.length >= 8,
      num: /\d/.test(p),
      special: /[!@#$%^&*]/.test(p),
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
    };
    setChecks(c);
    return Object.values(c).every(Boolean);
  }
  function sanitizeName(s: string) {
    const only = s.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
    return only.slice(0, 100);
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const full = form.full_name.trim();
    if (!full || !form.email || !form.password || !form.confirm) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (full.length < 3) { setError("Nome muito curto (mínimo 3)."); return; }
    if (!validateEmail(form.email)) { setError("E-mail inválido."); return; }
    if (!validatePassword(form.password)) { setError("Senha não atende aos requisitos."); return; }
    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    const isEdit = Boolean(editingId);
    const res = await fetch("/api/usuarios" + (isEdit? "" : ""), {
      method: isEdit? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? {
        id: editingId,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        group: form.group,
        permissions: Array.from(form.screens),
      } : {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        group: form.group,
        permissions: Array.from(form.screens),
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(String(j?.error || `Erro ${res.status}`));
      return;
    }
    if (!isEdit) {
      const confirmRes = await fetch("/api/usuarios/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password })
      });
      if (!confirmRes.ok) {
        const j = await confirmRes.json().catch(()=>({}));
        setError(String(j?.error || `Erro ao enviar confirmação`));
        return;
      }
    }
    setSuccess(isEdit? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.");
    setForm({ full_name: "", email: "", password: "", confirm: "", group: "gestor", screens: new Set() });
    setEditingId(null);
    await loadUsers();
  }

  async function loadUsers() {
    const res = await fetch("/api/usuarios");
    if (res.ok) {
      const j = await res.json();
      setUsers(Array.isArray(j) ? j : []);
    }
  }

  useEffect(()=>{ void loadUsers(); }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold">Cadastro de Usuários</h1>
      <div className="mt-3">
        <button type="button" onClick={()=> setShowForm(true)} className="rounded bg-brand-green-600 text-white px-4 py-2">Cadastrar novo usuário</button>
      </div>
      {showForm ? (
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm">Nome completo</span>
          <input className={`border rounded px-2 py-2 ${form.full_name.trim().length>=3? 'border-green-500':'border-red-500'}`} value={form.full_name} onChange={(e)=> setForm({ ...form, full_name: sanitizeName(e.target.value) })} minLength={3} maxLength={100} required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">E-mail</span>
          <input type="email" className={`border rounded px-2 py-2 ${validateEmail(form.email)? 'border-green-500':'border-red-500'}`} value={form.email} onChange={(e)=> setForm({ ...form, email: e.target.value.slice(0,255) })} maxLength={255} required />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Senha</span>
            <div className="relative">
              <input type={showPwd?"text":"password"} className={`border rounded px-2 py-2 w-full ${checks.len&&checks.num&&checks.special&&checks.upper&&checks.lower? 'border-green-500':'border-red-500'}`} value={form.password} onChange={(e)=> { const v=e.target.value; setForm({ ...form, password: v }); validatePassword(v); }} required />
              <button type="button" onClick={()=> setShowPwd((v)=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" aria-label="Mostrar senha">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
              </button>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
              <span className={checks.len?"text-green-700":"text-gray-600"}>• Mínimo 8 caracteres</span>
              <span className={checks.num?"text-green-700":"text-gray-600"}>• Pelo menos 1 número</span>
              <span className={checks.special?"text-green-700":"text-gray-600"}>• 1 caractere especial</span>
              <span className={checks.upper?"text-green-700":"text-gray-600"}>• 1 letra maiúscula</span>
              <span className={checks.lower?"text-green-700":"text-gray-600"}>• 1 letra minúscula</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Recomenda-se não reutilizar senhas, usar gerenciadores de senhas e não compartilhar credenciais.
            </div>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Confirmação de senha</span>
            <div className="relative">
              <input type={showPwd2?"text":"password"} className={`border rounded px-2 py-2 w-full ${form.confirm && form.confirm===form.password? 'border-green-500':'border-red-500'}`} value={form.confirm} onChange={(e)=> setForm({ ...form, confirm: e.target.value })} required />
              <button type="button" onClick={()=> setShowPwd2((v)=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" aria-label="Mostrar confirmação">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
              </button>
            </div>
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm">Grupo de permissões</span>
          <select className="border rounded px-2 py-2" value={form.group} onChange={(e)=> setForm({ ...form, group: e.target.value as any })}>
            {PERMISSION_GROUPS.map((g)=> (<option key={g} value={g}>{g}</option>))}
          </select>
        </label>
        <div className="grid gap-2">
          <span className="text-sm">Acesso às telas</span>
          <div className="flex flex-wrap gap-4">
            {ALL_SCREENS.map((s)=> (
              <label key={s} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.screens.has(s)} onChange={()=> toggleScreen(s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        {error ? <div className="text-red-600 text-sm">{error}</div> : null}
        {success ? <div className="text-green-700 text-sm">{success}</div> : null}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!validateEmail(form.email) || !(checks.len && checks.num && checks.special && checks.upper && checks.lower) || form.password!==form.confirm || !form.full_name}
            className="rounded bg-[#36a78b] text-white px-4 py-2 disabled:opacity-50"
          >
            Salvar
          </button>
          {editingId ? (
            <button type="button" onClick={()=> { setEditingId(null); setForm({ full_name: "", email: "", password: "", confirm: "", group: "gestor", screens: new Set() }); setShowForm(false); }} className="rounded border px-4 py-2">Cancelar</button>
          ) : null}
        </div>
      </form>
      ) : null}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Usuários cadastrados</h2>
        {users.length === 0 ? (
          <div className="text-sm text-gray-600 mt-2">Nenhum usuário cadastrado.</div>
        ) : (
          <table className="w-full text-sm mt-2 border table-zebra">
            <thead className="bg-black/5">
               <tr>
                 <th className="text-left p-2">Nome</th>
                 <th className="text-left p-2">E-mail</th>
                 <th className="text-left p-2">Grupo</th>
                 <th className="text-left p-2">Permissões</th>
                 <th className="text-left p-2">Ações</th>
               </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.full_name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.group}</td>
                  <td className="p-2">{Array.isArray(u.permissions) ? u.permissions.join(", ") : ""}</td>
                  <td className="p-2">
                    <button type="button" className="rounded bg-brand-blue-600 text-white px-2 py-1 text-xs mr-1" onClick={()=>{ setShowForm(true); setEditingId(String(u.id)); setForm({ ...form, full_name: u.full_name, email: u.email, password: '', confirm: '', group: u.group || 'gestor', screens: new Set<string>((u.permissions||[])) }); }}>Editar</button>
                    <button type="button" className="rounded bg-red-600 text-white px-2 py-1 text-xs" onClick={async()=>{ const ok = confirm('Excluir este usuário?'); if(!ok) return; setError(null); setSuccess(null); const res = await fetch(`/api/usuarios?id=${encodeURIComponent(String(u.id))}`, { method: 'DELETE' }); if(res.ok){ await loadUsers(); } else { const j = await res.json().catch(()=>({})); setError(String(j?.error || 'Falha ao excluir')); } }}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

