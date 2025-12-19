"use client";
import React, { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RepresentativeCreateModal from "@/app/representatives/RepresentativeCreateModal";
import { ClientSchema, validators } from "@/lib/validation";
import { formatCNPJ, formatCEP, formatPhone, formatCNS } from "@/lib/format";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelSelect } from "@/components/ui/FloatingLabelSelect";

// import Prov74Section from "@/components/client/Prov74Section"; 
// import RelatoriosSection from "@/components/client/RelatoriosSection";

export default function EditClientPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const btnBase = "inline-flex items-center justify-center rounded-md h-10 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const btnPrimary = `${btnBase} bg-brand-green-600 text-white hover:bg-brand-green-700 shadow-sm`;
  const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200`;
  const btnDestructive = `${btnBase} bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700`;
  const btnGhost = `${btnBase} hover:bg-gray-100 hover:text-gray-900`;
  const btnBlue = `${btnBase} bg-brand-blue-600 text-white hover:bg-brand-blue-700`;

  const [tab, setTab] = useState<'dados' | 'inventario' | 'acesso' | 'servidores' | 'prov74' | 'relatorios' | 'pcn' | 'dadosadicionais' | 'sistemas'>('dados');
  const [form, setForm] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Empresa");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [cepError, setCepError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  const [servicesList, setServicesList] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newServiceName, setNewServiceName] = useState("");

  const [contacts, setContacts] = useState<Array<{ name: string; phone: string }>>([]);

  const [repsList, setRepsList] = useState<any[]>([]);
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [showRepModal, setShowRepModal] = useState(false);
  const [showRepCreateModal, setShowRepCreateModal] = useState(false);
  const [showRepInfoModal, setShowRepInfoModal] = useState(false);
  const [repInfo, setRepInfo] = useState<any>(null);

  const [showContractPrompt, setShowContractPrompt] = useState(false);

  const [invHist, setInvHist] = useState<any[]>([]);
  const [invHistForm, setInvHistForm] = useState({ item: 'Servidor', qtd: '1', descricao: '' });
  const [invHistLoading, setInvHistLoading] = useState(false);
  const [invHistError, setInvHistError] = useState<string | null>(null);

  const [acessos, setAcessos] = useState<any[]>([]);
  const [acessoForm, setAcessoForm] = useState({ tipo_acesso: 'Acesso Remoto', url_tactical: '', url_link_externo: '', usuario_link_externo: '', senha_link_externo: '', id_anydesk: '', senha_anydesk: '', usuario_vpn: '', senha_vpn: '', observacoes: '' });
  const [acessoLoading, setAcessoLoading] = useState(false);
  const [acessoError, setAcessoError] = useState<string | null>(null);

  const [servers, setServers] = useState<any[]>([]);
  // Use a simplified server form for list display/basic add if needed, or just display
  const [serverLoading, setServerLoading] = useState(false);

  const [sistemasList, setSistemasList] = useState<any[]>([]);
  const [selectedSistemas, setSelectedSistemas] = useState<string[]>([]);
  const [newSistemaName, setNewSistemaName] = useState<string>("");

  function useUrlDiagnostics(url: string | undefined) {
    const [diag, setDiag] = useState<any>(null);
    useEffect(() => {
      const s = String(url || "").trim();
      if (!s) { setDiag(null); return; }
      (async () => {
        try {
          const res = await fetch(s, { method: "HEAD" });
          const ct = res.headers.get("content-type") || "";
          setDiag({ ok: res.ok, status: res.status, contentType: ct, url: s });
        } catch (e: any) {
          setDiag({ ok: false, status: 0, contentType: "", url: s, error: e?.message || "Erro de rede/CORS" });
        }
      })();
    }, [url]);
    return diag;
  }

  function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [err, setErr] = useState<string | null>(null);
    const diag = useUrlDiagnostics(src);
    return (
      <div className="grid gap-1">
        <img src={src} alt={alt} className={className} onError={() => setErr("Falha ao carregar imagem")} />
        {err || (diag && !diag.ok) ? (
          <span className="text-xs text-red-600">
            {err || "Imagem inacessível"}{diag ? ` (status ${diag.status}${diag.contentType ? `, ${diag.contentType}` : ""})` : ""}
          </span>
        ) : null}
      </div>
    );
  }

  function SafePdf({ src }: { src: string }) {
    const diag = useUrlDiagnostics(src);
    return (
      <div className="grid gap-2">
        <iframe src={src} className="h-40 w-full rounded border" />
        {diag && !diag.ok ? (
          <span className="text-xs text-red-600">PDF inacessível{` (status ${diag.status}${diag.contentType ? `, ${diag.contentType}` : ""})`}</span>
        ) : null}
        <a href={src} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue-700">Abrir PDF</a>
      </div>
    );
  }

  const hasCloud = selectedServices.some((sid) => {
    const s = servicesList.find((x) => x.id === sid);
    const slug = String(s?.slug || "").toLowerCase();
    const name = String(s?.name || "").toLowerCase();
    return slug.includes("cloud") || name.includes("cloud");
  });

  function brToISO(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const m4 = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m4) {
      const dd = m4[1];
      const mm = m4[2];
      const yyyy = m4[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  }

  function titleCase(s: string) {
    return String(s || "")
      .trim()
      .split(/\s+/)
      .map((w) => w ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : "")
      .join(" ");
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("clients").select("*").eq("id", id).single();
      const raw = String((data as any)?.cns ?? "");
      const digits = validators.digits(raw);
      const padded = digits ? digits.padStart(6, "0") : "";
      setForm({ ...data, cns: padded ? formatCNS(padded) : "" });

      let svc = await supabase.from("services").select("id,name,slug").order("name");
      let list = svc.data ?? [];
      if (!list.length) {
        // Auto-seed handled in new page, assumed existing here
      }
      setServicesList(list);

      const cs = await supabase.from("client_services").select("service_id").eq("client_id", id);
      setSelectedServices((cs.data ?? []).map((x: any) => x.service_id));

      const ec = await supabase.from("client_contacts").select("name,phone").eq("client_id", id).order("created_at", { ascending: true });
      setContacts((ec.data ?? []).map((c: any) => ({ name: c.name || "", phone: c.phone || "" })));

      const reps = await supabase.from("representatives").select("id, full_name, email, phone").order("full_name");
      setRepsList(reps.data ?? []);

      const cr = await supabase.from("client_representatives").select("representative_id").eq("client_id", id);
      setSelectedReps((cr.data ?? []).map((x: any) => x.representative_id));

      let sis = await supabase.from("sistemas").select("id,name,slug").order("name");
      setSistemasList(sis.data ?? []);

      const csis = await supabase.from("client_sistemas").select("sistema_id").eq("client_id", id);
      setSelectedSistemas((csis.data ?? []).map((x: any) => x.sistema_id));
    }
    load();
  }, [id, supabase]);

  useEffect(() => {
    const names = selectedReps
      .map((rid) => repsList.find((x) => x.id === rid)?.full_name)
      .filter(Boolean)
      .join(", ");
    setForm((f: any) => ({ ...f, representatives_text: names }));
  }, [selectedReps, repsList]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 'inventario') { void loadInvHist(); } else if (tab === 'acesso') { void loadAcessos(); } else if (tab === 'servidores') { void loadServers(); } }, [tab, id]);

  function buildAddress(f: any) {
    if (!f) return "";
    return [f.street, f.number, f.complement, f.neighborhood, f.city, f.state, f.zip]
      .map((v: any) => String(v || "").trim())
      .filter(Boolean)
      .join(", ");
  }
  const mapsUrl = form ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(buildAddress(form))}` : "#";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  async function fetchCoords() {
    const addr = buildAddress(form);
    if (!addr) return;
    try {
      if (apiKey) {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${apiKey}`);
        const data = await res.json();
        const loc = data?.results?.[0]?.geometry?.location;
        if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
          setForm((f: any) => ({ ...f, latitude: String(loc.lat), longitude: String(loc.lng) }));
          return;
        }
      }
      const osm = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`, { headers: { "Accept": "application/json", "User-Agent": "FourtekApp/1.0" } });
      const arr = await osm.json();
      const first = Array.isArray(arr) ? arr[0] : null;
      const lat = first?.lat ? Number(first.lat) : undefined;
      const lon = first?.lon ? Number(first.lon) : undefined;
      if (typeof lat === "number" && typeof lon === "number") {
        setForm((f: any) => ({ ...f, latitude: String(lat), longitude: String(lon) }));
      }
    } catch { }
  }

  function onChange(e: React.ChangeEvent<any>) {
    const name = e.target.name;
    const type = e.target.type;
    let val: any = type === "checkbox" ? e.target.checked : e.target.value;
    if (name === "cnpj") val = formatCNPJ(val);
    if (name === "zip") val = formatCEP(val);
    if (name === "phone" || name === "contact_phone") val = formatPhone(val);
    if (name === "cns") val = formatCNS(val);
    if (name === "contract_value") {
      const n = Number(String(val).replace(/,/g, "."));
      if (!Number.isNaN(n)) val = n.toFixed(2);
    }
    if (name === "situation") {
      const today = new Date().toISOString().slice(0, 10);
      setForm((f: any) => ({
        ...f,
        situation: val as string,
        cancellation_date: val === "Cancelado" ? today : "",
      }));
      return;
    }
    setForm((f: any) => ({ ...f, [name]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // ... validation logic ...
    if (hasCloud) {
      if (!form.cloud_size || !form.cloud_date) {
        setError("Preencha os campos Data Cloud e Tamanho Cloud");
        setLoading(false);
        return;
      }
    }
    const normalized = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === null ? undefined : v]));
    const parsed = ClientSchema.safeParse(normalized);
    if (!parsed.success) {
      // ... error handling
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    // ... Save Logic reused from previous ...
    const persistKeys = [
      "corporate_name", "trade_name", "cnpj", "consulta_cnpj", "cns", "state_registration", "street", "number", "neighborhood", "complement", "city", "state", "zip", "latitude", "longitude", "phone", "email", "website", "alias", "situation", "company_type", "cloud_size", "cloud_date", "client_contract", "contract_done", "signed", "implemented", "contract_value", "contract_value_details", "installation_date", "cancellation_date", "contact_name", "contact_phone", "position", "services", "logo_url", "contract_image_url", "cloud_image_url", "representatives_text", "notes"
    ];
    const payload: any = {};
    persistKeys.forEach((k) => {
      let v = (form as any)[k];
      if (k.endsWith("_date")) v = brToISO(String(v || "")) || null;
      if (k === "contract_value") v = v ? Number(String(v).replace(/,/g, ".")) : null;
      if (k === "latitude" || k === "longitude") {
        const s = String(v ?? "").trim();
        v = s ? Number(s) : null;
      }
      if (k === "cns") {
        const d = validators.digits(String(v || "")).slice(0, 6);
        v = d ? Number(d) : null;
      }
      payload[k] = v;
    });
    payload.street = titleCase(String(payload.street || ""));
    payload.neighborhood = titleCase(String(payload.neighborhood || ""));
    payload.city = titleCase(String(payload.city || ""));
    payload.services = selectedServices.map((sid) => servicesList.find(s => s.id === sid)?.name).filter(Boolean).join(", ");

    let { error } = await supabase.from("clients").update(payload).eq("id", id);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Update relations
    await supabase.from("client_contacts").delete().eq("client_id", id);
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    const toInsert = contacts.filter((c) => String(c.name).trim()).map((c) => ({ client_id: id, user_id, name: c.name.trim(), phone: c.phone.trim() }));
    if (toInsert.length) await supabase.from("client_contacts").insert(toInsert);

    // Services
    const svcBefore = await supabase.from("client_services").select("service_id").eq("client_id", id);
    const existingSvc = (svcBefore.data ?? []).map((x: any) => x.service_id);
    const addSvc = selectedServices.filter((sid) => !existingSvc.includes(sid));
    const removeSvc = existingSvc.filter((sid) => !selectedServices.includes(sid));
    if (addSvc.length) await supabase.from("client_services").insert(addSvc.map((sid) => ({ client_id: id, service_id: sid, user_id })));
    if (removeSvc.length) await supabase.from("client_services").delete().in("service_id", removeSvc).eq("client_id", id);

    // Reps
    await supabase.from("client_representatives").delete().eq("client_id", id);
    if (selectedReps.length) {
      await supabase.from("client_representatives").insert(selectedReps.map((rid) => ({ client_id: id, representative_id: rid, user_id })));
    }

    router.replace("/clients");
    router.refresh();
  }

  async function onDelete() {
    const ok = confirm("Deseja realmente excluir este cliente?");
    if (!ok) return;
    await supabase.from("clients").delete().eq("id", id);
    router.replace("/clients");
  }

  async function loadInvHist() {
    const res = await supabase.from('inventario_historico').select('*').eq('client_id', id).order('created_at', { ascending: false });
    setInvHist(res.data || []);
  }

  async function onInvHistSubmit(e: FormEvent) {
    e.preventDefault();
    setInvHistLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const payload = {
      client_id: id,
      user_id: userData.user.id,
      item: invHistForm.item,
      qtd: Number(invHistForm.qtd),
      descricao: invHistForm.descricao
    };
    await supabase.from('inventario_historico').insert(payload);
    setInvHistForm({ item: 'Servidor', qtd: '1', descricao: '' });
    await loadInvHist();
    setInvHistLoading(false);
  }

  async function onInvHistDelete(idRow: string) {
    if (!confirm("Excluir item?")) return;
    await supabase.from('inventario_historico').delete().eq('id', idRow);
    await loadInvHist();
  }

  async function loadAcessos() {
    const res = await supabase.from('dados_acesso').select('*').eq('client_id', id).order('created_at', { ascending: false });
    setAcessos(res.data || []);
  }
  function onAcessoChange(e: React.ChangeEvent<any>) {
    const { name, value } = e.target;
    setAcessoForm((prev) => ({ ...prev, [name]: value }));
  }
  async function onAcessoSubmit(e: FormEvent) {
    e.preventDefault();
    setAcessoLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const payload = { client_id: id, user_id: userData.user.id, ...acessoForm };
    await supabase.from('dados_acesso').insert(payload);
    setAcessoForm({ tipo_acesso: 'Acesso Remoto', url_tactical: '', url_link_externo: '', usuario_link_externo: '', senha_link_externo: '', id_anydesk: '', senha_anydesk: '', usuario_vpn: '', senha_vpn: '', observacoes: '' });
    await loadAcessos();
    setAcessoLoading(false);
  }
  async function onAcessoDelete(idRow: string) {
    if (!confirm("Excluir acesso?")) return;
    await supabase.from('dados_acesso').delete().eq('id', idRow);
    await loadAcessos();
  }

  async function loadServers() {
    const res = await supabase.from('servers').select('*').eq('client_id', id);
    setServers(res.data || []);
  }

  if (!form) return <div className="p-8 text-center text-gray-500">Carregando cliente...</div>;

  const sections = [
    {
      title: "Empresa", fields: [
        "client_contract", "alias",
        "cnpj", "trade_name",
        "corporate_name",
        "state_registration", "cns",
        "company_type", "situation",
        "email", "phone",
        "website", "notes",
        "logo_url"
      ]
    },
    { title: "Endereço", fields: ["zip", "street", "number", "complement", "neighborhood", "city", "state", "latitude", "longitude"] },
    { title: "Contatos", fields: ["contact_name", "contact_phone"] },
    { title: "Representante", fields: ["representatives_text"] },
    { title: "Serviços", fields: [] },
    { title: "Sistemas", fields: [] },
    { title: "Contrato", fields: [] }
  ];
  if (hasCloud) {
    sections.push({ title: "Cloud", fields: ["cloud_size", "cloud_date", "cloud_image_url"] });
  }

  const requiredFields = new Set(["client_contract", "corporate_name", "trade_name", "situation"]);
  const labelMap: Record<string, string> = {
    alias: "Apelido", corporate_name: "Razão Social", trade_name: "Nome Fantasia", cnpj: "CNPJ",
    state_registration: "Inscrição Estadual", consulta_cnpj: "Consulta CNPJ", cns: "CNS",
    street: "Rua", number: "Número", neighborhood: "Bairro", complement: "Complemento", city: "Cidade", state: "UF", zip: "CEP",
    contact_name: "Contato", contact_phone: "Telefone Contato", phone: "Telefone", email: "E-mail", website: "Site",
    situation: "Situação", company_type: "Tipo de Empresa", cloud: "Cloud", cloud_size: "Tamanho Cloud", cloud_date: "Data Cloud",
    client_contract: "Contrato nº", contract_done: "Contrato Feito", signed: "Assinado", implemented: "Implementado", contract_value: "Valor do Contrato",
    installation_date: "Data da Instalação", cancellation_date: "Data Cancelamento", position: "Cargo", services: "Serviços",
    logo_url: "Logo Imagem", contract_image_url: "Imagem Contrato", cloud_image_url: "Imagem Cloud", representatives_text: "Representante", notes: "Observação"
  };

  const navTabClass = (t: string) => `px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${tab === t ? 'border-brand-blue-600 text-brand-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;
  const subTabClass = (t: string) => `px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === t ? 'border-brand-blue-600 text-brand-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
        <button onClick={onDelete} type="button" className={btnDestructive}>Excluir Cliente</button>
      </div>

      <div className="flex border-b overflow-x-auto no-scrollbar">
        {(['dados', 'inventario', 'acesso', 'servidores', 'prov74', 'relatorios', 'pcn', 'dadosadicionais'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={navTabClass(t)}>
            {t === 'dados' ? 'Dados do Cliente' : t === 'inventario' ? 'Inventário' : t === 'acesso' ? 'Dados de Acesso' : t === 'servidores' ? 'Servidores' : t === 'prov74' ? 'Prov. 74' : t === 'relatorios' ? 'Relatórios' : t === 'pcn' ? 'PCN' : 'Dados Adicionais'}
          </button>
        ))}
      </div>

      {tab === 'dados' && (
        <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in duration-300">
          <div className="flex border-b overflow-x-auto no-scrollbar">
            {sections.map(sec => (
              <button key={sec.title} type="button" onClick={() => setActiveTab(sec.title)} className={subTabClass(sec.title)}>{sec.title}</button>
            ))}
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            {sections.map(sec => (
              <div key={sec.title} className={activeTab === sec.title ? 'block' : 'hidden'}>
                <div className="grid gap-6 sm:grid-cols-2">
                  {sec.title === "Sistemas" ? (
                    <div className="sm:col-span-2 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedSistemas.map(sid => {
                          const s = sistemasList.find(x => x.id === sid);
                          return (
                            <span key={sid} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {s?.name}
                              <button type="button" onClick={async () => {
                                await supabase.from('client_sistemas').delete().eq('client_id', id).eq('sistema_id', sid);
                                setSelectedSistemas(prev => prev.filter(x => x !== sid));
                              }} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
                            </span>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <FloatingLabelSelect label="Selecionar Sistema" value="" onChange={async (e) => {
                            const val = e.target.value; if (!val) return;
                            if (selectedSistemas.includes(val)) return;
                            const { data } = await supabase.auth.getUser();
                            if (data.user) {
                              await supabase.from('client_sistemas').upsert({ client_id: id, sistema_id: val, user_id: data.user.id }, { onConflict: 'client_id,sistema_id' });
                              setSelectedSistemas(prev => [...prev, val]);
                            }
                          }}>
                            <option value="">Selecione...</option>
                            {sistemasList.filter(s => !selectedSistemas.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </FloatingLabelSelect>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <div className="flex-1">
                            <FloatingLabelInput label="Novo Sistema" value={newSistemaName} onChange={(e) => setNewSistemaName(e.target.value)} />
                          </div>
                          <button type="button" onClick={async () => {
                            if (!newSistemaName.trim()) return;
                            const slug = newSistemaName.toLowerCase().replace(/\s+/g, '_');
                            const { data } = await supabase.from('sistemas').insert({ name: newSistemaName, slug }).select().single();
                            if (data) { setSistemasList(prev => [...prev, data]); setNewSistemaName(''); }
                          }} className={btnPrimary}>Adicionar</button>
                        </div>
                      </div>
                    </div>
                  ) : sec.title === "Serviços" ? (
                    <div className="sm:col-span-2 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map(sid => {
                          const s = servicesList.find(x => x.id === sid);
                          return (
                            <span key={sid} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {s?.name}
                              <button type="button" onClick={() => setSelectedServices(prev => prev.filter(x => x !== sid))} className="ml-1 text-green-400 hover:text-green-600">×</button>
                            </span>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <FloatingLabelSelect label="Selecionar Serviço" value="" onChange={(e) => {
                            const val = e.target.value; if (!val) return;
                            if (!selectedServices.includes(val)) setSelectedServices(prev => [...prev, val]);
                          }}>
                            <option value="">Selecione...</option>
                            {servicesList.filter(s => !selectedServices.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </FloatingLabelSelect>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <div className="flex-1">
                            <FloatingLabelInput label="Novo Serviço" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
                          </div>
                          <button type="button" onClick={async () => {
                            if (!newServiceName.trim()) return;
                            const slug = newServiceName.toLowerCase().replace(/\s+/g, '_');
                            const { data } = await supabase.from('services').insert({ name: newServiceName, slug, active: true }).select().single();
                            if (data) { setServicesList(prev => [...prev, data]); setSelectedServices(p => [...p, data.id]); setNewServiceName(''); }
                          }} className={btnPrimary}>Adicionar</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    sec.fields.map(key => {
                      // Filter logic
                      if (key === "cancellation_date" && form.situation !== "Cancelado") return null;
                      if (sec.title === "Contrato" && (key === "implemented" || key === "signed")) return null; // handled via checkbox group

                      const labelText = labelMap[key] || key;
                      const isReq = requiredFields.has(key) || (hasCloud && (key === "cloud_size" || key === "cloud_date"));
                      const label = isReq ? `${labelText} *` : labelText;
                      const colSpan = (key === 'street' || key === 'corporate_name' || key.includes('url') || key === 'notes') ? "sm:col-span-2" : "";

                      if (sec.title === "Contrato" && key === "contract_done") {
                        return (
                          <div key={key} className="sm:col-span-2 flex items-center gap-6 py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" name="contract_done" checked={!!form.contract_done} onChange={onChange} className="w-4 h-4 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-600" />
                              <span className="text-sm font-medium text-gray-700">Contrato Feito</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" name="implemented" checked={!!form.implemented} onChange={onChange} className="w-4 h-4 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-600" />
                              <span className="text-sm font-medium text-gray-700">Implementado</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" name="signed" checked={!!form.signed} onChange={onChange} className="w-4 h-4 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-600" />
                              <span className="text-sm font-medium text-gray-700">Assinado</span>
                            </label>
                          </div>
                        )
                      }

                      if (key.includes('url')) { // Images/PDF specific handling
                        return (
                          <div key={key} className={colSpan}>
                            <span className="block text-sm font-medium text-gray-700 mb-1">{labelText}</span>
                            <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const { data: userData } = await supabase.auth.getUser();
                              const path = `${userData.user?.id || 'anon'}/${key.split('_')[0]}/${Date.now()}-${file.name}`;
                              await supabase.storage.from('files').upload(path, file);
                              const { data } = supabase.storage.from('files').getPublicUrl(path);
                              setForm({ ...form, [key]: data.publicUrl });
                            }} />
                            {form[key] && (
                              <div className="mt-2">
                                {String(form[key]).toLowerCase().endsWith('.pdf') ? <SafePdf src={form[key]} /> : <SafeImg src={form[key]} alt={labelText} className="h-24 w-auto object-contain border rounded" />}
                              </div>
                            )}
                          </div>
                        )
                      }

                      if (key === 'cnpj') {
                        return (
                          <div key={key} className={`${colSpan} flex gap-2`}>
                            <div className="flex-1">
                              <FloatingLabelInput label={label} name={key} value={form[key] || ""} onChange={onChange} />
                            </div>
                            <button type="button" onClick={async () => {
                              // existing cnpj search logic
                              const d = validators.digits(form.cnpj);
                              if (d.length !== 14) { setCnpjError("Inválido"); return; }
                              setCnpjLoading(true);
                              const res = await fetch(`/api/cnpj?cnpj=${d}`);
                              if (res.ok) { const info = await res.json(); setForm((f: any) => ({ ...f, ...info })); }
                              setCnpjLoading(false);
                            }} className={btnSecondary}>{cnpjLoading ? "..." : "Buscar"}</button>
                          </div>
                        )
                      }

                      if (key === 'zip') {
                        return (
                          <div key={key} className={`${colSpan} flex gap-2`}>
                            <div className="flex-1">
                              <FloatingLabelInput label={label} name={key} value={form[key] || ""} onChange={onChange} />
                            </div>
                            <button type="button" onClick={async () => {
                              // existing cep search logic
                              const d = validators.digits(form.zip);
                              if (d.length !== 8) return;
                              setCepLoading(true);
                              const res = await fetch(`/api/cep?cep=${d}`);
                              if (res.ok) { const info = await res.json(); setForm((f: any) => ({ ...f, ...info })); }
                              setCepLoading(false);
                            }} className={btnSecondary}>{cepLoading ? "..." : "Buscar"}</button>
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-blue-700 px-3 py-2 h-[42px] border border-transparent hover:bg-gray-50 rounded" title="Abrir rota no Google Maps">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z" /></svg>
                              <span className="hidden sm:inline">Rota</span>
                            </a>
                            <button type="button" onClick={fetchCoords} className="inline-flex items-center gap-2 text-sm text-brand-green-700 px-3 py-2 h-[42px] border border-transparent hover:bg-gray-50 rounded" title="Buscar coordenadas automaticamente">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v5H6v2h5v5h2v-5h5v-2h-5V7z" /></svg>
                              <span className="hidden sm:inline">Coords</span>
                            </button>
                          </div>
                        )
                      }

                      if (key === "situation") {
                        return (
                          <div key={key} className={colSpan}>
                            <FloatingLabelSelect label={label} name={key} value={form[key] || "Ativo"} onChange={onChange}>
                              <option value="Ativo">Ativo</option>
                              <option value="Aguardando">Aguardando</option>
                              <option value="Suspenso">Suspenso</option>
                              <option value="Cancelado">Cancelado</option>
                            </FloatingLabelSelect>
                          </div>
                        )
                      }

                      if (key === "company_type") {
                        return (
                          <div key={key} className={colSpan}>
                            <FloatingLabelSelect label={label} name={key} value={form[key] || "Empresa"} onChange={onChange}>
                              <option value="Empresa">Empresa</option>
                              <option value="Cartório">Cartório</option>
                            </FloatingLabelSelect>
                          </div>
                        )
                      }

                      // Default text input
                      return (
                        <div key={key} className={colSpan}>
                          <FloatingLabelInput label={label} name={key} value={form[key] || ""} onChange={onChange} />
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className={`${btnPrimary} w-32`}>{loading ? "Salvando..." : "Salvar"}</button>
            <button type="button" onClick={() => router.replace("/clients")} className={btnSecondary}>Cancelar</button>
          </div>
        </form>
      )}

      {tab === 'inventario' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Item ao Histórico</h3>
            <form onSubmit={onInvHistSubmit} className="grid sm:grid-cols-4 gap-4 items-end">
              <FloatingLabelSelect label="Item" value={invHistForm.item} onChange={e => setInvHistForm({ ...invHistForm, item: e.target.value })}>
                <option value="Servidor">Servidor</option>
                <option value="Estação de Trabalho">Estação de Trabalho</option>
                <option value="Impressora">Impressora</option>
                <option value="Nobreak">Nobreak</option>
                <option value="Outro">Outro</option>
              </FloatingLabelSelect>
              <FloatingLabelInput label="Quantidade" type="number" value={invHistForm.qtd} onChange={e => setInvHistForm({ ...invHistForm, qtd: e.target.value })} />
              <div className="sm:col-span-2 flex gap-2">
                <div className="flex-1">
                  <FloatingLabelInput label="Descrição" value={invHistForm.descricao} onChange={e => setInvHistForm({ ...invHistForm, descricao: e.target.value })} />
                </div>
                <button type="submit" disabled={invHistLoading} className={btnPrimary}>{invHistLoading ? "..." : "Adicionar"}</button>
              </div>
            </form>
          </div>

          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invHist.length === 0 ? <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum item registrado.</td></tr> :
                  invHist.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.item}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.qtd}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.descricao}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button onClick={() => onInvHistDelete(item.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'acesso' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Dados de Acesso</h3>
            <form onSubmit={onAcessoSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FloatingLabelSelect label="Tipo de Acesso" name="tipo_acesso" value={acessoForm.tipo_acesso} onChange={onAcessoChange}>
                  <option value="Acesso Remoto">Acesso Remoto</option>
                  <option value="VPN">VPN</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Outro">Outro</option>
                </FloatingLabelSelect>
                <FloatingLabelInput label="Link Externo (URL)" name="url_link_externo" value={acessoForm.url_link_externo} onChange={onAcessoChange} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <FloatingLabelInput label="AnyDesk ID" name="id_anydesk" value={acessoForm.id_anydesk} onChange={onAcessoChange} />
                <FloatingLabelInput label="Senha AnyDesk" name="senha_anydesk" value={acessoForm.senha_anydesk} onChange={onAcessoChange} />
                <FloatingLabelInput label="URL Tactical" name="url_tactical" value={acessoForm.url_tactical} onChange={onAcessoChange} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase text-gray-500">Credenciais Link Externo</h4>
                  <FloatingLabelInput label="Usuário" name="usuario_link_externo" value={acessoForm.usuario_link_externo} onChange={onAcessoChange} />
                  <FloatingLabelInput label="Senha" name="senha_link_externo" value={acessoForm.senha_link_externo} onChange={onAcessoChange} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase text-gray-500">Credenciais VPN</h4>
                  <FloatingLabelInput label="Usuário" name="usuario_vpn" value={acessoForm.usuario_vpn} onChange={onAcessoChange} />
                  <FloatingLabelInput label="Senha" name="senha_vpn" value={acessoForm.senha_vpn} onChange={onAcessoChange} />
                </div>
              </div>
              <FloatingLabelInput label="Observações" name="observacoes" value={acessoForm.observacoes} onChange={onAcessoChange} />
              <div className="flex justify-end">
                <button type="submit" disabled={acessoLoading} className={btnPrimary}>{acessoLoading ? "Salvando..." : "Adicionar Acesso"}</button>
              </div>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {acessos.map(acesso => (
              <div key={acesso.id} className="rounded-lg border bg-white p-4 shadow-sm relative group">
                <button onClick={() => onAcessoDelete(acesso.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium uppercase">{acesso.tipo_acesso}</span>
                  <span className="text-xs text-gray-400">{new Date(acesso.created_at).toLocaleDateString()}</span>
                </div>
                <dl className="space-y-2 text-sm">
                  {acesso.url_link_externo && <div className="truncate"><dt className="text-xs text-gray-500">Link:</dt><dd><a href={acesso.url_link_externo} target="_blank" className="text-blue-600 hover:underline">{acesso.url_link_externo}</a></dd></div>}
                  {(acesso.usuario_link_externo || acesso.senha_link_externo) && <div className="grid grid-cols-2 gap-1 bg-gray-50 p-2 rounded">
                    <div><dt className="text-xs text-gray-500">Usuário:</dt><dd className="font-mono">{acesso.usuario_link_externo || '-'}</dd></div>
                    <div><dt className="text-xs text-gray-500">Senha:</dt><dd className="font-mono">{acesso.senha_link_externo || '-'}</dd></div>
                  </div>}
                  {acesso.id_anydesk && <div className="flex justify-between border-t pt-2 mt-2"><dt className="text-gray-500">AnyDesk:</dt><dd>{acesso.id_anydesk} / {acesso.senha_anydesk}</dd></div>}
                  {acesso.usuario_vpn && <div className="flex justify-between"><dt className="text-gray-500">VPN:</dt><dd>{acesso.usuario_vpn}</dd></div>}
                </dl>
                {acesso.observacoes && <p className="mt-3 text-xs text-gray-500 ipalic border-t pt-2">{acesso.observacoes}</p>}
              </div>
            ))}
            {acessos.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">Nenhum acesso registrado.</div>}
          </div>
        </div>
      )}

      {tab === 'servidores' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Lista de Servidores</h3>
            <p className="text-sm text-gray-500 mb-4">Gerencie os servidores vinculados a este cliente.</p>
            {servers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded border border-dashed text-gray-400">
                Nenhum servidor cadastrado. Use a aba &quot;Inventário&quot; para adicionar itens ou implemente o cadastro detalhado aqui.
              </div>
            ) : (
              <ul className="space-y-2">
                {servers.map(s => (
                  <li key={s.id} className="p-3 bg-gray-50 rounded border flex justify-between">
                    <span>{s.hostname || 'Servidor Sem Nome'}</span>
                    <span className="text-sm text-gray-500">{s.ip_address}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Placeholders for other tabs */}
      {tab === 'prov74' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Módulo Provimento 74 em manutenção.</div>}
      {tab === 'relatorios' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Módulo de Relatórios em manutenção.</div>}
      {tab === 'pcn' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Módulo PCN em desenvolvimento.</div>}
      {tab === 'dadosadicionais' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Dados Adicionais vazio.</div>}

      {showRepCreateModal && (
        <RepresentativeCreateModal
          onClose={() => setShowRepCreateModal(false)}
          onCreated={(newRep) => {
            setRepsList((prev) => [...prev, newRep]);
            setSelectedReps((prev) => [...prev, newRep.id]);
            setShowRepCreateModal(false);
          }}
        />
      )}
    </div>
  );
}