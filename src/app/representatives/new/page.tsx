"use client";
import { useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { RepresentativeSchema } from "@/lib/validation";
import { formatCPF, formatPhone } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function NewRepresentativePage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", rg: "", cpf: "", phone: "", email: "", birth_date: "", image_url: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  function maskDayMonth(v: string) {
    const d = (v || "").replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0,2)}/${d.slice(2,4)}`;
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
    const normalized = Object.fromEntries(Object.entries(form).map(([k,v])=> [k, v === null ? undefined : v]));
    const parsed = RepresentativeSchema.safeParse(normalized);
    if (!parsed.success) {
      const errs: Record<string,string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      setLoading(false);
      return;
    }
    setFieldErrors({});
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    const payload: any = { ...parsed.data, user_id };
    if (payload.birth_date) payload.birth_date = dayMonthToISO(payload.birth_date) || null;
    const { error } = await supabase.from("representatives").insert(payload);
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.replace("/representatives");
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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold text-brand-blue-800">Novo Representante</h1>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        {[
          "full_name",
          "rg",
          "cpf",
          "phone",
          "email",
          "birth_date",
        ].map((key) => (
          <label key={key} className="grid gap-1">
            <span className="text-sm text-gray-700">{({
              full_name: "Nome Completo",
              rg: "RG",
              cpf: "CPF",
              phone: "Celular",
              email: "E-mail",
              birth_date: "Data de Aniversário",
            } as Record<string,string>)[key] ?? key}</span>
            {key === "birth_date" ? (
              <input type="text" name={key} placeholder="DD/MM" value={(form as any)[key] as string} onChange={onChange} className="rounded border px-3 py-2" />
            ) : (
              <input name={key} value={(form as any)[key] as string} onChange={onChange} className="rounded border px-3 py-2" />
            )}
            {fieldErrors[key] && <span className="text-xs text-red-600">{fieldErrors[key]}</span>}
          </label>
        ))}
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Imagem</span>
          <input type="file" accept="image/*" onChange={onImageChange} className="rounded border px-3 py-2" />
          {uploading && <span className="text-xs text-gray-500">Enviando...</span>}
          {form.image_url && <img src={form.image_url} alt="Imagem" className="mt-2 h-16 w-16 rounded object-cover" />}
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">Salvar</button>
      </form>
    </div>
  );
}