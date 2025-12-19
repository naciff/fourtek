"use client";
import { useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { RepresentativeSchema } from "@/lib/validation";
import { formatCPF, formatPhone } from "@/lib/format";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";

export default function RepresentativeCreateModal({ onClose, onCreated, clientId }: { onClose: () => void; onCreated: (rep: any) => void; clientId?: string }) {
  const supabase = supabaseBrowser();
  const [form, setForm] = useState({ full_name: "", rg: "", cpf: "", phone: "", email: "", birth_date: "", image_url: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  function maskDayMonth(v: string) {
    const d = (v || "").replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}`;
  }
  function dayMonthToISO(v: string) {
    const m = String(v || "").match(/^(\d{2})\/(\d{2})$/);
    if (!m) return null;
    return `2000-${m[2]}-${m[1]}`;
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    if (e.target.name === "cpf") val = formatCPF(val);
    if (e.target.name === "phone") val = formatPhone(val);
    if (e.target.name === "birth_date") val = maskDayMonth(val);
    setForm((f) => ({ ...f, [e.target.name]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalized = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === null ? undefined : v]));
    const parsed = RepresentativeSchema.safeParse(normalized);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      setError("Preencha os campos corretamente");
      setLoading(false);
      return;
    }
    setFieldErrors({});
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (!user_id) { setError("Usuário não autenticado"); setLoading(false); return; }
    const payload: any = { ...parsed.data, user_id };
    if (payload.birth_date) payload.birth_date = dayMonthToISO(payload.birth_date) || null;
    let data: any = null;
    let error: any = null;
    try {
      const res = await supabase
        .from("representatives")
        .insert(payload)
        .select("id, full_name, cpf, email, phone")
        .single();
      data = res.data; error = res.error || null;
    } catch (e: any) {
      error = { message: String(e?.message || "Erro ao salvar") };
    }
    setLoading(false);
    if (error || !data) {
      const msg = error?.message || "";
      if ((error as any)?.code === '42703' || /column .* does not exist/i.test(msg)) {
        const retry: any = { full_name: payload.full_name, cpf: payload.cpf, email: payload.email, phone: payload.phone, user_id: payload.user_id };
        const r2 = await supabase
          .from("representatives")
          .insert(retry)
          .select("id, full_name, cpf, email, phone")
          .single();
        if (r2.error || !r2.data) { setError(r2.error?.message || "Erro ao salvar"); return; }
        data = r2.data;
      } else if (!error && !data) {
        const latest = await supabase
          .from("representatives")
          .select("id, full_name, cpf, email, phone")
          .order("created_at", { ascending: false })
          .limit(1);
        const row = (latest.data ?? [])[0];
        if (!row) { setError("Representante criado, mas não foi possível carregar os dados."); return; }
        data = row;
      } else if ((error as any)?.code === '23505') {
        setError("Já existe um representante com estes dados");
        return;
      } else if ((error as any)?.code === '42501') {
        setError("Sem permissão para salvar (RLS)");
        return;
      } else {
        setError(error?.message || "Erro ao salvar"); return;
      }
    }
    if (clientId && user_id) {
      const link = await supabase.from("client_representatives").insert({ client_id: clientId, representative_id: data.id, user_id });
      if (link.error) { setError(link.error.message); return; }
    }
    setSuccess("Representante salvo com sucesso");
    setTimeout(() => { onCreated(data); }, 700);
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id || "anon";
    const ext = file.name.split(".").pop() || "jpg";
    const path = `representatives/${uid}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("files").upload(path, file, { upsert: true });
    if (up.error) {
      setError(up.error.message);
      setUploading(false);
      return;
    }
    const pub = supabase.storage.from("files").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: pub.data.publicUrl }));
    setUploading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-brand-blue-800">Novo Representante</h2>
          <button type="button" className="text-gray-600" onClick={onClose}>Fechar</button>
        </div>
        <form className="mt-3 grid gap-3" onSubmit={onSubmit}>
          {success ? (<div className="rounded border bg-green-50 text-green-800 px-3 py-2">{success}</div>) : null}
          {["full_name", "rg", "cpf", "phone", "email", "birth_date"].map((key) => {
            const label = ({ full_name: "Nome Completo", rg: "RG", cpf: "CPF", phone: "Celular", email: "E-mail", birth_date: "Data de Aniversário" } as Record<string, string>)[key];
            const isDate = key === "birth_date";
            return (
              <div key={key} className="grid gap-1">
                <FloatingLabelInput
                  label={label}
                  name={key}
                  placeholder={isDate ? "DD/MM" : undefined}
                  value={(form as any)[key] as string}
                  onChange={onChange}
                />
                {fieldErrors[key] && <span className="text-xs text-red-600">{fieldErrors[key]}</span>}
              </div>
            );
          })}
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Imagem</span>
            <input type="file" accept="image/*" onChange={onImageChange} className="rounded border px-3 py-2" />
            {uploading && <span className="text-xs text-gray-500">Enviando...</span>}
            {form.image_url && <img src={form.image_url} alt="Imagem" className="mt-2 h-16 w-16 rounded object-cover" />}
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">Salvar</button>
            <button type="button" className="rounded border px-4 py-2" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}