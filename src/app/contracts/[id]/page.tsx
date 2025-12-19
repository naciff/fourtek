"use client";
import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ContractSchema } from "@/lib/validation";

export default function EditContractPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const [clients, setClients] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<Array<{ id?: string; service_id?: string; service_name_snapshot: string; quantity: number; unit_price: number; discount: number }>>([]);
  const [draft, setDraft] = useState<{ service_id?: string; quantity: string; unit_price: string; discount: string }>({ service_id: undefined, quantity: "1", unit_price: "0", discount: "0" });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [adjPct, setAdjPct] = useState<string>("0");
  const [newStart, setNewStart] = useState<string>("");
  const [newEnd, setNewEnd] = useState<string>("");
  const [dupLoading, setDupLoading] = useState(false);
  const [dupError, setDupError] = useState<string | null>(null);
  function toISODate(v: any): string {
    const s = String(v || "").trim();
    if (!s) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const ddmm = s.match(/^([0-3]?\d)\/(1[0-2]|0?[1-9])\/(\d{4})$/);
    if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2,'0')}-${ddmm[1].padStart(2,'0')}`;
    const mmdd = s.match(/^(1[0-2]|0?[1-9])\/([0-3]?\d)\/(\d{4})$/);
    if (mmdd) return `${mmdd[3]}-${mmdd[1].padStart(2,'0')}-${mmdd[2].padStart(2,'0')}`;
    return s;
  }

  useEffect(() => {
    (async () => {
      const [c, cl, s, ci] = await Promise.all([
        supabase.from("contracts").select("*").eq("id", id).single(),
        supabase.from("clients").select("id, alias, trade_name"),
        supabase.from("services").select("id,name").order("name"),
        supabase.from("contract_items").select("id, service_id, service_name_snapshot, quantity, unit_price, discount").eq("contract_id", id)
      ]);
      const base = c.data || {};
      const todayISO = new Date().toISOString().slice(0,10);
      setForm({
        ...base,
        start_date: toISODate(base.start_date) || todayISO,
        end_date: toISODate(base.end_date) || "",
        due_day: String(base.due_day ?? ""),
      });
      setClients(cl.data ?? []);
      setServices(s.data ?? []);
      setItems((ci.data ?? []).map((x:any)=> ({ id: x.id, service_id: x.service_id, service_name_snapshot: x.service_name_snapshot, quantity: x.quantity, unit_price: x.unit_price, discount: x.discount })));
    })();
  }, [id, supabase]);

  useEffect(() => {
    const flag = searchParams?.get("duplicate");
    if (flag && form && !showDuplicateModal) {
      setAdjPct("0");
      setNewStart(String(form.start_date ?? ""));
      setNewEnd(String(form.end_date ?? ""));
      setDupError(null);
      setShowDuplicateModal(true);
    }
  }, [searchParams, form, showDuplicateModal]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function round2(n: number) { return Math.round(n * 100) / 100; }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const parsed = ContractSchema.safeParse({ ...form, total_value: items.reduce((sum, it)=> sum + (it.quantity * it.unit_price - it.discount), 0) });
    if (!parsed.success) {
      const errs: Record<string,string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    if (form.client_id && String(form.status ?? "ativo") === "ativo") {
      const exists = await supabase.from("contracts").select("id").eq("client_id", form.client_id).eq("status","ativo").not("id","eq", id).limit(1);
      if ((exists.data ?? []).length) { setError("Cliente já possui contrato ativo"); setLoading(false); return; }
    }
    const { error } = await supabase.from("contracts").update({
      ...parsed.data,
      start_date: toISODate(form.start_date),
      end_date: toISODate(form.end_date),
      due_day: parsed.data.due_day ? Number(parsed.data.due_day as any) : null,
      total_value: Number(parsed.data.total_value as any)
    }).eq("id", id);
    if (!error) {
      // Replace items by current set
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      await supabase.from("contract_items").delete().eq("contract_id", id);
      if (items.length) {
        const payload = items.map(it=> ({
          contract_id: id,
          user_id: uid,
          service_id: it.service_id || null,
          service_name_snapshot: it.service_name_snapshot,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount: it.discount,
        }));
        await supabase.from("contract_items").insert(payload);
      }
    }
    setLoading(false);
    if (error) {
      const code = (error as any)?.code;
      if (code === '23505') { setError("Cliente já possui contrato"); return; }
      setError(error.message); return;
    }
    router.replace("/contracts");
    router.refresh();
  }

  async function onDelete() {
    setLoading(true);
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    setLoading(false);
    if (!error) router.replace("/contracts");
  }

  async function duplicateWithAdjustment() {
    setDupError(null);
    const pct = parseFloat(String(adjPct).replace(",","."));
    if (!Number.isFinite(pct)) { setDupError("Informe o reajuste em percentual"); return; }
    const startISO = toISODate(newStart);
    const endISO = toISODate(newEnd);
    if (!startISO) { setDupError("Informe a data de início"); return; }
    setDupLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { setDupError("Usuário não autenticado"); setDupLoading(false); return; }
      const adjustedItems = items.map(it=> ({
        service_id: it.service_id || null,
        service_name_snapshot: it.service_name_snapshot,
        quantity: it.quantity,
        unit_price: round2(it.unit_price * (1 + pct/100)),
        discount: it.discount,
      }));
      const totalNew = adjustedItems.reduce((sum, it)=> sum + (it.quantity * it.unit_price - it.discount), 0);
      const ins = await supabase
        .from("contracts")
        .insert({
          user_id: uid,
          client_id: form.client_id,
          start_date: startISO,
          end_date: endISO || null,
          due_day: form.due_day ? Number(form.due_day) : null,
          status: "ativo",
          total_value: round2(totalNew),
        })
        .select("id")
        .single();
      if (ins.error) {
        const code = (ins.error as any)?.code;
        const msg = String((ins.error as any)?.message || "");
        if (code === '23505' || msg.includes('contracts_client_unique_idx')) {
          setDupError('Existe restrição única por cliente. Execute no banco: DROP INDEX IF EXISTS public.contracts_client_unique_idx; CREATE UNIQUE INDEX contracts_client_active_unique_idx ON public.contracts (client_id) WHERE status = \"ativo\";');
        } else {
          setDupError(msg);
        }
        setDupLoading(false);
        return;
      }
      const newId = (ins.data as any)?.id;
      if (newId) {
        const payload = adjustedItems.map(it=> ({ contract_id: newId, user_id: uid, ...it }));
        const ci = await supabase.from("contract_items").insert(payload);
        if (ci.error) { setDupError(ci.error.message); setDupLoading(false); return; }
        await supabase.from("contracts").update({ status: "encerrado" }).eq("id", id);
        setDupLoading(false);
        router.replace("/contracts");
      } else {
        setDupLoading(false);
        setDupError("Falha ao criar novo contrato");
      }
    } catch (e: any) {
      setDupLoading(false);
      setDupError(String(e?.message || "Erro ao duplicar contrato"));
    }
  }

  if (!form) return <div>Carregando...</div>;
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold text-brand-blue-800">Editar Contrato</h1>
      <form className="mt-4 grid sm:grid-cols-2 gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm">Cliente</span>
          <select name="client_id" className="rounded border px-3 py-2" value={form.client_id ?? ""} onChange={onChange}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.alias || c.trade_name}</option>
          ))}
          </select>
          {fieldErrors.client_id && <span className="text-xs text-red-600">{fieldErrors.client_id}</span>}
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Dia de vencimento</span>
          <input name="due_day" placeholder="DD" className="rounded border px-3 py-2" value={String(form.due_day ?? "")} onChange={(e)=>{
            const digits = e.target.value.replace(/\D/g, "").slice(0,2);
            setForm((f: any)=> ({ ...f, due_day: digits }));
          }} />
          {fieldErrors.due_day && <span className="text-xs text-red-600">{fieldErrors.due_day}</span>}
        </label>
        <div className="sm:col-span-2 rounded border p-3">
          <div className="font-medium text-sm text-brand-blue-800">Itens do Contrato</div>
          <div className="mt-2 flex gap-2 items-end flex-wrap">
            <label className="grid gap-1">
              <span className="text-xs text-gray-700">Serviço</span>
              <select value={draft.service_id || ""} onChange={(e)=> setDraft(d=> ({ ...d, service_id: e.target.value || undefined }))} className="rounded border px-2 py-2 w-40">
                <option value="">Selecione</option>
                {services.map(s=> (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-gray-700">Qtd</span>
              <input value={draft.quantity} onChange={(e)=> setDraft(d=> ({ ...d, quantity: e.target.value.replace(/[^0-9.]/g, "") }))} className="rounded border px-2 py-2 w-16" />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-gray-700">Desconto</span>
              <input value={draft.discount} onChange={(e)=> setDraft(d=> ({ ...d, discount: e.target.value.replace(/[^0-9.]/g, "") }))} className="rounded border px-2 py-2 w-24" />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-gray-700">Valor</span>
              <input value={draft.unit_price} onChange={(e)=> setDraft(d=> ({ ...d, unit_price: e.target.value.replace(/[^0-9.]/g, "") }))} className="rounded border px-2 py-2 w-24" />
            </label>
            <button type="button" className="rounded bg-brand-green-600 px-3 py-2 text-white" onClick={()=>{
              const srv = services.find(s=> s.id === draft.service_id);
              const name = srv?.name || "Serviço";
              const qty = Number(draft.quantity || "1");
              const price = Number(draft.unit_price || "0");
              const disc = Number(draft.discount || "0");
              setItems(list=> ([...list, { service_id: draft.service_id, service_name_snapshot: name, quantity: qty, unit_price: price, discount: disc }]));
              setDraft({ service_id: undefined, quantity: "1", unit_price: "0", discount: "0" });
            }}>Adicionar</button>
          </div>
          <div className="mt-3 grid gap-2">
            {items.map((it, idx)=> (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{it.service_name_snapshot}</div>
                  <div className="text-gray-600">Qtd {it.quantity} • Preço {it.unit_price.toFixed(2)} • Desc {it.discount.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800">{(it.quantity*it.unit_price - it.discount).toFixed(2)}</span>
                  <button type="button" className="text-red-600" onClick={()=> setItems(list=> list.filter((_ ,i)=> i!==idx))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-2 flex justify-end text-sm">
            <span className="font-semibold">Total: {(items.reduce((sum, it)=> sum + (it.quantity*it.unit_price - it.discount), 0)).toFixed(2)}</span>
          </div>
        </div>

        <label className="grid gap-1">
          <span className="text-sm">Início</span>
          <input type="date" name="start_date" className="rounded border px-3 py-2" value={String(form.start_date ?? "")} onChange={onChange} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Término</span>
          <input type="date" name="end_date" className="rounded border px-3 py-2" value={String(form.end_date ?? "")} onChange={onChange} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Situação</span>
          <select name="status" className="rounded border px-3 py-2" value={form.status ?? "ativo"} onChange={onChange}>
            <option value="ativo">Ativo</option>
            <option value="encerrado">Encerrado</option>
            <option value="suspenso">Suspenso</option>
          </select>
          {fieldErrors.status && <span className="text-xs text-red-600">{fieldErrors.status}</span>}
        </label>

        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">Salvar</button>
          <a href="/contracts" className="rounded bg-gray-500 px-4 py-2 text-white">Cancelar</a>
        </div>
        <div className="sm:col-span-2 mt-4 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-blue-800">Duplicar contrato com reajuste</span>
            <button type="button" className="rounded bg-brand-blue-600 px-3 py-2 text-white" onClick={()=>{
              setAdjPct("0");
              setNewStart(String(form.start_date ?? ""));
              setNewEnd(String(form.end_date ?? ""));
              setDupError(null);
              setShowDuplicateModal(true);
            }}>Duplicar</button>
          </div>
        </div>
      </form>
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-brand-blue-800">Duplicar contrato</h2>
              <button type="button" className="text-gray-600" onClick={()=> setShowDuplicateModal(false)}>Fechar</button>
            </div>
            <div className="mt-3 grid gap-2">
              <label className="grid gap-1">
                <span className="text-sm text-gray-700">Reajuste (%)</span>
                <input value={adjPct} onChange={(e)=> setAdjPct(e.target.value.replace(/[^0-9.,-]/g, ""))} className="rounded border px-3 py-2" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-700">Início</span>
                <input type="date" value={String(newStart)} onChange={(e)=> setNewStart(e.target.value)} className="rounded border px-3 py-2" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-700">Término</span>
                <input type="date" value={String(newEnd)} onChange={(e)=> setNewEnd(e.target.value)} className="rounded border px-3 py-2" />
              </label>
              {dupError && <span className="text-xs text-red-600">{dupError}</span>}
              <div className="flex gap-2">
                <button type="button" disabled={dupLoading} className="rounded bg-brand-green-600 px-3 py-2 text-white" onClick={duplicateWithAdjustment}>{dupLoading?"Processando...":"Aplicar e duplicar"}</button>
                <button type="button" className="rounded bg-gray-500 px-3 py-2 text-white" onClick={()=> setShowDuplicateModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
