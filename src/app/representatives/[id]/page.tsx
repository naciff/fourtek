"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useParams, useRouter } from "next/navigation";
import { RepresentativeSchema } from "@/lib/validation";
import { formatCPF, formatPhone } from "@/lib/format";

export default function EditRepresentativePage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [linkedClientIds, setLinkedClientIds] = useState<string[]>([]);
  function isoToDayMonth(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v||""))) {
      const [y,m,d] = String(v).split("-");
      return `${d}/${m}`;
    }
    return String(v||"");
  }
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

  useEffect(() => {
    async function load() {
      const rep = await supabase.from("representatives").select("*").eq("id", id).single();
      const data = rep.data;
      if (data && data.birth_date) data.birth_date = isoToDayMonth(data.birth_date);
      setForm(data);
      const cls = await supabase.from("clients").select("id, client_contract, situation, alias, company_type").order("alias");
      setClients(cls.data ?? []);
      const links = await supabase.from("client_representatives").select("client_id").eq("representative_id", id);
      setLinkedClientIds((links.data ?? []).map((l: any) => l.client_id));
    }
    load();
  }, [id]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    if (e.target.name === "cpf") val = formatCPF(val);
    if (e.target.name === "phone") val = formatPhone(val);
    if (e.target.name === "birth_date") val = maskDayMonth(val);
    setForm((f: any) => ({ ...f, [e.target.name]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalized = Object.fromEntries(Object.entries(form || {}).map(([k,v])=> [k, v === null ? undefined : v]));
    const parsed = RepresentativeSchema.safeParse(normalized);
    if (!parsed.success) {
      const errs: Record<string,string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      setLoading(false);
      return;
    }
    setFieldErrors({});
    const payload: any = { ...parsed.data };
    if (payload.birth_date) payload.birth_date = dayMonthToISO(payload.birth_date) || null;
    const { error } = await supabase.from("representatives").update(payload).eq("id", id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.replace("/representatives");
    router.refresh();
  }

  function onCancel() {
    router.replace("/representatives");
  }

  async function toggleClientLink(clientId: string) {
    const isLinked = linkedClientIds.includes(clientId);
    setLoading(true);
    if (isLinked) {
      await supabase.from("client_representatives").delete().eq("client_id", clientId).eq("representative_id", id);
      setLinkedClientIds((ids) => ids.filter((cid) => cid !== clientId));
    } else {
      await supabase.from("client_representatives").insert({ client_id: clientId, representative_id: id, user_id: (await supabase.auth.getUser()).data.user?.id });
      setLinkedClientIds((ids) => [...ids, clientId]);
    }
    setLoading(false);
  }

  if (!form) return <div>Carregando...</div>;
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold text-brand-blue-800">Editar Representante</h1>
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
              <input type="text" name={key} placeholder="DD/MM" value={String((form as any)[key] ?? "")} onChange={onChange} className="rounded border px-3 py-2" />
            ) : (
              <input name={key} value={String((form as any)[key] ?? "")} onChange={onChange} className="rounded border px-3 py-2" />
            )}
            {fieldErrors[key] && <span className="text-xs text-red-600">{fieldErrors[key]}</span>}
          </label>
        ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">Salvar</button>
        <button type="button" onClick={onCancel} className="rounded bg-gray-500 px-4 py-2 text-white">Cancelar</button>
      </div>
      </form>
      <div className="mt-6">
        <h2 className="text-lg font-medium text-brand-blue-800">Empresas Vinculadas</h2>
        <div className="mt-2 rounded-lg border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-brand-green-100">
              <tr>
                <th className="text-left p-2">Contrato</th>
                <th className="text-left p-2">Situação</th>
                <th className="text-left p-2">Apelido</th>
                <th className="text-left p-2">Tipo de Empresa</th>
              </tr>
            </thead>
            <tbody>
              {clients.filter((c)=> linkedClientIds.includes(c.id)).map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{(c as any).client_contract}</td>
                  <td className="p-2">{(c as any).situation}</td>
                  <td className="p-2">{(c as any).alias}</td>
                  <td className="p-2">{(c as any).company_type}</td>
                </tr>
              ))}
              {!clients.filter((c)=> linkedClientIds.includes(c.id)).length && (
                <tr className="border-t"><td className="p-2 text-gray-600" colSpan={4}>Nenhuma empresa vinculada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}