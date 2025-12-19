"use client";
import { useState, useEffect, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RepresentativeCreateModal from "@/app/representatives/RepresentativeCreateModal";
import { ClientSchema, validators } from "@/lib/validation";
import { formatCNPJ, formatCEP, formatPhone, formatCNS } from "@/lib/format";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelSelect } from "@/components/ui/FloatingLabelSelect";

export default function NewClientPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [form, setForm] = useState({
    corporate_name: "",
    trade_name: "",
    cnpj: "",
    state_registration: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    website: "",
    situation: "",
    company_type: "",

    cloud_size: "",
    cloud_date: "",
    client_contract: "",
    alias: "",
    contract_done: false,
    signed: false,
    implemented: false,
    contract_value: "",
    contract_value_details: "",
    installation_date: "",
    cancellation_date: "",
    contact_name: "",
    contact_phone: "",
    position: "",
    services: "",

    logo_url: "",
    contract_image_url: "",
    cloud_image_url: "",
    representatives_text: "",
    notes: "",
    consulta_cnpj: "",
    cns: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
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
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [showContractPrompt, setShowContractPrompt] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const hasCloud = selectedServices.some((sid) => {
    const s = servicesList.find((x) => x.id === sid);
    const slug = String(s?.slug || "").toLowerCase();
    const name = String(s?.name || "").toLowerCase();
    return slug.includes("cloud") || name.includes("cloud");
  });

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
      setForm((f) => ({
        ...f,
        situation: val as string,
        cancellation_date: val === "Cancelado" ? today : "",
      }));
      return;
    }
    setForm((f) => ({ ...f, [name]: val }));
  }

  function isRequired(key: string) {
    return requiredFields.has(key) || (hasCloud && (key === "cloud_date" || key === "cloud_size"));
  }

  function markInvalid(key: string) {
    const val = String((form as any)[key] ?? "").trim();
    setInvalidFields((m) => ({ ...m, [key]: isRequired(key) && val.length === 0 }));
  }

  function maskDateBR(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  }
  function isoToBR(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, dd] = v.split("-");
      return `${dd}/${m}/${y}`;
    }
    return v;
  }
  function isoToDayMonth(v?: string | null) {
    const s = String(v || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s.slice(8, 10)}/${s.slice(5, 7)}`;
    return "";
  }
  function brToISO(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const m4 = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m4) {
      const dd = m4[1];
      const mm = m4[2];
      const yyyy = m4[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    const m2 = v.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    if (m2) {
      const dd = m2[1];
      const mm = m2[2];
      const yy = m2[3];
      const yyyy = `20${yy}`;
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
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
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      setLoading(false);
      return;
    }
    setFieldErrors({});
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    const persistKeys = [
      "corporate_name", "trade_name", "cnpj", "consulta_cnpj", "cns", "state_registration", "street", "number", "neighborhood", "complement", "city", "state", "zip", "latitude", "longitude", "phone", "email", "website", "alias", "situation", "company_type", "cloud_size", "cloud_date", "client_contract", "contract_done", "signed", "implemented", "installation_date", "cancellation_date", "contact_name", "contact_phone", "position", "services", "logo_url", "contract_image_url", "cloud_image_url", "representatives_text", "notes"
    ];
    const payload: any = { user_id };
    persistKeys.forEach((k) => {
      let v = (form as any)[k];
      if (k.endsWith("_date")) v = brToISO(String(v || "")) || null;

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
    payload.services = selectedServices.join(", ");
    {
      const d = validators.digits(String(payload.cnpj || ""));
      if (d && d.length === 14) {
        payload.consulta_cnpj = `https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${d}`;
      }
    }
    let { data: created, error } = await supabase.from("clients").insert(payload).select("id").single();
    setLoading(false);
    if (error || !created) {
      if ((error as any)?.code === '23505') {
        const top = await supabase.from("clients").select("client_contract").order("client_contract", { ascending: false }).limit(1);
        const max = Number((top.data?.[0] as any)?.client_contract || 0);
        const next = (Number.isFinite(max) ? max : 0) + 1;
        const retryPayload = { ...payload, client_contract: next };
        const retry = await supabase.from("clients").insert(retryPayload).select("id").single();
        if (retry.error || !retry.data) {
          setError('Contrato já existente');
          return;
        }
        created = retry.data;
      } else if ((error as any)?.code === '42703') {
        const retryPayload = { ...payload };
        delete (retryPayload as any).cargo;
        const retry = await supabase.from("clients").insert(retryPayload).select("id").single();
        if (retry.error || !retry.data) { setError(error?.message || 'Erro ao salvar'); return; }
        created = retry.data;
      } else {
        setError(error?.message || 'Erro ao salvar');
        return;
      }
    }
    if (contacts.length) {
      const toInsert = contacts.filter((c) => String(c.name).trim()).map((c) => ({ client_id: created.id, user_id, name: c.name.trim(), phone: c.phone.trim() }));
      if (toInsert.length) await supabase.from("client_contacts").insert(toInsert);
    }
    if (selectedServices.length) {
      await supabase.from("client_services").insert(selectedServices.map((sid) => ({ client_id: created.id, service_id: sid, user_id })));
    }
    if (selectedReps.length) {
      await supabase.from("client_representatives").insert(selectedReps.map((rid) => ({ client_id: created.id, representative_id: rid, user_id })));
    }
    setCreatedId(String(created.id));
    if (String(form.situation || "Ativo") !== "Cancelado") {
      setShowContractPrompt(true);
      return;
    }
    router.replace("/clients");
    router.refresh();
  }

  function buildAddress(f: any) {
    return [f.street, f.number, f.complement, f.neighborhood, f.city, f.state, f.zip]
      .map((v: any) => String(v || "").trim())
      .filter(Boolean)
      .join(", ");
  }
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(buildAddress(form))}`;
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

  const labelMap: Record<string, string> = {
    alias: "Apelido",
    corporate_name: "Razão Social",
    trade_name: "Nome Fantasia",
    cnpj: "CNPJ",
    state_registration: "Inscrição Estadual",
    consulta_cnpj: "Consulta CNPJ",
    cns: "CNS",
    street: "Rua",
    number: "Número",
    neighborhood: "Bairro",
    complement: "Complemento",
    city: "Cidade",
    state: "UF",
    zip: "CEP",
    latitude: "Latitude",
    longitude: "Longitude",
    contact_name: "Contato",
    contact_phone: "Telefone Contato",
    phone: "Telefone",
    email: "E-mail",
    website: "Site",
    situation: "Situação",
    company_type: "Tipo de Empresa",
    provimento_74: "Provimento 74",
    workstation_support: "Suporte Estação de Trabalho",
    cloud: "Cloud",
    cloud_size: "Tamanho Cloud",
    cloud_date: "Data Cloud",
    client_contract: "Contrato",
    contract_done: "Contrato Feito",
    signed: "Assinado",
    implemented: "Implementado",
    contract_value: "Valor do Contrato",

    installation_date: "Data da Instalação",
    cancellation_date: "Data Cancelamento",
    position: "Cargo",
    services: "Serviços",
    generate_pdf: "Gerar PDF",
    pdf_url: "PDF",
    logo_url: "Logo Imagem",
    contract_image_url: "Imagem Contrato",
    cloud_image_url: "Imagem Cloud",
    representatives_text: "Representante",
    notes: "Observação",
  };
  const sections = [
    { title: "Empresa", fields: ["client_contract", "alias", "cnpj", "consulta_cnpj", "corporate_name", "trade_name", "state_registration", "cns", "company_type", "situation", "email", "phone", "site", "notes", "logo_url"].map((f) => f === "site" ? "website" : f) },
    { title: "Endereço", fields: ["zip", "street", "number", "complement", "neighborhood", "city", "state", "latitude", "longitude"] },
    { title: "Contatos", fields: ["contact_name", "contact_phone"] },
    { title: "Representante", fields: ["representatives_text"] },
    { title: "Serviços", fields: [] },
    ... (hasCloud ? [{ title: "Cloud", fields: ["cloud_size", "cloud_date", "cloud_image_url"] }] : []),
    { title: "Contrato", fields: ["contract_done", "signed", "implemented", "installation_date", "cancellation_date", "contract_image_url"] },
  ];

  const requiredFields = new Set([
    "client_contract",
    "corporate_name",
    "trade_name",
    "street",
    "neighborhood",
    "zip",
    "state",
    "city",
    "contract_value",
    "installation_date",
    "company_type",
    "situation",
  ]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("services").select("id,name,slug").order("name");
      let list = data ?? [];
      if (!list.length) {
        const defaults = [
          { name: "Cloud", slug: "cloud" },
          { name: "Firewall", slug: "firewall" },
          { name: "Servidor/Monitoramento (Prov. 74)", slug: "prov74" },
          { name: "Suporte Estação de Trabalho", slug: "workstation_support" },
          { name: "Sistema de Atendimento (SGA)", slug: "sga" },
        ];
        await supabase.from("services").upsert(defaults, { onConflict: "slug" });
        const seeded = await supabase.from("services").select("id,name,slug").order("name");
        list = seeded.data ?? [];
      }
      setServicesList(list);
      const top = await supabase.from("clients").select("client_contract").order("client_contract", { ascending: false }).limit(1);
      const max = Number((top.data?.[0] as any)?.client_contract || 0);
      setForm((f: any) => ({ ...f, client_contract: String((Number.isFinite(max) ? max : 0) + 1) }));
      const reps = await supabase.from("representatives").select("id, full_name, email, phone").order("full_name");
      setRepsList(reps.data ?? []);
    })();
  }, [supabase]);

  useEffect(() => {
    const names = selectedReps
      .map((rid) => repsList.find((x) => x.id === rid)?.full_name)
      .filter(Boolean)
      .join(", ");
    setForm((f: any) => ({ ...f, representatives_text: names }));
  }, [selectedReps, repsList]);

  async function openRepDetails() {
    if (!selectedReps.length) return;
    const rid = selectedReps[0];
    const res = await supabase.from("representatives").select("*").eq("id", rid).single();
    setRepInfo(res.data);
    setShowRepInfoModal(true);
  }

  const [activeTab, setActiveTab] = useState("Empresa");

  useEffect(() => {
    const firstErrorKey = Object.keys(fieldErrors)[0];
    if (firstErrorKey) {
      const section = sections.find((s) => s.fields.includes(firstErrorKey));
      if (section) {
        setActiveTab(section.title);
      } else {
        // Fallback for fields not directly in a section (if any) or complex logic
        if (firstErrorKey === "cloud_size" || firstErrorKey === "cloud_date") setActiveTab("Cloud");
      }
    }
  }, [fieldErrors]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-white">Novo Cliente</h1>

      <div className="mt-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {sections.map((sec) => (
            <button
              key={sec.title}
              type="button"
              onClick={() => setActiveTab(sec.title)}
              className={`
                whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors
                ${activeTab === sec.title
                  ? "border-brand-blue-600 text-brand-blue-600 dark:border-brand-blue-400 dark:text-brand-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"}
              `}
            >
              {sec.title}
            </button>
          ))}
        </nav>
      </div>

      <form className="mt-4 grid gap-6" onSubmit={onSubmit}>
        {sections.map((sec) => (
          <div key={sec.title} className={activeTab === sec.title ? "block" : "hidden"}>
            <fieldset className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
              {/* <legend className="px-2 text-base font-semibold text-brand-blue-800 dark:text-brand-blue-400">{sec.title}</legend> */}
              {sec.title === "Endereço" ? null : null}
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {sec.title === "Serviços" ? (
                  <div className="sm:col-span-2 grid gap-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map((sid) => {
                        const s = servicesList.find((x) => x.id === sid);
                        return (
                          <span key={sid} className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-sm shadow-sm">
                            <span className="text-brand-blue-700"><ServiceIcon s={s} /></span>
                            <span>{s?.name || "Serviço"}</span>
                            <button type="button" className="text-red-600 hover:text-red-700" onClick={() => setSelectedServices((prev) => prev.filter((x) => x !== sid))}>×</button>
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <select value="" onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        setSelectedServices((prev) => prev.includes(val) ? prev : [...prev, val]);
                        e.currentTarget.selectedIndex = 0;
                      }} className="rounded border px-3 py-2 flex-1">
                        <option value="">+ Adicionar serviço</option>
                        {servicesList.filter((s) => !selectedServices.includes(s.id)).map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Novo serviço" className="rounded border px-3 py-2 flex-1" />
                      <button type="button" className="rounded bg-brand-green-600 px-3 py-2 text-white" onClick={async () => {
                        const name = newServiceName.trim();
                        if (!name) return;
                        const { data, error } = await supabase.from("services").insert({ name, slug: name.toLowerCase().replace(/\W+/g, '_'), active: true }).select("id,name").single();
                        if (!error && data) {
                          setServicesList((list) => [...list, data]);
                          setSelectedServices((sel) => [...sel, data.id]);
                          setNewServiceName("");
                        }
                      }}>+ Adicionar</button>
                    </div>
                  </div>
                ) : (
                  sec.fields
                    .filter((key) => !(key === "cancellation_date" && String((form as any).situation || "Ativo") !== "Cancelado"))
                    .filter((key) => !(sec.title === "Contrato" && (key === "implemented" || key === "signed")))
                    .filter((key) => !(sec.title === "Representante" && (key === "representatives_text" || key === "position")))
                    .map((key) => {
                      const label = (labelMap[key] || key) + ((requiredFields.has(key) || (hasCloud && (key === "cloud_date" || key === "cloud_size"))) ? " *" : "");

                      if (sec.title === "Contrato" && key === "contract_done") {
                        return (
                          <div key={key} className="flex gap-4 items-center h-[42px] px-1">
                            <label className="inline-flex items-center gap-2 whitespace-nowrap cursor-pointer">
                              <input type="checkbox" name="contract_done" checked={Boolean((form as any).contract_done)} onChange={onChange} className="rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-600 h-5 w-5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Contrato Feito</span>
                            </label>
                            <label className="inline-flex items-center gap-2 whitespace-nowrap cursor-pointer">
                              <input type="checkbox" name="implemented" checked={Boolean((form as any).implemented)} onChange={onChange} className="rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-600 h-5 w-5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Implementado</span>
                            </label>
                            <label className="inline-flex items-center gap-2 whitespace-nowrap cursor-pointer">
                              <input type="checkbox" name="signed" checked={Boolean((form as any).signed)} onChange={onChange} className="rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-600 h-5 w-5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Assinado</span>
                            </label>
                          </div>
                        );
                      }

                      if (key === "consulta_cnpj" || key === "website") {
                        return (
                          <div key={key} className="flex gap-2 items-center">
                            <div className="flex-1">
                              <FloatingLabelInput label={label} name={key} value={String((form as any)[key] || "")} onChange={onChange} />
                            </div>
                            {String((form as any)[key] || "").trim() ? (
                              <a
                                href={(String((form as any)[key]).startsWith("http") ? String((form as any)[key]) : `http://${String((form as any)[key])}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir link"
                                aria-label="Abrir link"
                                className="inline-flex items-center justify-center rounded bg-brand-blue-600 text-white px-3 py-2 h-[42px]"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" /><path d="M5 5h7v2H7v10h10v-5h2v7H5V5z" /></svg>
                              </a>
                            ) : null}
                          </div>
                        );
                      }

                      if (key === "cnpj") {
                        return (
                          <div key={key} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <FloatingLabelInput
                                label={label}
                                name={key}
                                value={String((form as any)[key] || "")}
                                onChange={(e) => { setCnpjError(null); onChange(e); }}
                                required
                              />
                            </div>
                            <button type="button" className="rounded bg-brand-green-600 px-3 py-2 text-white h-[42px]" onClick={async () => {
                              setCnpjError(null);
                              const d = validators.digits(String((form as any)["cnpj"]))
                              if (d.length !== 14) { setCnpjError("CNPJ inválido (14 dígitos)"); return; }
                              setCnpjLoading(true);
                              try {
                                const res = await fetch(`/api/cnpj?cnpj=${d}`);
                                if (!res.ok) { setCnpjError("Consulta indisponível"); return; }
                                const info = await res.json();
                                setForm((f) => ({ ...f, ...info }));
                              } catch {
                                setCnpjError("Erro de rede na consulta");
                              } finally {
                                setCnpjLoading(false);
                              }
                            }}>{cnpjLoading ? "Buscando..." : "Buscar CNPJ"}</button>
                            {(() => {
                              const d = validators.digits(String((form as any)["cnpj"]))
                              const href = d.length === 14 ? `https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${d}` : "#";
                              const disabled = d.length !== 14;
                              return (
                                <a
                                  href={href}
                                  target={disabled ? undefined : "_blank"}
                                  rel={disabled ? undefined : "noopener noreferrer"}
                                  title="Consulta CNPJ"
                                  aria-label="Consulta CNPJ"
                                  className={`inline-flex items-center justify-center rounded bg-brand-blue-600 text-white px-3 py-2 h-[42px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" /><path d="M5 5h7v2H7v10h10v-5h2v7H5V5z" /></svg>
                                </a>
                              );
                            })()}
                            {cnpjError && <span className="text-xs text-red-600 ml-2 self-center">{cnpjError}</span>}
                          </div>
                        );
                      }

                      if (key === "zip") {
                        return (
                          <div key={key} className="flex gap-2 items-start flex-wrap sm:col-span-2">
                            <div className="w-40">
                              <FloatingLabelInput
                                label={label}
                                name={key}
                                value={String((form as any)[key] || "")}
                                onChange={(e) => { setCepError(null); onChange(e); }}
                                onBlur={() => markInvalid(key)}
                                required
                                className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}
                              />
                            </div>
                            <button type="button" className="rounded bg-brand-blue-600 px-3 py-2 text-white h-[42px]" onClick={async () => {
                              setCepError(null);
                              const d = validators.digits(String((form as any)["zip"]))
                              if (d.length !== 8) { setCepError("CEP inválido (8 dígitos)"); return; }
                              setCepLoading(true);
                              try {
                                const res = await fetch(`/api/cep?cep=${d}`);
                                if (!res.ok) { setCepError("Consulta indisponível"); return; }
                                const info = await res.json();
                                setForm((f) => ({ ...f, ...info }));
                              } catch {
                                setCepError("Erro de rede na consulta");
                              } finally {
                                setCepLoading(false);
                              }
                            }}>{cepLoading ? "Buscando..." : "Buscar CEP"}</button>
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-blue-700 px-3 py-2 h-[42px]">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z" /></svg>
                              <span>Abrir rota</span>
                            </a>
                            <button type="button" onClick={fetchCoords} className="inline-flex items-center gap-2 text-sm text-brand-green-700 px-3 py-2 h-[42px]">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v5H6v2h5v5h2v-5h5v-2h-5V7z" /></svg>
                              <span>Buscar coordenadas</span>
                            </button>
                            {cepError && <span className="text-xs text-red-600 ml-2 self-center">{cepError}</span>}
                            {invalidFields[key] && <span className="text-xs text-red-600 ml-2 self-center">Campo obrigatório</span>}
                          </div>
                        );
                      }

                      if (typeof (form as any)[key] === "boolean") {
                        return (
                          <label key={key} className="grid gap-1">
                            <span className="text-sm text-gray-700">{label}</span>
                            <input type="checkbox" name={key} checked={(form as any)[key] as boolean} onChange={onChange} className="rounded border h-5 w-5" />
                          </label>
                        );
                      }

                      if (key.endsWith("_date")) {
                        return (
                          <div key={key}>
                            <FloatingLabelInput
                              label={label}
                              type="text"
                              name={key}
                              placeholder="DD/MM/AAAA"
                              value={maskDateBR(isoToBR(String((form as any)[key] || "")))}
                              autoComplete="off"
                              onChange={(e) => {
                                const v = maskDateBR(e.target.value);
                                setForm((f) => ({ ...f, [key]: v }));
                              }}
                              onBlur={() => markInvalid(key)}
                              required={requiredFields.has(key) || (hasCloud && key === "cloud_date")}
                              className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}
                            />
                          </div>
                        );
                      }

                      if (key === "contract_value") {
                        return (
                          <div key={key}>
                            <FloatingLabelInput
                              label={label}
                              type="number"
                              step="0.01"
                              name={key}
                              value={String((form as any)[key] || "")}
                              onChange={onChange}
                              onBlur={() => markInvalid(key)}
                              required
                              className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}
                            />
                          </div>
                        );
                      }

                      if (key === "cloud_image_url" || key === "contract_image_url" || key === "logo_url") {
                        // File inputs remain standard for now as they are complex
                        return (
                          <div key={key} className="grid gap-1">
                            <span className="text-sm text-gray-700">{label}</span>
                            <div className="grid gap-2">
                              <input type="file" accept={key === "contract_image_url" ? "image/*,application/pdf,.pdf" : "image/*"} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const { data: userData } = await supabase.auth.getUser();
                                const uid = userData.user?.id || "anon";
                                const folder = key === "logo_url" ? "logos" : (key === "cloud_image_url" ? "cloud" : "contracts");
                                const path = `${uid}/${folder}/${Date.now()}-${file.name}`;
                                await supabase.storage.from("files").upload(path, file, { upsert: true });
                                const { data } = supabase.storage.from("files").getPublicUrl(path);
                                setForm((f) => ({ ...f, [key]: data.publicUrl }));
                              }} className="text-sm" />
                              {(form as any)[key] ? (
                                key === "contract_image_url" && String((form as any).contract_image_url).toLowerCase().includes('.pdf') ? (
                                  <div className="grid gap-2">
                                    <iframe src={String((form as any).contract_image_url)} className="h-40 w-full rounded border" />
                                    <a href={String((form as any).contract_image_url)} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue-700">Abrir PDF</a>
                                  </div>
                                ) : (
                                  <img src={String((form as any)[key])} alt="Preview" className="h-20 rounded border object-contain bg-gray-50" />
                                )
                              ) : null}
                            </div>
                          </div>
                        );
                      }

                      if (key === "company_type") {
                        return (
                          <div key={key}>
                            <FloatingLabelSelect label={label} name={key} value={String((form as any)[key] || "Empresa")} onChange={onChange} onBlur={() => markInvalid(key)} required className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}>
                              <option value="Empresa">Empresa</option>
                              <option value="Cartório">Cartório</option>
                            </FloatingLabelSelect>
                          </div>
                        );
                      }

                      if (key === "situation") {
                        return (
                          <div key={key}>
                            <FloatingLabelSelect label={label} name={key} value={String((form as any)[key] || "Ativo")} onChange={onChange} onBlur={() => markInvalid(key)} required className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}>
                              <option value="Ativo">Ativo</option>
                              <option value="Aguardando">Aguardando</option>
                              <option value="Suspenso">Suspenso</option>
                              <option value="Cancelado">Cancelado</option>
                            </FloatingLabelSelect>
                          </div>
                        );
                      }

                      if (key === "cargo") {
                        return (
                          <div key={key}>
                            <FloatingLabelSelect label={label} name={key} value={String((form as any)[key] || "Representante")} onChange={onChange}>
                              <option value="Oficial(a)">Oficial(a)</option>
                              <option value="Respondente (Interino)">Respondente (Interino)</option>
                              <option value="Representante">Representante</option>
                            </FloatingLabelSelect>
                          </div>
                        );
                      }

                      if (key === "state") {
                        return (
                          <div key={key}>
                            <FloatingLabelSelect label={label} name={key} value={String((form as any)[key] || "")} onChange={onChange} onBlur={() => markInvalid(key)} required={requiredFields.has(key)} className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}>
                              <option value="">UF</option>
                              {[
                                "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
                              ].map((uf) => (
                                <option key={uf} value={uf}>{uf}</option>
                              ))}
                            </FloatingLabelSelect>
                          </div>
                        );
                      }

                      // Default text input
                      return (
                        <div key={key}>
                          <FloatingLabelInput
                            label={label}
                            name={key}
                            value={String((form as any)[key] || "")}
                            onChange={onChange}
                            onBlur={() => markInvalid(key)}
                            required={requiredFields.has(key)}
                            className={invalidFields[key] ? "border-red-500 bg-red-50" : ""}
                            maxLength={key === "cns" ? 8 : undefined}
                          />
                          {fieldErrors[key] && <span className="text-xs text-red-600">{fieldErrors[key]}</span>}
                          {invalidFields[key] && <span className="text-xs text-red-600">Campo obrigatório</span>}
                        </div>
                      );

                    })
                )}
                {sec.title === "Representante" ? (
                  <div className="sm:col-span-2 grid gap-2">
                    <div className="flex gap-2">
                      <select value="" onChange={(e) => { const val = e.target.value; if (!val) return; setSelectedReps([val]); e.currentTarget.selectedIndex = 0; }} className="rounded border px-3 py-2 flex-1">
                        <option value="">+ Adicionar representante</option>
                        {repsList.filter((r) => !selectedReps.includes(r.id)).map((r) => (
                          <option key={r.id} value={r.id}>{(r as any).full_name}</option>
                        ))}
                      </select>
                      {selectedReps.length ? (
                        <button type="button" className="rounded bg-brand-blue-600 px-3 py-2 text-white" onClick={openRepDetails} title="Detalhes">Detalhes</button>
                      ) : (
                        <button type="button" className="rounded bg-gray-400 px-3 py-2 text-white" disabled>Detalhes</button>
                      )}
                      <button type="button" className="rounded bg-brand-green-600 px-3 py-2 text-white" onClick={() => setShowRepCreateModal(true)}>Novo Representante</button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <label className="grid gap-1">
                        <span className="text-sm text-gray-700">{labelMap["representatives_text"]}</span>
                        <input name="representatives_text" value={String((form as any)["representatives_text"] || "")} readOnly className="rounded border px-3 py-2 bg-gray-50" />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-sm text-gray-700">{labelMap["position"]}</span>
                        <select name="position" value={String((form as any)["position"] || "Representante")} onChange={onChange} className="rounded border px-3 py-2">
                          <option value="Oficial(a)">Oficial(a)</option>
                          <option value="Respondente (Interino)">Respondente (Interino)</option>
                          <option value="Representante">Representante</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            </fieldset>
          </div>
        ))}
        {showRepModal && (
          <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
            <div className="bg-white rounded-lg p-4 w-[90%] max-w-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold text-brand-blue-800">Representantes</h2>
                <button type="button" className="text-gray-600" onClick={() => setShowRepModal(false)}>Fechar</button>
              </div>
              <div className="mt-3 max-h-[60vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Nome</th>
                      <th className="p-2">E-mail</th>
                      <th className="p-2">Telefone</th>
                      <th className="p-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repsList.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-2">{(r as any).full_name}</td>
                        <td className="p-2">{r.email || ""}</td>
                        <td className="p-2">{r.phone || ""}</td>

                        <td className="p-2">
                          <button type="button" className="rounded bg-brand-green-600 px-2 py-1 text-white text-xs" onClick={() => { if (!selectedReps.includes(r.id)) setSelectedReps((prev) => [...prev, r.id]); }}>+ Adicionar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {showRepInfoModal && (
          <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
            <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold text-brand-blue-800">Detalhes do Representante</h2>
                <button type="button" className="text-gray-600" onClick={() => setShowRepInfoModal(false)}>Fechar</button>
              </div>
              <div className="mt-3 grid gap-2">
                <label className="grid gap-1"><span className="text-sm text-gray-700">Nome Completo</span><input readOnly value={String(repInfo?.full_name || "")} className="rounded border px-3 py-2 bg-gray-50" /></label>
                <label className="grid gap-1"><span className="text-sm text-gray-700">RG</span><input readOnly value={String(repInfo?.rg || "")} className="rounded border px-3 py-2 bg-gray-50" /></label>
                <label className="grid gap-1"><span className="text-sm text-gray-700">CPF</span><input readOnly value={String(repInfo?.cpf || "")} className="rounded border px-3 py-2 bg-gray-50" /></label>
                <label className="grid gap-1"><span className="text-sm text-gray-700">Celular</span><input readOnly value={String(repInfo?.phone || "")} className="rounded border px-3 py-2 bg-gray-50" /></label>
                <label className="grid gap-1"><span className="text-sm text-gray-700">E-mail</span><input readOnly value={String(repInfo?.email || "")} className="rounded border px-3 py-2 bg-gray-50" /></label>
                <label className="grid gap-1"><span className="text-sm text-gray-700">Data de Aniversário</span><input readOnly value={isoToDayMonth(repInfo?.birth_date)} className="rounded border px-3 py-2 bg-gray-50" /></label>
              </div>
            </div>
          </div>
        )}
        {showRepCreateModal && (
          <RepresentativeCreateModal
            onClose={() => setShowRepCreateModal(false)}
            onCreated={(rep) => { setRepsList((list) => [...list, rep]); setSelectedReps([rep.id]); setShowRepCreateModal(false); }}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">{loading ? "Salvando..." : "Salvar"}</button>
      </form>
      {showContractPrompt && createdId ? (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-brand-blue-800">Cadastrar contrato</h2>
              <button type="button" className="text-gray-600" onClick={() => { setShowContractPrompt(false); router.replace("/clients"); }}>{"×"}</button>
            </div>
            <p className="mt-3 text-sm text-gray-700">Cliente salvo sem contrato. Deseja cadastrar agora?</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button type="button" className="rounded bg-gray-500 px-3 py-2 text-white" onClick={() => { setShowContractPrompt(false); router.replace("/clients"); }}>Cancelar</button>
              <button type="button" className="rounded bg-brand-green-600 px-3 py-2 text-white" onClick={() => { setShowContractPrompt(false); router.replace(`/contracts/new?clientId=${createdId}`); }}>Cadastrar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function ServiceIcon({ s }: { s: any }) {
  const slug = String(s?.slug || "").toLowerCase();
  const name = String(s?.name || "").toLowerCase();
  const isCloud = slug.includes("cloud") || name.includes("cloud");
  const isFire = slug.includes("fire") || name.includes("fire");
  const isServer = slug.includes("prov") || name.includes("servidor") || name.includes("monitor");
  if (isCloud)
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18h11a4 4 0 0 0 0-8h-.2A6 6 0 0 0 6 7a5 5 0 0 0 0 11z" /></svg>
    );
  if (isFire)
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.5 2.5 4 5 4 7.5A5.5 5.5 0 0 1 6.5 15c0 3.038 2.462 5 5.5 5s5.5-1.962 5.5-5c0-2.5-1.5-4.5-3.5-6.5.5 2-1 3-2.5 3-1.5 0-2.5-1.5-2-3.5.5-2 2.5-3.5 2.5-3.5z" /></svg>
    );
  if (isServer)
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v10H4z" /><path d="M8 19h8v2H8z" /></svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v10H4z" /><path d="M8 19h8v2H8z" /></svg>
  );
}
