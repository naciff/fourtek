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
    // Se senha vazia, considera válida (ao editar)
    if (p.length === 0) {
      setChecks({ len: false, num: false, special: false, upper: false, lower: false });
      return true;
    }
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

  function formatDate(iso: string) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function isOnline(lastSeenAt: string) {
    if (!lastSeenAt) return false;
    const lastSeen = new Date(lastSeenAt).getTime();
    const now = new Date().getTime();
    return (now - lastSeen) < 300000; // 5 minutos
  }

  // Avatar color logic (deterministic)
  function getAvatarColor(id: string) {
    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-green-600', 'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600'
    ];
    const val = id ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : 0;
    return colors[val % colors.length];
  }

  function getInitials(name: string) { return (name || "?").substring(0, 1).toUpperCase(); }


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const full = form.full_name.trim();
    const isEdit = Boolean(editingId);

    // Validações básicas
    if (!full || !form.email) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (full.length < 3) { setError("Nome muito curto (mínimo 3)."); return; }
    if (!validateEmail(form.email)) { setError("E-mail inválido."); return; }

    // Senha só é obrigatória ao criar OU se preenchida ao editar
    const passwordProvided = form.password.trim().length > 0;
    if (!isEdit && !passwordProvided) {
      setError("Senha é obrigatória ao criar usuário.");
      return;
    }

    // Se senha foi fornecida, validar
    if (passwordProvided) {
      if (!validatePassword(form.password)) {
        setError("Senha não atende aos requisitos.");
        return;
      }
      if (form.password !== form.confirm) {
        setError("As senhas não coincidem.");
        return;
      }
    }
    const payload: any = {
      id: editingId,
      full_name: form.full_name,
      email: form.email,
      group: form.group,
      permissions: Array.from(form.screens),
    };

    // Só inclui senha se foi fornecida
    if (passwordProvided) {
      payload.password = form.password;
    }

    const res = await fetch("/api/users", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? payload : {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        group: form.group,
        permissions: Array.from(form.screens),
      }),
    });
    console.log('Response status:', res.status);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(String(j?.error || `Erro ${res.status}`));
      return;
    }
    if (!isEdit) {
      /* Email Confirmation logic is temporarily disabled/commented out if not needed or failing */
      /*
      const confirmRes = await fetch("/api/usuarios/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password })
      });
      */
    }
    setSuccess(isEdit ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.");
    setForm({ full_name: "", email: "", password: "", confirm: "", group: "gestor", screens: new Set() });
    setEditingId(null);
    setShowForm(false);
    await loadUsers();
  }

  async function loadUsers() {
    // Queries the new /api/users endpoint
    const res = await fetch("/api/users");
    if (res.ok) {
      const j = await res.json();
      setUsers(Array.isArray(j) ? j : []);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuários Cadastrados</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lista de todos os usuários registrados no sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadUsers()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            Atualizar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-green-600 rounded-lg hover:bg-brand-green-700 shadow-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Cadastrar novo usuário
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase text-gray-500">Nome completo</span>
                <input className={`border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 ${form.full_name.trim().length >= 3 ? 'border-gray-200 focus:border-brand-green-500' : 'border-red-300'}`} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: sanitizeName(e.target.value) })} minLength={3} maxLength={100} required />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase text-gray-500">E-mail</span>
                <input type="email" className={`border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 ${validateEmail(form.email) ? 'border-gray-200 focus:border-brand-green-500' : 'border-red-300'}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value.slice(0, 255) })} maxLength={255} required />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <label className="grid gap-1.5 ">
                <span className="text-xs font-semibold uppercase text-gray-500">Senha</span>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} className={`border rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-900 dark:border-gray-600 ${checks.len && checks.num && checks.special && checks.upper && checks.lower ? 'border-gray-200 focus:border-brand-green-500' : 'border-red-300'}`} value={form.password} onChange={(e) => { const v = e.target.value; setForm({ ...form, password: v }); validatePassword(v); }} required={!editingId} placeholder={editingId ? "Deixe em branco para não alterar" : ""} />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Mostrar senha">
                    {showPwd ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                  </button>
                </div>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase text-gray-500">Confirmação</span>
                <div className="relative">
                  <input type={showPwd2 ? "text" : "password"} className={`border rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-900 dark:border-gray-600 ${form.confirm && form.confirm === form.password ? 'border-gray-200 focus:border-brand-green-500' : 'border-red-300'}`} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required={!editingId} placeholder={editingId ? "Deixe em branco para não alterar" : ""} />
                  <button type="button" onClick={() => setShowPwd2((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd2 ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                  </button>
                </div>
              </label>
              <div className="col-span-full mt-1 flex flex-wrap gap-2 text-[10px] text-gray-500">
                <span className={checks.len ? "text-green-600 font-bold" : "opacity-50"}>• 8+ chars</span>
                <span className={checks.num ? "text-green-600 font-bold" : "opacity-50"}>• Número</span>
                <span className={checks.special ? "text-green-600 font-bold" : "opacity-50"}>• Especial</span>
                <span className={checks.upper ? "text-green-600 font-bold" : "opacity-50"}>• Maiúscula</span>
              </div>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-gray-500">Grupo de permissões</span>
              <select className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-600" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value as any })}>
                {PERMISSION_GROUPS.map((g) => (<option key={g} value={g}>{g.toUpperCase()}</option>))}
              </select>
            </label>

            <div className="grid gap-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Acesso às telas</span>
              <div className="flex flex-wrap gap-3">
                {ALL_SCREENS.map((s) => (
                  <label key={s} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="rounded text-brand-green-600 focus:ring-brand-green-500" checked={form.screens.has(s)} onChange={() => toggleScreen(s)} />
                    <span className="text-sm font-medium">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {error ? <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div> : null}
            {success ? <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{success}</div> : null}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  !validateEmail(form.email) ||
                  !form.full_name ||
                  // Se senha fornecida, deve ser válida
                  (form.password.length > 0 && (
                    !(checks.len && checks.num && checks.special && checks.upper && checks.lower) ||
                    form.password !== form.confirm
                  )) ||
                  // Se criando, senha é obrigatória
                  (!editingId && form.password.length === 0)
                }
                className="rounded-lg bg-brand-green-600 hover:bg-brand-green-700 text-white px-6 py-2.5 font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar Usuário
              </button>
              <button type="button" onClick={() => { setEditingId(null); setShowForm(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <tr>
                <th className="p-4 pl-6">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data Cadastro</th>
                <th className="p-4">Último Acesso</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(String(u.id))}`}>
                        {getInitials(u.full_name)}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="p-4">
                    {isOnline(u.last_seen_at) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse"></span>
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(u.last_login)}</td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setShowForm(true); setEditingId(String(u.id)); setForm({ ...form, full_name: u.full_name, email: u.email, password: '', confirm: '', group: u.group || 'gestor', screens: new Set<string>((u.permissions || [])) }); }}
                        className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button
                        onClick={async () => { const ok = confirm('Excluir este usuário?'); if (!ok) return; setError(null); setSuccess(null); const res = await fetch(`/api/users?id=${encodeURIComponent(String(u.id))}`, { method: 'DELETE' }); if (res.ok) { await loadUsers(); } else { const j = await res.json().catch(() => ({})); setError(String(j?.error || 'Falha ao excluir')); } }}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Excluir"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>                        </button>
                    </div>
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

