"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { formatCPF, formatPhone } from "@/lib/format";
import { validators } from "@/lib/validation";

export default function DiretoriaForm() {
  const supabase = supabaseBrowser();
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    id: "",
    nome: "",
    cargo: "",
    estado_civil: "",
    rg: "",
    orgao_expedidor: "",
    cpf: "",
    endereco: "",
    data_nascimento: "",
    email_corporativo: "",
    email_pessoal: "",
    celular: "",
    chave_pix: "",
  });
  const estadoCivilOptions = [
    "Solteiro(a)",
    "Casado(a)",
    "Divorciado(a)",
    "Viúvo(a)",
    "Separado(a)",
    "União estável",
  ];

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || "";
      setUserId(uid);
      if (!uid) return;
      const { data: all } = await supabase.from("diretoria").select("*").eq("user_id", uid).order("created_at", { ascending: true });
      setRows(all ?? []);
    })();
  }, []);

  function maskDateBR(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
    return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)}`;
  }
  function isoToBR(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y,m,dd] = v.split("-");
      return `${dd}/${m}/${y}`;
    }
    return v;
  }
  function brToISO(v: string) {
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return "";
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  function calcAge(iso: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return "";
    const b = new Date(String(iso) + "T00:00:00");
    const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
    return String(Math.max(0, age));
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    let val: any = e.target.value;
    if (name === "cpf") val = formatCPF(val);
    if (name === "celular") val = formatPhone(val);
    setForm((f: any) => ({ ...f, [name]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (form.cpf && !validators.isValidCPF(form.cpf)) {
        setError("CPF inválido");
        setLoading(false);
        return;
      }
      const payload: any = {
        user_id: userId,
        nome: form.nome,
        cargo: form.cargo,
        estado_civil: form.estado_civil,
        rg: form.rg,
        orgao_expedidor: form.orgao_expedidor,
        cpf: form.cpf,
        endereco: form.endereco,
        data_nascimento: form.data_nascimento ? String(form.data_nascimento) : null,
        email_corporativo: form.email_corporativo,
        email_pessoal: form.email_pessoal,
        celular: form.celular,
        chave_pix: form.chave_pix,
      };
      if (form.id) {
        const { error } = await supabase.from("diretoria").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("diretoria").insert(payload).select("id").single();
        if (error) throw error;
        setForm((f: any) => ({ ...f, id: data.id }));
      }
      const { data: refreshed } = await supabase.from("diretoria").select("*").eq("user_id", userId).order("created_at", { ascending: true });
      setRows(refreshed ?? []);
      setSuccess("Salvo com sucesso");
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium text-gray-800">Demais Diretores</h3>
        <div className="mt-2">
          <button type="button" onClick={()=>{ setForm({ id: "", nome: "", cargo: "", estado_civil: estadoCivilOptions[0], rg: "", orgao_expedidor: "", cpf: "", endereco: "", data_nascimento: "", email_corporativo: "", email_pessoal: "", celular: "", chave_pix: "" }); setShowForm(true); }} className="rounded bg-brand-green-600 px-3 py-1.5 text-white text-xs">Adicionar Diretor</button>
        </div>
        <div className="mt-2 grid gap-3">
          {rows.map((r)=> (
            <div key={r.id} className="rounded border bg-white p-3">
              <div className="font-medium">{r.nome}</div>
              <div className="text-xs text-gray-600">{r.cargo}</div>
              <div className="text-xs text-gray-600">{r.email_corporativo || r.email_pessoal}</div>
              <div className="text-xs text-gray-600">{r.celular ? r.celular : ""}{r.data_nascimento ? ` • Idade: ${calcAge(String(r.data_nascimento))}` : ""}</div>
              <div className="mt-2">
                <button type="button" onClick={()=> { setForm({ id: r.id, nome: r.nome || "", cargo: r.cargo || "", estado_civil: r.estado_civil || estadoCivilOptions[0], rg: r.rg || "", orgao_expedidor: r.orgao_expedidor || "", cpf: r.cpf || "", endereco: r.endereco || "", data_nascimento: String(r.data_nascimento || ""), email_corporativo: r.email_corporativo || "", email_pessoal: r.email_pessoal || "", celular: r.celular || "", chave_pix: r.chave_pix || "" }); setShowForm(true); }} className="rounded bg-brand-blue-600 px-3 py-1.5 text-white text-xs">Editar</button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-xs text-gray-600">Nenhum diretor cadastrado.</p>
          )}
        </div>
      </div>
      {showForm ? (
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1"><span className="text-sm text-gray-700">Nome</span><input name="nome" value={form.nome} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">Cargo</span><input name="cargo" value={form.cargo} onChange={onChange} className="rounded border px-3 py-2" /></label>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="grid gap-1"><span className="text-sm text-gray-700">Estado Civil</span>
            <select name="estado_civil" value={form.estado_civil} onChange={(e)=> setForm((f:any)=> ({ ...f, estado_civil: e.target.value }))} className="rounded border px-3 py-2">
              {estadoCivilOptions.map((opt)=> (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">RG</span><input name="rg" value={form.rg} onChange={onChange} className="rounded border px-3 py-2 w-32" /></label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">Órgão Expedidor</span><input name="orgao_expedidor" value={form.orgao_expedidor} onChange={onChange} className="rounded border px-3 py-2 w-40" /></label>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="grid gap-1"><span className="text-sm text-gray-700">CPF</span><input name="cpf" value={form.cpf} onChange={onChange} className="rounded border px-3 py-2 w-40" /></label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">Data de Nascimento</span><input type="date" name="data_nascimento" value={String(form.data_nascimento || "")} onChange={(e)=> setForm((f: any)=> ({ ...f, data_nascimento: e.target.value }))} className="rounded border px-3 py-2 w-44" /></label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">Idade</span><input value={calcAge(String(form.data_nascimento || ""))} readOnly className="rounded border px-3 py-2 bg-gray-50 w-20" /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1 sm:col-span-2"><span className="text-sm text-gray-700">Endereço</span><input name="endereco" value={form.endereco} onChange={onChange} className="rounded border px-3 py-2" /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1"><span className="text-sm text-gray-700">E-mail Corporativo</span><input name="email_corporativo" value={form.email_corporativo} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">E-mail Pessoal</span><input name="email_pessoal" value={form.email_pessoal} onChange={onChange} className="rounded border px-3 py-2" /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1"><span className="text-sm text-gray-700">Celular</span><input name="celular" value={form.celular} onChange={onChange} className="rounded border px-3 py-2" /></label>
          <label className="grid gap-1"><span className="text-sm text-gray-700">Chave PIX</span><input name="chave_pix" value={form.chave_pix} onChange={onChange} className="rounded border px-3 py-2" /></label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <div className="flex items-center gap-2">
          <button disabled={loading || !String(form.nome || "").trim().length} className="rounded bg-brand-green-600 px-4 py-2 text-white">{loading ? "Salvando..." : "Salvar"}</button>
          <button type="button" onClick={()=> { setShowForm(false); }} className="rounded border px-3 py-2">Cancelar</button>
        </div>
      </form>
      ) : (
        <div className="grid place-items-center border rounded p-6 text-sm text-gray-600 bg-white">Clique em &quot;Adicionar Diretor&quot; ou &quot;Editar&quot; para abrir o formulário</div>
      )}
    </div>
  );
}