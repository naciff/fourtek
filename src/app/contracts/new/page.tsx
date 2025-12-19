"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelSelect } from "@/components/ui/FloatingLabelSelect";
import { ContractSchema } from "@/lib/validation";

export default function NewContractPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<Array<{ service_id?: string; service_name_snapshot: string; quantity: number; unit_price: number; discount: number }>>([]);
  const [draft, setDraft] = useState<{ service_id?: string; quantity: string; unit_price: string; discount: string }>({ service_id: undefined, quantity: "1", unit_price: "0", discount: "0" });
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    due_day: "",
    status: "ativo",
    client_id: "",
    representative_id: ""
  });
  const [autoEndDate, setAutoEndDate] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function maskDateBR(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  }
  function toISODate(v: any): string | null {
    const s = String(v || "").trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const ddmm = s.match(/^([0-3]?\d)\/(1[0-2]|0?[1-9])\/(\d{4})$/);
    if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
    const mmdd = s.match(/^(1[0-2]|0?[1-9])\/([0-3]?\d)\/(\d{4})$/);
    if (mmdd) return `${mmdd[3]}-${mmdd[1].padStart(2, '0')}-${mmdd[2].padStart(2, '0')}`;
    return s;
  }

  function addMonthsMinusOneDayBRFromStart(v: string, months = 12): string | null {
    const iso = toISODate(v);
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return null;
    const added = new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
    const end = new Date(added.getTime() - 24 * 60 * 60 * 1000);
    const dd = String(end.getDate()).padStart(2, "0");
    const mm = String(end.getMonth() + 1).padStart(2, "0");
    const yyyy = String(end.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }

  useEffect(() => {
    Promise.all([
      supabase.from("clients").select("id, alias, trade_name").order("alias", { ascending: true, nullsFirst: false }).order("trade_name"),
      supabase.from("services").select("id,name").order("name")
    ]).then(([c, s]) => {
      setClients(c.data ?? []);
      setServices(s.data ?? []);
      const cid = searchParams?.get("clientId") || "";
      if (cid) setForm((f) => ({ ...f, client_id: cid }));
    });
  }, [supabase, searchParams]);

  useEffect(() => {
    if (!autoEndDate) return;
    const auto = addMonthsMinusOneDayBRFromStart(String((form as any).start_date || ""));
    if (auto && auto !== form.end_date) {
      setForm(f => ({ ...f, end_date: auto }));
    }
  }, [form.start_date, autoEndDate]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const parsed = ContractSchema.safeParse({ ...form, total_value: items.reduce((sum, it) => sum + (it.quantity * it.unit_price - it.discount), 0) });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      setLoading(false);
      return;
    }
    setFieldErrors({});
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (form.client_id) {
      const exists = await supabase.from("contracts").select("id").eq("client_id", form.client_id).limit(1);
      if ((exists.data ?? []).length) { setError("Cliente já possui contrato"); setLoading(false); return; }
    }
    const created = await supabase.from("contracts").insert({
      ...parsed.data,
      start_date: toISODate((form as any).start_date),
      end_date: toISODate((form as any).end_date),
      due_day: parsed.data.due_day ? Number(parsed.data.due_day as any) : null,
      total_value: Number(parsed.data.total_value as any),
      user_id
    }).select("id").single();
    const contractId = created.data?.id;
    let error = created.error as any;
    if (!error && contractId && items.length) {
      const payload = items.map(it => ({
        contract_id: contractId,
        service_id: it.service_id || null,
        service_name_snapshot: it.service_name_snapshot,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount: it.discount,
      }));
      const ins = await supabase.from("contract_items").insert(payload);
      error = ins.error as any;
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

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold text-brand-blue-800">Novo Contrato</h1>
      <form className="mt-4 grid sm:grid-cols-2 gap-6" onSubmit={onSubmit}>
        <div className="sm:col-span-2">
          <FloatingLabelSelect
            label="Cliente"
            name="client_id"
            value={form.client_id}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{(c as any).alias || (c as any).trade_name}</option>
            ))}
          </FloatingLabelSelect>
          {fieldErrors.client_id && <span className="text-xs text-red-600">{fieldErrors.client_id}</span>}
        </div>

        <div>
          <FloatingLabelInput
            label="Dia de vencimento"
            name="due_day"
            placeholder="DD"
            value={form.due_day}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
              setForm((f) => ({ ...f, due_day: digits }));
            }}
          />
          {fieldErrors.due_day && <span className="text-xs text-red-600">{fieldErrors.due_day}</span>}
        </div>

        <div className="sm:col-span-2 rounded border p-3">
          <div className="font-medium text-sm text-brand-blue-800">Itens do Contrato</div>
          <div className="mt-2 flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <FloatingLabelSelect
                label="Serviço"
                value={draft.service_id || ""}
                onChange={(e) => setDraft(d => ({ ...d, service_id: e.target.value || undefined }))}
              >
                <option value="">Selecione</option>
                {services.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </FloatingLabelSelect>
            </div>
            <div className="w-20">
              <FloatingLabelInput
                label="Qtd"
                value={draft.quantity}
                onChange={(e) => setDraft(d => ({ ...d, quantity: e.target.value.replace(/[^0-9.]/g, "") }))}
              />
            </div>
            <div className="w-24">
              <FloatingLabelInput
                label="Desconto"
                value={draft.discount}
                onChange={(e) => setDraft(d => ({ ...d, discount: e.target.value.replace(/[^0-9.]/g, "") }))}
              />
            </div>
            <div className="w-24">
              <FloatingLabelInput
                label="Preço"
                value={draft.unit_price}
                onChange={(e) => setDraft(d => ({ ...d, unit_price: e.target.value.replace(/[^0-9.]/g, "") }))}
              />
            </div>

            <button type="button" className="rounded bg-brand-green-600 px-3 py-2 text-white h-[42px]" onClick={() => {
              const srv = services.find(s => s.id === draft.service_id);
              const name = srv?.name || "Serviço";
              const qty = Number(draft.quantity || "1");
              const price = Number(draft.unit_price || "0");
              const disc = Number(draft.discount || "0");
              setItems(list => ([...list, { service_id: draft.service_id, service_name_snapshot: name, quantity: qty, unit_price: price, discount: disc }]));
              setDraft({ service_id: undefined, quantity: "1", unit_price: "0", discount: "0" });
            }}>Adicionar</button>
          </div>
          <div className="mt-3 grid gap-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{it.service_name_snapshot}</div>
                  <div className="text-gray-600">Qtd {it.quantity} • Preço {Number(it.unit_price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} • Desc {Number(it.discount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800">{Number(it.quantity * it.unit_price - it.discount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  <button type="button" className="text-red-600" onClick={() => setItems(list => list.filter((_, i) => i !== idx))}>Remover</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-2 flex justify-end text-sm">
            <span className="font-semibold">Total: {Number(items.reduce((sum, it) => sum + (it.quantity * it.unit_price - it.discount), 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        </div>

        <FloatingLabelInput
          label="Início"
          name="start_date"
          placeholder="DD/MM/AAAA"
          value={maskDateBR(String(form.start_date || ""))}
          onChange={(e) => {
            setForm((f) => ({ ...f, start_date: maskDateBR(e.target.value) }));
            setAutoEndDate(true);
          }}
        />

        <FloatingLabelInput
          label="Término"
          name="end_date"
          placeholder="DD/MM/AAAA"
          value={maskDateBR(String(form.end_date || ""))}
          onChange={(e) => {
            setAutoEndDate(false);
            setForm((f) => ({ ...f, end_date: maskDateBR(e.target.value) }));
          }}
        />

        <div className="sm:col-span-2">
          <FloatingLabelSelect
            label="Situação"
            name="status"
            value={form.status}
            onChange={onChange}
          >
            <option value="ativo">Ativo</option>
            <option value="encerrado">Encerrado</option>
            <option value="suspenso">Suspenso</option>
          </FloatingLabelSelect>
          {fieldErrors.status && <span className="text-xs text-red-600">{fieldErrors.status}</span>}
        </div>

        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2 flex gap-2 justify-end">
          <Link href="/contracts" className="rounded bg-gray-500 px-4 py-2 text-white">Cancelar</Link>
          <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">Salvar</button>
        </div>
      </form>
    </div>
  );
}
