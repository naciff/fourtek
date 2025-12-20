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
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelTextarea";

// import Prov74Section from "@/components/client/Prov74Section"; 
// import RelatoriosSection from "@/components/client/RelatoriosSection";

const PROV74_COLUMNS = [
  ['checkmk', 'ip_fixo'],
  ['energia_estavel', 'link_internet', 'endereco_eletronico', 'cpd'],
  ['impressora', 'licencas_originais', 'switchH', 'firewall'],
  ['nobreak', 'storage', 'backup_nuvem', 'servidor_replicacao']
];

const PROV74_OPTIONS = PROV74_COLUMNS.flat();

function formatProv74Label(opt: string) {
  const map: Record<string, string> = {
    checkmk: 'CheckMK Instalado',
    ip_fixo: 'IP Fixo',
    energia_estavel: 'Energia Estável',
    link_internet: 'Link Internet (mínimo 10 Mb)',
    endereco_eletronico: 'Endereço Eletrônico',
    cpd: 'CPD (Isolado/Refrigeração)',
    impressora: 'Impressoras e Scanners',
    licencas_originais: 'Licenças Originais',
    switchH: 'Switch',
    firewall: 'Firewall',
    nobreak: 'Nobreak (30 minutos autonomia)',
    storage: 'Storage (físico ou virtual)',
    backup_nuvem: 'Backup em Nuvem',
    servidor_replicacao: 'Servidor Replicação'
  };
  return map[opt] || opt.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
}
const DADOS_ADICIONAIS_TYPES = [
  'Roteador', 'Rede Wi-Fi', 'Nobreak', 'Modem', 'Switch', 'Outros'
];

const DEFAULT_FORM_STATE = {
  corporate_name: "", trade_name: "", cnpj: "", state_registration: "", street: "", number: "", neighborhood: "", complement: "", city: "", state: "", zip: "", phone: "", email: "", website: "", situation: "Ativo", company_type: "Empresa", cloud_size: "", cloud_date: "", client_contract: "", alias: "", contract_done: false, signed: false, implemented: false, contract_value: "", contract_value_details: "", installation_date: "", cancellation_date: "", contact_name: "", contact_phone: "", position: "", services: "", logo_url: "", contract_image_url: "", cloud_image_url: "", representatives_text: "", notes: "", consulta_cnpj: "", cns: ""
};

export default function EditClientPage({ clientId }: { clientId?: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams();
  const idRaw = clientId || (params?.id as string);
  const isNew = idRaw === 'new';
  const id = isNew ? '' : idRaw;

  const btnBase = "inline-flex items-center justify-center rounded-md h-10 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const btnPrimary = `${btnBase} bg-brand-blue-600 text-white hover:bg-brand-blue-700 shadow-sm`;
  const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200`;
  const btnDestructive = `${btnBase} bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700`;
  const btnGhost = `${btnBase} hover:bg-gray-100 hover:text-gray-900`;
  const btnBlue = `${btnBase} bg-brand-blue-600 text-white hover:bg-brand-blue-700`;

  const [tab, setTab] = useState<'dados' | 'inventario' | 'acesso' | 'servidores' | 'prov74' | 'relatorios' | 'pcn' | 'dadosadicionais' | 'sistemas'>('dados');
  const [form, setForm] = useState<any>(isNew ? DEFAULT_FORM_STATE : null);
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
  const [showInvForm, setShowInvForm] = useState(false);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);

  const [acessos, setAcessos] = useState<any[]>([]);
  const [acessoForm, setAcessoForm] = useState({ tipo_acesso: 'Tactical', url_tactical: '', url_link_externo: '', usuario_link_externo: '', senha_link_externo: '', id_anydesk: '', senha_anydesk: '', usuario_vpn: '', senha_vpn: '', observacoes: '' });
  const [acessoLoading, setAcessoLoading] = useState(false);
  const [acessoError, setAcessoError] = useState<string | null>(null);
  const [showAcessoForm, setShowAcessoForm] = useState(false);
  const [editingAcessoId, setEditingAcessoId] = useState<string | null>(null);

  const [servers, setServers] = useState<any[]>([]);
  const [serverForm, setServerForm] = useState({ hostname: '', ip_address: '', os: '', description: '', username: '', password: '', external_link: '', equipment_model: '', disk_qty: '', disk_size: '', server_brand: '', storage_brand: '' });
  const [serverLoading, setServerLoading] = useState(false);
  const [showServerForm, setShowServerForm] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [viewingDescription, setViewingDescription] = useState<string | null>(null);

  const [showVMModal, setShowVMModal] = useState(false);
  const [selectedServerForVM, setSelectedServerForVM] = useState<string | null>(null);
  const [vmForm, setVmForm] = useState({ vm_name: '', ip: '', os: '', username: '', password: '', description: '', system_id: '', domain: '', anydesk_id: '', anydesk_password: '' });
  const [vmLoading, setVmLoading] = useState(false);
  const [vms, setVms] = useState<any[]>([]);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  const [editingVmId, setEditingVmId] = useState<string | null>(null);

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



  function DescriptionModal({ content, onClose }: { content: string; onClose: () => void }) {
    if (!content) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Descrição Completa</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><span className="sr-only">Fechar</span>✕</button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 border p-3 rounded bg-gray-50">
            {content}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className={btnPrimary}>Fechar</button>
          </div>
        </div>
      </div>
    );
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
      setLoading(true);

      let data: any = isNew ? { ...DEFAULT_FORM_STATE } : null;

      if (!isNew) {
        const res = await supabase.from("clients").select("*").eq("id", id).single();
        if (res.error) {
          setError('Cliente não encontrado');
          setLoading(false);
          return;
        }
        data = res.data;
      }

      // Check for next contract number if new or creating
      if (isNew) {
        const top = await supabase.from('clients').select('client_contract').order('client_contract', { ascending: false }).limit(1);
        const max = Number((top.data?.[0] as any)?.client_contract || 0);
        data.client_contract = String((Number.isFinite(max) ? max : 0) + 1);
      }

      setForm(data);

      const s = await supabase.from("services").select("id,name,slug").order("name");
      setServicesList(s.data ?? []);

      // If existing client, load related data
      if (!isNew) {
        const cservices = await supabase.from("client_services").select("service_id").eq("client_id", id);
        setSelectedServices((cservices.data ?? []).map((x: any) => x.service_id));

        const creps = await supabase.from("client_contacts").select("id, name, phone").eq("client_id", id);
        setContacts(creps.data ?? []);

        const cr = await supabase.from("client_representatives").select("representative_id").eq("client_id", id);
        setSelectedReps((cr.data ?? []).map((x: any) => x.representative_id));

        let sis = await supabase.from("sistemas").select("id,name,slug").order("name");
        setSistemasList(sis.data ?? []);

        const csis = await supabase.from("client_sistemas").select("sistema_id").eq("client_id", id);
        setSelectedSistemas((csis.data ?? []).map((x: any) => x.sistema_id));

        // Load sub-data
        loadProv74();
        loadRelatorios();
        loadPcn();
      }

      const reps = await supabase.from("representatives").select("id, full_name, email, phone").order("full_name");
      setRepsList(reps.data ?? []);

      setLoading(false);
    }
    load();
  }, [id, supabase, isNew]);

  useEffect(() => {
    const names = selectedReps
      .map((rid) => repsList.find((x) => x.id === rid)?.full_name)
      .filter(Boolean)
      .join(", ");
    setForm((f: any) => ({ ...f, representatives_text: names }));
  }, [selectedReps, repsList]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  /* Checklist Prov 74 State */
  const [showProv74Form, setShowProv74Form] = useState(false);
  const [editingProv74Id, setEditingProv74Id] = useState<string | null>(null);
  const [prov74History, setProv74History] = useState<any[]>([]);
  const [prov74Form, setProv74Form] = useState({
    situacao: 'Realizado',
    data_hora: '',
    classes: [] as string[],
    itens: [] as string[],
    imagem_url: '',
    observacao: ''
  });

  const prov74Items = [
    "checkmk_inicial", "energia_estavel", "cpd", "switchH", "nobreak", "antivirus", "storage",
    "checkmk", "link_internet", "impressora", "firewall", "backup_nuvem", "servidor_replicacao", "licencas_originais"
  ];

  async function loadProv74() {
    const { data } = await supabase.from('prov74_checklist').select('*').eq('client_id', id).order('created_at', { ascending: false });
    if (data) setProv74History(data);
  }

  /* Relatorios State */
  const [relatoriosForm, setRelatoriosForm] = useState({
    type: 'Relatório de Não Conformidade',
    report_date: '',
    version: '',
    file_url: ''
  });
  const [showRelatoriosForm, setShowRelatoriosForm] = useState(false);
  const [relatoriosHistory, setRelatoriosHistory] = useState<any[]>([]);
  const [relatoriosLoading, setRelatoriosLoading] = useState(false);

  async function loadRelatorios() {
    const { data } = await supabase.from('client_reports').select('*').eq('client_id', id).order('created_at', { ascending: false });
    if (data) setRelatoriosHistory(data);
  }

  async function onRelatoriosSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRelatoriosLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const payload = {
      client_id: id,
      user_id: userData.user.id,
      ...relatoriosForm,
      report_date: relatoriosForm.report_date || new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('client_reports').insert(payload);

    if (error) {
      alert('Erro ao salvar relatório: ' + error.message);
    } else {
      setRelatoriosForm({ type: 'Relatório de Não Conformidade', report_date: '', version: '', file_url: '' });
      setShowRelatoriosForm(false);
      await loadRelatorios();
    }
    setRelatoriosLoading(false);
  }

  /* Dados Adicionais State */
  const [dadosAdicionaisForm, setDadosAdicionaisForm] = useState({
    type: 'Roteador',
    quantity: 1,
    brand_model: '',
    has_external_battery: false,
    has_generator: false,
    observation: '',
    image_url: ''
  });
  const [showDadosAdicionaisForm, setShowDadosAdicionaisForm] = useState(false);
  const [dadosAdicionaisHistory, setDadosAdicionaisHistory] = useState<any[]>([]);
  const [dadosAdicionaisLoading, setDadosAdicionaisLoading] = useState(false);

  async function loadDadosAdicionais() {
    const { data } = await supabase.from('client_additional_data').select('*').eq('client_id', id).order('created_at', { ascending: false });
    if (data) setDadosAdicionaisHistory(data);
  }

  async function onDadosAdicionaisSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDadosAdicionaisLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Convert undefined/empty fields to appropriate types
    const payload = {
      client_id: id,
      user_id: userData.user.id,
      type: dadosAdicionaisForm.type,
      quantity: Number(dadosAdicionaisForm.quantity),
      brand_model: dadosAdicionaisForm.brand_model,
      has_external_battery: dadosAdicionaisForm.has_external_battery,
      has_generator: dadosAdicionaisForm.has_generator,
      observation: dadosAdicionaisForm.observation,
      image_url: dadosAdicionaisForm.image_url
    };

    const { error } = await supabase.from('client_additional_data').insert(payload);
    if (error) {
      alert('Erro ao salvar dados adicionais: ' + error.message);
    } else {
      setDadosAdicionaisForm({
        type: 'Roteador',
        quantity: 1,
        brand_model: '',
        has_external_battery: false,
        has_generator: false,
        observation: '',
        image_url: ''
      });
      setShowDadosAdicionaisForm(false);
      await loadDadosAdicionais();
    }
    setDadosAdicionaisLoading(false);
  }
  const [pcnForm, setPcnForm] = useState({
    pcn: false,
    politica_backup: false,
    politica_ti: false,
    encaminhado: false,
    link: ''
  });
  const [showPcnForm, setShowPcnForm] = useState(false);
  const [pcnHistory, setPcnHistory] = useState<any[]>([]);
  const [pcnLoading, setPcnLoading] = useState(false);

  async function loadPcn() {
    const { data } = await supabase.from('client_pcn').select('*').eq('client_id', id).order('created_at', { ascending: false });
    if (data) setPcnHistory(data);

    // Load Additional Data
    loadDadosAdicionais();
  }

  async function onPcnSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPcnLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const payload = {
      client_id: id,
      user_id: userData.user.id,
      ...pcnForm
    };

    const { error } = await supabase.from('client_pcn').insert(payload);
    if (error) {
      alert('Erro ao salvar PCN: ' + error.message);
    } else {
      setPcnForm({ pcn: false, politica_backup: false, politica_ti: false, encaminhado: false, link: '' });
      setShowPcnForm(false);
      await loadPcn();
    }
    setPcnLoading(false);
  }



  async function onProv74Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prov74Form.data_hora) { alert('Informe a Data e Hora'); return; }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const payload = {
      client_id: id,
      user_id: userData.user.id,
      situacao: prov74Form.situacao,
      data_hora: prov74Form.data_hora,
      classes: prov74Form.classes,
      itens: prov74Form.itens,
      imagem_url: prov74Form.imagem_url,
      observacao: prov74Form.observacao
    };

    let error;
    if (editingProv74Id) {
      const { error: err } = await supabase
        .from('prov74_checklist')
        .update(payload)
        .eq('id', editingProv74Id);
      error = err;
    } else {
      const { error: err, data: newLine } = await supabase
        .from('prov74_checklist')
        .insert(payload)
        .select()
        .single();
      if (newLine) {
        setProv74History(prev => [newLine, ...prev]);
      }
      error = err;
    }

    if (error) {
      alert('Erro ao salvar');
      console.error(error);
    } else {
      setShowProv74Form(false);
      setEditingProv74Id(null);
      setProv74Form({
        situacao: 'Realizado',
        data_hora: '',
        classes: [],
        itens: [],
        imagem_url: '',
        observacao: ''
      });
      if (editingProv74Id) loadProv74(); // Reload to reflect updates
      else alert('Checklist salvo com sucesso!');
    }
  }

  useEffect(() => {
    if (tab === 'inventario') { void loadInvHist(); }
    else if (tab === 'acesso') { void loadAcessos(); }
    else if (tab === 'servidores') { void loadServers(); void loadVMs(); }
    else if (tab === 'prov74') { void loadProv74(); }
  }, [tab, id]);

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

  async function openRepDetails() {
    if (!selectedReps.length) return;
    const rid = selectedReps[0];
    const res = await supabase.from("representatives").select("*").eq("id", rid).single();
    if (res.data) setRepInfo(res.data);
    setShowRepInfoModal(true);
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

    let newId = id;
    let resError;

    if (isNew) {
      const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
      if (data) newId = data.id;
      resError = error;
    } else {
      const { error } = await supabase.from("clients").update(payload).eq("id", id);
      resError = error;
    }

    if (resError) {
      setError((resError as any).message);
      setLoading(false);
      return;
    }

    // Relation Handling
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;

    // Contacts
    if (!isNew) {
      await supabase.from("client_contacts").delete().eq("client_id", id);
    }
    const toInsert = contacts.filter((c) => String(c.name).trim()).map((c) => ({ client_id: newId, user_id, name: c.name.trim(), phone: c.phone.trim() }));
    if (toInsert.length) await supabase.from("client_contacts").insert(toInsert);

    // Services
    if (isNew) {
      if (selectedServices.length) await supabase.from("client_services").insert(selectedServices.map((sid) => ({ client_id: newId, service_id: sid, user_id })));
    } else {
      const svcBefore = await supabase.from("client_services").select("service_id").eq("client_id", id);
      const existingSvc = (svcBefore.data ?? []).map((x: any) => x.service_id);
      const addSvc = selectedServices.filter((sid) => !existingSvc.includes(sid));
      const removeSvc = existingSvc.filter((sid) => !selectedServices.includes(sid));
      if (addSvc.length) await supabase.from("client_services").insert(addSvc.map((sid) => ({ client_id: id, service_id: sid, user_id })));
      if (removeSvc.length) await supabase.from("client_services").delete().in("service_id", removeSvc).eq("client_id", id);
    }

    // Reps
    if (isNew) {
      if (selectedReps.length) await supabase.from("client_representatives").insert(selectedReps.map((rid) => ({ client_id: newId, representative_id: rid, user_id })));
    } else {
      await supabase.from("client_representatives").delete().eq("client_id", id);
      if (selectedReps.length) {
        await supabase.from("client_representatives").insert(selectedReps.map((rid) => ({ client_id: id, representative_id: rid, user_id })));
      }
    }

    // Sistemas (assuming previously implemented in shared logic, but if not present in original block, I should check if I need to add it. Original block didn't show 'sistemas' logic visibly, but I saw it in other viewed sections. I'll omit it if it wasn't in the replaced block to avoid duplication, BUT I should double check if I'm missing it.)
    // Wait, the original block ended at 661. 'Sistemas' logic was NOT in the replaced block (it might be handled elsewhere or I missed it).
    // Looking at previous `view_file` (1100-1400), I saw `client_sistemas` logic in the *render* (upsert on change).
    // So 'Sistemas' might not be saved in `onSubmit`.
    // I will stick to what was there: Contacts, Services, Reps.

    setLoading(false);

    if (isNew) {
      alert('Cliente criado com sucesso!');
      router.push(`/clients/${newId}`);
    } else {
      alert('Dados salvos com sucesso!');
      router.refresh();
    }
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

    let error;
    if (editingInvId) {
      const res = await supabase.from('inventario_historico').update(payload).eq('id', editingInvId);
      error = res.error;
    } else {
      const res = await supabase.from('inventario_historico').insert(payload);
      error = res.error;
    }

    if (error) {
      console.error("Error saving inventory:", error);
      alert("Erro ao salvar item: " + error.message);
      setInvHistLoading(false);
      return;
    }

    setInvHistForm({ item: 'Servidor', qtd: '1', descricao: '' });
    setEditingInvId(null);
    setShowInvForm(false);
    await loadInvHist();
    setInvHistLoading(false);
  }

  async function onInvHistDelete(idRow: string) {
    if (!confirm("Excluir item?")) return;
    await supabase.from('inventario_historico').delete().eq('id', idRow);
    await loadInvHist();
  }

  function onInvEdit(item: any) {
    setInvHistForm({ item: item.item, qtd: String(item.qtd), descricao: item.descricao || '' });
    setEditingInvId(item.id);
    setShowInvForm(true);
  }

  function onInvCancel() {
    setInvHistForm({ item: 'Servidor', qtd: '1', descricao: '' });
    setEditingInvId(null);
    setShowInvForm(false);
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

    if (editingAcessoId) {
      await supabase.from('dados_acesso').update(payload).eq('id', editingAcessoId);
    } else {
      await supabase.from('dados_acesso').insert(payload);
    }

    setAcessoForm({ tipo_acesso: 'Acesso Remoto', url_tactical: '', url_link_externo: '', usuario_link_externo: '', senha_link_externo: '', id_anydesk: '', senha_anydesk: '', usuario_vpn: '', senha_vpn: '', observacoes: '' });
    await loadAcessos();
    setAcessoLoading(false);
    setShowAcessoForm(false);
    setEditingAcessoId(null);
  }

  function onAcessoEdit(item: any) {
    setAcessoForm({
      tipo_acesso: item.tipo_acesso || 'Tactical',
      url_tactical: item.url_tactical || '',
      url_link_externo: item.url_link_externo || '',
      usuario_link_externo: item.usuario_link_externo || '',
      senha_link_externo: item.senha_link_externo || '',
      id_anydesk: item.id_anydesk || '',
      senha_anydesk: item.senha_anydesk || '',
      usuario_vpn: item.usuario_vpn || '',
      senha_vpn: item.senha_vpn || '',
      observacoes: item.observacoes || ''
    });
    setEditingAcessoId(item.id);
    setShowAcessoForm(true);
  }

  function onAcessoCancel() {
    setAcessoForm({ tipo_acesso: 'Tactical', url_tactical: '', url_link_externo: '', usuario_link_externo: '', senha_link_externo: '', id_anydesk: '', senha_anydesk: '', usuario_vpn: '', senha_vpn: '', observacoes: '' });
    setShowAcessoForm(false);
    setEditingAcessoId(null);
  }
  async function onAcessoDelete(idRow: string) {
    if (!confirm("Excluir acesso?")) return;
    await supabase.from('dados_acesso').delete().eq('id', idRow);
    await loadAcessos();
  }

  async function loadServers() {
    const res = await supabase.from('servers').select('*').eq('client_id', id).order('created_at', { ascending: false });
    setServers(res.data || []);
  }
  function onServerChange(e: React.ChangeEvent<any>) {
    const { name, value } = e.target;
    setServerForm((prev) => ({ ...prev, [name]: value }));
  }
  async function onServerSubmit(e: FormEvent) {
    e.preventDefault();
    setServerLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (!serverForm.hostname || !serverForm.ip_address) {
      alert("Preencha o Hostname e o IP Address.");
      setServerLoading(false);
      return;
    }

    const payload = {
      client_id: id,
      hostname: serverForm.hostname,
      ip_address: serverForm.ip_address,
      os: serverForm.os,
      description: serverForm.description,
      username: serverForm.username,
      password: serverForm.password,
      external_link: serverForm.external_link,
      equipment_model: serverForm.equipment_model,
      disk_qty: serverForm.disk_qty,
      disk_size: serverForm.disk_size,
      server_brand: serverForm.server_brand,
      storage_brand: serverForm.storage_brand
    };

    let error = null;
    if (editingServerId) {
      const { error: err } = await supabase.from('servers').update(payload).eq('id', editingServerId);
      error = err;
    } else {
      const { error: err } = await supabase.from('servers').insert(payload);
      error = err;
    }

    if (error) {
      alert("Erro ao salvar servidor: " + error.message);
    } else {
      setServerForm({ hostname: '', ip_address: '', os: '', description: '', username: '', password: '', external_link: '', equipment_model: '', disk_qty: '', disk_size: '', server_brand: '', storage_brand: '' });
      setShowServerForm(false);
      setEditingServerId(null);
      await loadServers();
    }
    setServerLoading(false);
  }
  function onServerEdit(item: any) {
    setServerForm({
      hostname: item.hostname || '',
      ip_address: item.ip_address || '',
      os: item.os || '',
      description: item.description || '',
      username: item.username || '',
      password: item.password || '',
      external_link: item.external_link || '',
      equipment_model: item.equipment_model || '',
      disk_qty: item.disk_qty || '',
      disk_size: item.disk_size || '',
      server_brand: item.server_brand || '',
      storage_brand: item.storage_brand || ''
    });
    setEditingServerId(item.id);
    setShowServerForm(true);
  }
  function onServerCancel() {
    setServerForm({ hostname: '', ip_address: '', os: '', description: '', username: '', password: '', external_link: '', equipment_model: '', disk_qty: '', disk_size: '', server_brand: '', storage_brand: '' });
    setShowServerForm(false);
    setEditingServerId(null);
  }
  async function onServerDelete(sid: string) {
    if (!confirm("Excluir servidor?")) return;
    await supabase.from('servers').delete().eq('id', sid);
    await loadServers();
  }

  function onVMOpen(serverId: string) {
    setEditingVmId(null); // Reset editing state
    setSelectedServerForVM(serverId);
    setVmForm({ vm_name: '', ip: '', os: '', username: '', password: '', description: '', system_id: '', domain: '', anydesk_id: '', anydesk_password: '' });
    setShowVMModal(true);
  }

  function onVMEdit(vm: any) {
    setEditingVmId(vm.id);
    setSelectedServerForVM(vm.server_id);
    setVmForm({
      vm_name: vm.vm_name || '',
      ip: vm.ip || '',
      os: vm.os || '',
      username: vm.username || '',
      password: vm.password || '',
      description: vm.description || '',
      system_id: vm.system_id || '',
      domain: vm.domain || '',
      anydesk_id: vm.anydesk_id || '',
      anydesk_password: vm.anydesk_password || ''
    });
    setShowVMModal(true);
  }

  async function onVMSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedServerForVM) return;
    setVmLoading(true);

    // NOTE: assuming server_vms table exists as per migration
    const payload: any = {
      server_id: selectedServerForVM,
      vm_name: vmForm.vm_name,
      ip: vmForm.ip,
      os: vmForm.os,
      username: vmForm.username,
      password: vmForm.password,
      description: vmForm.description,
      system_id: vmForm.system_id || null, // Handle conditional (null if not applicable) but sticking to form value is safer if managed by UI
      domain: vmForm.domain,
      anydesk_id: vmForm.anydesk_id,
      anydesk_password: vmForm.anydesk_password
    };

    // Clean up payload based on vm_name logic to avoid saving garbage if user switched names
    if (!vmForm.vm_name.includes('Corcel')) payload.system_id = null;
    if (!vmForm.vm_name.includes('Escort')) payload.domain = null;
    if (!vmForm.vm_name.includes('Corsa')) { payload.anydesk_id = null; payload.anydesk_password = null; }

    let error;
    if (editingVmId) {
      const { error: err } = await supabase.from('server_vms').update(payload).eq('id', editingVmId);
      error = err;
    } else {
      const { error: err } = await supabase.from('server_vms').insert(payload);
      error = err;
    }

    setVmLoading(false);

    if (error) {
      alert("Erro ao salvar VM: " + error.message);
    } else {
      alert(editingVmId ? "VM atualizada com sucesso!" : "VM adicionada com sucesso!");
      setShowVMModal(false);
      setEditingVmId(null);
      setVmForm({ vm_name: '', ip: '', os: '', username: '', password: '', description: '', system_id: '', domain: '', anydesk_id: '', anydesk_password: '' });
      await loadVMs();
    }
  }

  async function loadVMs() {
    const res = await supabase.from('server_vms').select('*').in('server_id', servers.map(s => s.id)).order('created_at', { ascending: false });
    // Note: if servers is empty initially, this might return empty. 
    // Better to select based on client indirectly or just fetch all for client's servers if possible.
    // Or just fetching all server_vms for now since we filter in UI. Ideally filters by server_ids of this client.

    // Safer approach: Get all servers for this client first then VMs? 
    // Actually, 'servers' state might not be populated yet when this runs in parallel.
    // Let's do a join query or simple verify. 
    // For now, let's just fetch all VMs that belong to any server of this client.
    // Since we can't easily do a nested filter without join syntax which is tricky without types.
    // Let's use the known server list if available, or fetch fresh.

    // Alternative:
    const { data: srvs } = await supabase.from('servers').select('id').eq('client_id', id);
    if (!srvs?.length) { setVms([]); return; }
    const sids = srvs.map(x => x.id);
    const resVM = await supabase.from('server_vms').select('*').in('server_id', sids);
    setVms(resVM.data || []);
  }

  function toggleServerExpand(sid: string) {
    const newSet = new Set(expandedServers);
    if (newSet.has(sid)) newSet.delete(sid);
    else newSet.add(sid);
    setExpandedServers(newSet);
  }

  function VMModal() {
    if (!showVMModal) return null;
    const vmOptions = [
      "Belina", "BYD (Proxy)", "Camaro", "Celta", "Chevette (Fileserver)", "Corcel (Sistema)",
      "Corolla", "Corsa (Veeam)", "Corvette (Firewall)", "Escort (AD/Guaca)", "Fusca (Suporte)",
      "Gol (ONR)", "Legado", "Lexus", "Kombi (Sistema)", "Opala", "Puma", "Uno (CheckMK)",
      "VDI", "Vectra (BI/SGA)"
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Adicionar VM</h3>
            <button onClick={() => setShowVMModal(false)} className="rounded-full p-1 hover:bg-gray-100"><span className="sr-only">Fechar</span>✕</button>
          </div>

          <form onSubmit={onVMSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault(); }} className="space-y-4">
            <FloatingLabelSelect label="Nome da VM" value={vmForm.vm_name} onChange={(e) => setVmForm({ ...vmForm, vm_name: e.target.value })} required>
              <option value="">Selecione...</option>
              {vmOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </FloatingLabelSelect>

            {vmForm.vm_name.includes('Corcel') && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <FloatingLabelSelect label="Sistema" value={vmForm.system_id || ''} onChange={(e) => setVmForm({ ...vmForm, system_id: e.target.value })}>
                  <option value="">Selecione o Sistema...</option>
                  {sistemasList.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>)}
                </FloatingLabelSelect>
              </div>
            )}

            {vmForm.vm_name.includes('Escort') && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <FloatingLabelInput label="Domínio" value={vmForm.domain || ''} onChange={(e) => setVmForm({ ...vmForm, domain: e.target.value })} />
              </div>
            )}

            {vmForm.vm_name.includes('Corsa') && (
              <div className="animate-in fade-in slide-in-from-top-1 grid grid-cols-2 gap-2">
                <FloatingLabelInput label="AnyDesk ID" value={vmForm.anydesk_id || ''} onChange={(e) => setVmForm({ ...vmForm, anydesk_id: e.target.value })} />
                <FloatingLabelInput label="Senha AnyDesk" value={vmForm.anydesk_password || ''} onChange={(e) => setVmForm({ ...vmForm, anydesk_password: e.target.value })} />
              </div>
            )}

            <FloatingLabelInput label="IP" value={vmForm.ip} onChange={(e) => setVmForm({ ...vmForm, ip: e.target.value })} required />

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Sistema Operacional</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="os" value="Windows" checked={vmForm.os === 'Windows'} onChange={(e) => setVmForm({ ...vmForm, os: e.target.value })} />
                  <span className="text-sm">Windows</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="os" value="Linux" checked={vmForm.os === 'Linux'} onChange={(e) => setVmForm({ ...vmForm, os: e.target.value })} />
                  <span className="text-sm">Linux</span>
                </label>
              </div>
            </div>

            <FloatingLabelInput label="Usuário" value={vmForm.username} onChange={(e) => setVmForm({ ...vmForm, username: e.target.value })} required />
            <FloatingLabelInput label="Senha" value={vmForm.password} onChange={(e) => setVmForm({ ...vmForm, password: e.target.value })} required />

            <FloatingLabelTextarea label="Descrição" value={vmForm.description} onChange={(e) => setVmForm({ ...vmForm, description: e.target.value })} />

            <div className="flex justify-end gap-2 mt-4">
              <button type="submit" disabled={vmLoading} className={btnPrimary}>{vmLoading ? 'Salvando...' : 'Salvar VM'}</button>
              <button type="button" onClick={() => setShowVMModal(false)} className={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
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
    {
      title: "Contrato", fields: [
        "contract_done", "signed", "implemented", // checkboxes
        "contract_value", "installation_date", "cancellation_date",
        "contract_image_url"
      ]
    }
  ];
  // Cloud is now part of Services, so we don't push it separately


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

  const navTabClass = (t: string) => `flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? 'bg-brand-green-600 text-white border-brand-green-600 shadow-sm' : 'bg-green-50 text-brand-green-700 border-green-200 hover:bg-green-100'}`;
  const subTabClass = (t: string) => `px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === t ? 'border-brand-blue-600 text-brand-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;

  const tabIcons: Record<string, React.ReactNode> = {
    dados: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9h8v9" /></svg>,
    acesso: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    inventario: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    servidores: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
    prov74: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    relatorios: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
    pcn: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    dadosadicionais: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    sistemas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
  };

  return (
    <div className="w-full p-2 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Novo Cliente' : 'Editar Cliente'}</h1>
        <div className="flex gap-2">
          <button type="submit" form="client-form" disabled={loading} className={`${btnPrimary} w-32`}>{loading ? "Salvando..." : (isNew ? "Criar" : "Salvar")}</button>
          <button type="button" onClick={() => router.replace("/clients")} className={btnSecondary}>Cancelar</button>
          {!isNew && <button onClick={onDelete} type="button" className={btnDestructive}>Excluir Cliente</button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        <button onClick={() => setTab('dados')} className={navTabClass('dados')}>
          {tabIcons['dados']}
          <span className="hidden sm:inline">Dados do Cliente</span>
        </button>
        {isNew ? (
          <span className="px-4 py-2 text-sm text-gray-400 italic flex items-center">Salve o cliente para habilitar outras abas</span>
        ) : (
          (['acesso', 'inventario', 'servidores', 'sistemas', 'prov74', 'pcn', 'relatorios', 'dadosadicionais'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={navTabClass(t)}>
              {tabIcons[t]}
              {t === 'inventario' ? 'Inventário' : t === 'acesso' ? 'Dados de Acesso' : t === 'servidores' ? 'Servidores' : t === 'sistemas' ? 'Sistemas' : t === 'prov74' ? 'CheckList Prov. 74' : t === 'relatorios' ? 'Relatórios' : t === 'pcn' ? 'PCN' : 'Dados Adicionais'}
            </button>
          ))
        )}
      </div>

      <form id="client-form" onSubmit={onSubmit} className={`space-y-6 animate-in fade-in duration-300 ${tab === 'dados' ? '' : 'hidden'}`}>
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

                    {/* Cloud Fields (Conditionally rendered if hasCloud is true) */}
                    {hasCloud && (
                      <div className="pt-4 border-t border-gray-100 mt-4 space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Configuração Cloud</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FloatingLabelInput label="Tamanho Cloud *" name="cloud_size" value={form.cloud_size || ""} onChange={onChange} />
                          <FloatingLabelInput label="Data Cloud *" type="date" name="cloud_date" value={form.cloud_date || ""} onChange={onChange} />
                          <div className="sm:col-span-2">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Imagem Cloud</span>
                            <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const { data: userData } = await supabase.auth.getUser();
                              const path = `${userData.user?.id || 'anon'}/cloud/${Date.now()}-${file.name}`;
                              await supabase.storage.from('files').upload(path, file);
                              const { data } = supabase.storage.from('files').getPublicUrl(path);
                              setForm({ ...form, cloud_image_url: data.publicUrl });
                            }} />
                            {form.cloud_image_url && (
                              <div className="mt-2">
                                <SafeImg src={form.cloud_image_url} alt="Cloud" className="h-24 w-auto object-contain border rounded" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : sec.title === "Contatos" ? (
                  <div className="sm:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {contacts.map((c, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {c.name} ({c.phone})
                          <button type="button" onClick={async () => {
                            if ((c as any).id) {
                              await supabase.from('client_contacts').delete().eq('id', (c as any).id);
                            }
                            setContacts(prev => prev.filter((_, idx) => idx !== i));
                          }} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FloatingLabelInput label="Nome Contato" name="contact_name" value={form.contact_name || ""} onChange={onChange} />
                      </div>
                      <div className="flex-1">
                        <FloatingLabelInput label="Telefone" name="contact_phone" value={form.contact_phone || ""} onChange={onChange} />
                      </div>
                      <button type="button" onClick={async () => {
                        const name = form.contact_name?.trim();
                        const phone = form.contact_phone?.trim();
                        if (!name) return;

                        const { data: userData } = await supabase.auth.getUser();
                        if (userData.user) {
                          const { data } = await supabase.from('client_contacts').insert({ client_id: id, user_id: userData.user.id, name, phone }).select().single();
                          if (data) {
                            setContacts(prev => [...prev, { name: data.name, phone: data.phone, id: data.id } as any]);
                            setForm((f: any) => ({ ...f, contact_name: '', contact_phone: '' }));
                          }
                        }
                      }} className={btnPrimary}>+ Adicionar</button>
                    </div>
                  </div>
                ) : sec.title === "Endereço" ? (
                  <div className="sm:col-span-2 grid gap-4">
                    {/* Row 1: CEP + Buttons */}
                    <div className="flex gap-2">
                      <div className="w-48">
                        <FloatingLabelInput label="CEP" name="zip" value={form.zip || ""} onChange={onChange} />
                      </div>
                      <button type="button" onClick={async () => {
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

                    {/* Row 2: Rua / Numero */}
                    <div className="grid sm:grid-cols-[1fr_200px] gap-4">
                      <FloatingLabelInput label="Rua" name="street" value={form.street || ""} onChange={onChange} />
                      <FloatingLabelInput label="Número" name="number" value={form.number || "S/N"} onChange={onChange} />
                    </div>

                    {/* Row 3: Complemento / Bairro */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingLabelInput label="Complemento" name="complement" value={form.complement || ""} onChange={onChange} />
                      <FloatingLabelInput label="Bairro" name="neighborhood" value={form.neighborhood || ""} onChange={onChange} />
                    </div>

                    {/* Row 4: Cidade / UF */}
                    <div className="grid sm:grid-cols-[1fr_100px] gap-4">
                      <FloatingLabelInput label="Cidade" name="city" value={form.city || ""} onChange={onChange} />
                      <FloatingLabelInput label="UF" name="state" value={form.state || ""} onChange={onChange} />
                    </div>

                    {/* Row 5: Latitude / Longitude */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingLabelInput label="latitude" name="latitude" value={form.latitude || ""} onChange={onChange} />
                      <FloatingLabelInput label="longitude" name="longitude" value={form.longitude || ""} onChange={onChange} />
                    </div>
                  </div>
                ) : sec.title === "Representante" ? (
                  <div className="sm:col-span-2 space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FloatingLabelSelect label="Selecionar Representante" value="" onChange={(e) => { const val = e.target.value; if (!val) return; setSelectedReps([val]); e.currentTarget.selectedIndex = 0; }}>
                          <option value="">+ Adicionar representante</option>
                          {repsList.filter((r) => !selectedReps.includes(r.id)).map((r) => (
                            <option key={r.id} value={r.id}>{(r as any).full_name}</option>
                          ))}
                        </FloatingLabelSelect>
                      </div>
                      {selectedReps.length ? (
                        <button type="button" className={btnBlue} onClick={openRepDetails} title="Detalhes">Detalhes</button>
                      ) : (
                        <button type="button" className={`${btnBase} bg-gray-400 text-white cursor-not-allowed`} disabled>Detalhes</button>
                      )}
                      <button type="button" className={btnPrimary} onClick={() => setShowRepCreateModal(true)}>Novo Representante</button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <FloatingLabelInput label={labelMap["representatives_text"]} name="representatives_text" value={String(form.representatives_text || "")} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" onChange={() => { }} />
                      </div>
                      <div>
                        <FloatingLabelSelect label="Cargo" name="position" value={form.position || "Representante"} onChange={onChange}>
                          <option value="Oficial(a)">Oficial(a)</option>
                          <option value="Respondente (Interino)">Respondente (Interino)</option>
                          <option value="Representante">Representante</option>
                        </FloatingLabelSelect>
                      </div>
                    </div>
                  </div>
                ) : (
                  sec.fields.map(key => {
                    // Filter logic
                    if (key === "cancellation_date" && form.situation !== "Cancelado") return null;
                    if (sec.title === "Contrato" && (key === "implemented" || key === "signed")) return null; // handled via checkbox group
                    if (sec.title === "Contrato" && (key === "implemented" || key === "signed")) return null; // handled via checkbox group
                    if (sec.title === "Contatos" && (key === "contact_name" || key === "contact_phone")) return null; // handled via custom section
                    if (sec.title === "Representante" && (key === "representatives_text" || key === "position")) return null; // handled via custom section
                    // Filter out address fields as they are handled in custom section
                    if (sec.title === "Endereço" && ["zip", "street", "number", "complement", "neighborhood", "city", "state", "latitude", "longitude"].includes(key)) return null;

                    const labelText = labelMap[key] || key;
                    const isReq = requiredFields.has(key) || (hasCloud && (key === "cloud_size" || key === "cloud_date"));
                    const label = isReq ? `${labelText} *` : labelText;
                    const colSpan = (key === 'street' || key === 'corporate_name' || key.includes('url')) ? "sm:col-span-2" : "";

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
                              {String(form[key]).toLowerCase().endsWith('.pdf') ? (
                                <a href={form[key]} target="_blank" rel="noopener noreferrer" className="block text-sm text-brand-blue-600 hover:underline">Abrir PDF</a>
                              ) : <SafeImg src={form[key]} alt={labelText} className="h-24 w-auto object-contain border rounded" />}
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


      </form>

      {
        tab === 'inventario' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Histórico de Inventário</h3>
              {!showInvForm && (
                <button onClick={() => setShowInvForm(true)} className={btnPrimary}>Adicionar Item</button>
              )}
            </div>

            {showInvForm && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="text-base font-medium text-gray-900 mb-4">{editingInvId ? "Editar Item" : "Novo Item"}</h3>
                <form onSubmit={onInvHistSubmit} className="grid sm:grid-cols-4 gap-4 items-end">
                  <FloatingLabelSelect label="Item" value={invHistForm.item} onChange={e => setInvHistForm({ ...invHistForm, item: e.target.value })}>
                    <option value="Servidor">Servidor</option>
                    <option value="Estação de Trabalho">Estação de Trabalho</option>
                    <option value="Impressora">Impressora</option>
                    <option value="Nobreak">Nobreak</option>
                    <option value="Storage">Storage</option>
                    <option value="Outro">Outro</option>
                  </FloatingLabelSelect>
                  <FloatingLabelInput label="Quantidade" type="number" value={invHistForm.qtd} onChange={e => setInvHistForm({ ...invHistForm, qtd: e.target.value })} />
                  <div className="sm:col-span-2 flex gap-2">
                    <div className="flex-1">
                      <FloatingLabelInput label="Descrição" value={invHistForm.descricao} onChange={e => setInvHistForm({ ...invHistForm, descricao: e.target.value })} />
                    </div>
                    <button type="submit" disabled={invHistLoading} className={btnPrimary}>{invHistLoading ? "Salvando..." : "Salvar"}</button>
                    <button type="button" onClick={onInvCancel} className={btnSecondary}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

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
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                          <button onClick={() => onInvEdit(item)} className="text-blue-600 hover:text-blue-900">Editar</button>
                          <button onClick={() => onInvHistDelete(item.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {
        tab === 'acesso' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Dados de Acesso</h3>
              {!showAcessoForm && (
                <button onClick={() => setShowAcessoForm(true)} className={btnPrimary}>Adicionar Acesso</button>
              )}
            </div>

            {showAcessoForm && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="text-base font-medium text-gray-900 mb-4">{editingAcessoId ? "Editar Dado de Acesso" : "Novo Dado de Acesso"}</h3>
                <form onSubmit={onAcessoSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <FloatingLabelSelect label="Tipo de Acesso" name="tipo_acesso" value={acessoForm.tipo_acesso} onChange={onAcessoChange}>
                        <option value="Tactical">Tactical</option>
                        <option value="AnyDesk">AnyDesk</option>
                        <option value="Link Externo (Ip Publico)">Link Externo (Ip Publico)</option>
                        <option value="VPN">VPN</option>
                        <option value="TeamViewer">TeamViewer</option>
                        <option value="Outro">Outro</option>
                      </FloatingLabelSelect>
                    </div>

                    {acessoForm.tipo_acesso === 'Tactical' && (
                      <div className="sm:col-span-2">
                        <FloatingLabelInput label="URL Tactical" name="url_tactical" value={acessoForm.url_tactical} onChange={onAcessoChange} />
                      </div>
                    )}

                    {acessoForm.tipo_acesso === 'AnyDesk' && (
                      <>
                        <FloatingLabelInput label="AnyDesk ID" name="id_anydesk" value={acessoForm.id_anydesk} onChange={onAcessoChange} />
                        <FloatingLabelInput label="Senha AnyDesk" name="senha_anydesk" value={acessoForm.senha_anydesk} onChange={onAcessoChange} />
                      </>
                    )}

                    {acessoForm.tipo_acesso === 'VPN' && (
                      <>
                        <FloatingLabelInput label="Usuário VPN" name="usuario_vpn" value={acessoForm.usuario_vpn} onChange={onAcessoChange} />
                        <FloatingLabelInput label="Senha VPN" name="senha_vpn" value={acessoForm.senha_vpn} onChange={onAcessoChange} />
                      </>
                    )}

                    {acessoForm.tipo_acesso === 'Link Externo (Ip Publico)' && (
                      <>
                        <div className="sm:col-span-2">
                          <FloatingLabelInput label="URL Link Externo" name="url_link_externo" value={acessoForm.url_link_externo} onChange={onAcessoChange} />
                        </div>
                        <FloatingLabelInput label="Usuário" name="usuario_link_externo" value={acessoForm.usuario_link_externo} onChange={onAcessoChange} />
                        <FloatingLabelInput label="Senha" name="senha_link_externo" value={acessoForm.senha_link_externo} onChange={onAcessoChange} />
                      </>
                    )}

                    {acessoForm.tipo_acesso === 'TeamViewer' && (
                      <div className="sm:col-span-2">
                        <FloatingLabelInput label="ID TeamViewer" name="id_anydesk" value={acessoForm.id_anydesk} onChange={onAcessoChange} />
                      </div>
                    )}

                    {acessoForm.tipo_acesso === 'Outro' && (
                      <div className="sm:col-span-2">
                        <FloatingLabelInput label="Observações" name="observacoes" value={acessoForm.observacoes} onChange={onAcessoChange} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button type="submit" disabled={acessoLoading} className={btnPrimary}>{acessoLoading ? "Salvando..." : "Salvar"}</button>
                    <button type="button" onClick={onAcessoCancel} className={btnSecondary}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acesso / Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credenciais</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acessos.length === 0 ? <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum acesso registrado.</td></tr> :
                    acessos.map(acesso => (
                      <tr key={acesso.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{acesso.tipo_acesso}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {acesso.url_link_externo && <a href={acesso.url_link_externo} target="_blank" className="text-blue-600 hover:underline block truncate max-w-[200px]">{acesso.url_link_externo}</a>}
                          {acesso.url_tactical && (
                            <div className="text-xs text-gray-400 mt-1">
                              <a href={acesso.url_tactical} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{acesso.url_tactical}</a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {(acesso.usuario_link_externo || acesso.senha_link_externo) && (
                            <div className="text-xs">
                              {acesso.usuario_link_externo} / {acesso.senha_link_externo}
                            </div>
                          )}
                          {acesso.id_anydesk && (
                            <div className="text-xs mt-1">
                              {acesso.id_anydesk} {acesso.senha_anydesk ? `/ ${acesso.senha_anydesk}` : ''}
                            </div>
                          )}
                          {acesso.usuario_vpn && (
                            <div className="text-xs mt-1">
                              {acesso.usuario_vpn} {acesso.senha_vpn ? `/ ${acesso.senha_vpn}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate" title={acesso.observacoes}>{acesso.observacoes}</td>
                        <td className="px-6 py-4 text-right text-sm space-x-2 whitespace-nowrap">
                          <button onClick={() => onAcessoEdit(acesso)} className="text-blue-600 hover:text-blue-900">Editar</button>
                          <button onClick={() => onAcessoDelete(acesso.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {
        tab === 'servidores' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Lista de Servidores</h3>
              {!showServerForm && (
                <button onClick={() => setShowServerForm(true)} className={btnPrimary}>Adicionar Servidor</button>
              )}
            </div>

            {showServerForm && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="text-base font-medium text-gray-900 mb-4">{editingServerId ? "Editar Servidor" : "Novo Servidor"}</h3>
                <form onSubmit={onServerSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <FloatingLabelSelect label="Hostname / Nome" name="hostname" value={serverForm.hostname} onChange={onServerChange}>
                        <option value="">Selecione...</option>
                        <option value="Corvette (Firewall)">Corvette (Firewall)</option>
                        <option value="BMW">BMW</option>
                        <option value="Ferrari">Ferrari</option>
                        <option value="Porsche">Porsche</option>
                        <option value="Idrac/lIo - Ferrari">Idrac/lIo - Ferrari</option>
                        <option value="Idrac/lIo - Porsche">Idrac/lIo - Porsche</option>
                        <option value="Storage">Storage</option>
                      </FloatingLabelSelect>
                    </div>

                    {/* Common Fields for Corvette, BMW, Ferrari, Porsche, plus Idrac/Storage variants */}
                    {(['Corvette (Firewall)', 'BMW', 'Ferrari', 'Porsche', 'Idrac/lIo - Ferrari', 'Idrac/lIo - Porsche', 'Storage'].includes(serverForm.hostname)) && (
                      <FloatingLabelInput label="IP Address" name="ip_address" value={serverForm.ip_address} onChange={onServerChange} />
                    )}

                    {(['Corvette (Firewall)', 'BMW', 'Ferrari', 'Porsche'].includes(serverForm.hostname)) && (
                      <FloatingLabelSelect label="Sistema Operacional" name="os" value={serverForm.os} onChange={onServerChange}>
                        <option value="">Selecione...</option>
                        <option value="VmWare">VmWare</option>
                        <option value="Proxmox">Proxmox</option>
                        <option value="PfSense">PfSense</option>
                        <option value="Linux">Linux</option>
                      </FloatingLabelSelect>
                    )}

                    {(['Corvette (Firewall)', 'BMW', 'Ferrari', 'Porsche', 'Idrac/lIo - Ferrari', 'Idrac/lIo - Porsche', 'Storage'].includes(serverForm.hostname)) && (
                      <>
                        <FloatingLabelInput label="Usuário" name="username" value={serverForm.username} onChange={onServerChange} />
                        <FloatingLabelInput label="Senha" name="password" value={serverForm.password} onChange={onServerChange} />
                      </>
                    )}

                    {serverForm.hostname === 'Corvette (Firewall)' && (
                      <div className="sm:col-span-2">
                        <FloatingLabelInput label="Link Externo (Acesso)" name="external_link" value={serverForm.external_link} onChange={onServerChange} />
                      </div>
                    )}

                    {['BMW', 'Ferrari', 'Porsche'].includes(serverForm.hostname) && (
                      <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                        <FloatingLabelSelect label="Marca Servidor" name="server_brand" value={serverForm.server_brand} onChange={onServerChange}>
                          <option value="">Selecione...</option>
                          <option value="Dell">Dell</option>
                          <option value="HP">HP</option>
                          <option value="LeNovo">LeNovo</option>
                        </FloatingLabelSelect>
                        <FloatingLabelInput label="Modelo Equipamento" name="equipment_model" value={serverForm.equipment_model} onChange={onServerChange} />
                      </div>
                    )}

                    {serverForm.hostname === 'Storage' && (
                      <div className="sm:col-span-2 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FloatingLabelSelect label="Marca Storage" name="storage_brand" value={serverForm.storage_brand || ''} onChange={onServerChange}>
                            <option value="">Selecione...</option>
                            <option value="Asustor">Asustor</option>
                            <option value="WD">WD</option>
                            <option value="Qnap">Qnap</option>
                          </FloatingLabelSelect>
                          <FloatingLabelInput label="Modelo Equipamento" name="equipment_model" value={serverForm.equipment_model} onChange={onServerChange} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FloatingLabelInput label="Quantidade de Disco" name="disk_qty" value={serverForm.disk_qty} onChange={onServerChange} />
                          <FloatingLabelInput label="Tamanho dos Discos" name="disk_size" value={serverForm.disk_size} onChange={onServerChange} />
                        </div>
                      </div>
                    )}

                    {['Corvette (Firewall)', 'BMW', 'Ferrari', 'Porsche'].includes(serverForm.hostname) && (
                      <div className="sm:col-span-2">
                        <FloatingLabelTextarea label="Descrição / Função" name="description" value={serverForm.description} onChange={onServerChange} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button type="submit" disabled={serverLoading} className={btnPrimary}>{serverLoading ? "Salvando..." : "Salvar"}</button>
                    <button type="button" onClick={onServerCancel} className={btnSecondary}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-8">
              {[
                { title: 'Firewall', color: 'text-red-600', filter: (s: any) => s.hostname === 'Corvette (Firewall)' },
                {
                  title: 'Servidores',
                  color: 'text-brand-blue-600',
                  filter: (s: any) => ['BMW', 'Ferrari', 'Porsche'].includes(s.hostname),
                  sort: (a: any, b: any) => {
                    const order = ['BMW', 'Ferrari', 'Porsche'];
                    return order.indexOf(a.hostname) - order.indexOf(b.hostname);
                  }
                },
                { title: 'Storage', color: 'text-gray-700', filter: (s: any) => s.hostname === 'Storage' },
                { title: 'Outros', color: 'text-gray-700', filter: (s: any) => !['BMW', 'Ferrari', 'Porsche', 'Storage', 'Corvette (Firewall)'].includes(s.hostname) }
              ].map((group) => {
                let groupServers = servers.filter(group.filter);
                if ((group as any).sort) {
                  groupServers = groupServers.sort((group as any).sort);
                }
                if (groupServers.length === 0) return null;

                return (
                  <div key={group.title} className="rounded-lg border bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                      <h4 className={`text-sm font-bold uppercase tracking-wide ${group.color}`}>{group.title}</h4>
                      <span className="bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">{groupServers.length}</span>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white text-gray-500">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase w-[40px]"></th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase w-[15%]">Hostname</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase w-[15%]">Marca</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase w-[20%]">Modelo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase w-[15%]">IP</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase w-[10%]">OS</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase">Acesso</th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase w-[150px]">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupServers.map(s => {
                          const isHypervisor = ['BMW', 'Ferrari', 'Porsche'].includes(s.hostname);
                          return (
                            <React.Fragment key={s.id}>
                              <tr className={`hover:bg-gray-50 transition-colors ${expandedServers.has(s.id) ? "bg-blue-50/30" : ""}`}>
                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                  {isHypervisor && (
                                    <button onClick={() => toggleServerExpand(s.id)} className="text-gray-400 hover:text-brand-blue-600 transition-colors p-1 rounded-full hover:bg-black/5">
                                      {expandedServers.has(s.id) ?
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        :
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 -rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                      }
                                    </button>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{s.hostname}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{s.server_brand || s.storage_brand || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  <button
                                    onClick={() => s.description ? setViewingDescription(s.description) : null}
                                    className={`text-left hover:text-brand-blue-600 hover:underline ${!s.description ? 'cursor-default no-underline opacity-70' : 'cursor-pointer'}`}
                                    title={s.description ? "Clique para ver a descrição completa" : "Sem descrição"}
                                  >
                                    {(s.equipment_model || '').replace(/^Modelo:\s*/i, '') || (s.hostname === 'Storage' ? `${s.disk_qty || ''} Unid. / ${s.disk_size || ''}` : '-')}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{s.ip_address}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{s.os}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  <div className="flex flex-col">
                                    <span>{s.username}</span>
                                    <span className="text-gray-400 text-xs truncate max-w-[100px]">{s.password}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm space-x-2 whitespace-nowrap">
                                  {isHypervisor && (
                                    <button onClick={() => onVMOpen(s.id)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-2 text-xs uppercase tracking-wider border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50">+ VM</button>
                                  )}
                                  <button onClick={() => onServerEdit(s)} className="text-blue-600 hover:text-blue-900 font-medium">Editar</button>
                                  <button onClick={() => onServerDelete(s.id)} className="text-red-600 hover:text-red-900 font-medium">Excluir</button>
                                </td>
                              </tr>
                              {expandedServers.has(s.id) && (
                                <tr className="bg-gray-50/50 shadow-inner">
                                  <td colSpan={7} className="px-0 py-0 border-t border-gray-100">
                                    <div className="p-4 pl-16 pr-8 bg-slate-50 border-l-4 border-brand-blue-500">
                                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>
                                        Máquinas Virtuais
                                        <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                                          {vms.filter(v => v.server_id === s.id).length}
                                        </span>
                                      </h4>
                                      {vms.filter(v => v.server_id === s.id).length === 0 ? (
                                        <p className="text-sm text-gray-400 italic py-2">Nenhuma VM cadastrada para este servidor.</p>
                                      ) : (
                                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                          <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                              <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credenciais</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                              {vms.filter(v => v.server_id === s.id).map(vm => (
                                                <tr key={vm.id} className="hover:bg-gray-50">
                                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                    {vm.vm_name}
                                                    {vm.system_id && sistemasList.find((x: any) => x.id === vm.system_id) && (
                                                      <div className="text-xs text-gray-500 font-normal mt-0.5">
                                                        Sistema: {sistemasList.find((x: any) => x.id === vm.system_id)?.name}
                                                      </div>
                                                    )}
                                                    {vm.domain && <div className="text-xs text-gray-500 font-normal mt-0.5">Domínio: {vm.domain}</div>}
                                                    {vm.anydesk_id && (
                                                      <div className="text-xs text-gray-500 font-normal mt-0.5">
                                                        AnyDesk: {vm.anydesk_id} {vm.anydesk_password && <span className="text-gray-400">/ {vm.anydesk_password}</span>}
                                                      </div>
                                                    )}
                                                  </td>
                                                  <td className="px-4 py-2 text-sm text-gray-500 font-mono text-xs">{vm.ip}</td>
                                                  <td className="px-4 py-2 text-sm text-gray-500">{vm.os}</td>
                                                  <td className="px-4 py-2 text-sm text-gray-500 text-xs">{vm.username} / {vm.password}</td>
                                                  <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate text-xs" title={vm.description}>{vm.description}</td>
                                                  <td className="px-4 py-2 text-right text-sm space-x-2">
                                                    <button onClick={() => onVMEdit(vm)} className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50">Editar</button>
                                                    <button onClick={async () => {
                                                      if (!confirm('Excluir VM?')) return;
                                                      await supabase.from('server_vms').delete().eq('id', vm.id);
                                                      await loadVMs();
                                                    }} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50">Excluir</button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              {servers.length === 0 && (
                <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
                  Nenhum servidor cadastrado.
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Placeholders for other tabs */}
      {tab === 'prov74' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header / Actions */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Verificações</h3>
            {!showProv74Form && prov74History.length === 0 && (
              <button
                onClick={() => {
                  setEditingProv74Id(null);
                  setProv74Form({
                    situacao: 'Realizado',
                    data_hora: '',
                    classes: [],
                    itens: [],
                    imagem_url: '',
                    observacao: ''
                  });
                  setShowProv74Form(true);
                }}
                className="bg-brand-blue-600 text-white px-4 py-2 rounded shadow hover:bg-brand-blue-700 font-medium text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nova Verificação
              </button>
            )}
          </div>

          {/* Form */}
          {showProv74Form && (
            <div className="rounded-lg border bg-white p-6 shadow-sm border-l-4 border-l-brand-blue-500 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="font-semibold text-gray-800">Nova Verificação</h4>
                <button onClick={() => setShowProv74Form(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={onProv74Submit}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h4 className="font-semibold text-gray-800 text-lg">{editingProv74Id ? 'Editar Verificação' : 'Nova Verificação'}</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowProv74Form(false); setEditingProv74Id(null); }} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-brand-green-600 text-white px-4 py-1.5 rounded shadow hover:bg-brand-green-700 font-medium text-sm flex items-center gap-2 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      Salvar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t">
                  <FloatingLabelSelect label="Situação" value={prov74Form.situacao} onChange={(e) => setProv74Form({ ...prov74Form, situacao: e.target.value })}>
                    <option value="Realizado">Realizado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Não Realizado">Não Realizado</option>
                  </FloatingLabelSelect>
                  <FloatingLabelInput label="Data e Hora" type="datetime-local" value={prov74Form.data_hora} onChange={(e) => setProv74Form({ ...prov74Form, data_hora: e.target.value })} />
                </div>

                <div className="mb-4">
                  <FloatingLabelTextarea label="Observação" value={prov74Form.observacao} onChange={(e) => setProv74Form({ ...prov74Form, observacao: e.target.value })} />
                </div>

                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Classe</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'Classe 1', label: 'Classe 1 (até R$ 100 mil por semestre)' },
                      { val: 'Classe 2', label: 'Classe 2 (entre R$ 100 mil e R$ 500 mil por semestre)' },
                      { val: 'Classe 3', label: 'Classe 3 (acima de R$ 500 mil por semestre)' }
                    ].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(prov74Form.classes || []).includes(opt.val)} onChange={(e) => {
                          // Single selection logic: if checked, set only this class; if unchecked, clear classes
                          const newClasses = e.target.checked ? [opt.val] : [];
                          setProv74Form({ ...prov74Form, classes: newClasses });
                        }} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Itens Verificados</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded border">
                    {PROV74_COLUMNS.map((col, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        {col.map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={(prov74Form.itens || []).includes(opt)} onChange={(e) => {
                              const newItens = e.target.checked
                                ? [...(prov74Form.itens || []), opt]
                                : (prov74Form.itens || []).filter((i: string) => i !== opt);
                              setProv74Form({ ...prov74Form, itens: newItens });
                            }} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                            <span className="text-sm text-gray-700 leading-tight">{formatProv74Label(opt)}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Imagem / Comprovante</span>
                  <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const { data: userData } = await supabase.auth.getUser();
                    const path = `${userData.user?.id || 'anon'}/prov74/${Date.now()}-${file.name}`;
                    const { error } = await supabase.storage.from('files').upload(path, file);
                    if (!error) {
                      const { data } = supabase.storage.from('files').getPublicUrl(path);
                      setProv74Form({ ...prov74Form, imagem_url: data.publicUrl });
                    }
                  }} />
                  {prov74Form.imagem_url && (
                    <div className="mt-2">
                      <a href={prov74Form.imagem_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Ver Imagem Anexada
                      </a>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Situação</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">DataHora</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Itens Verificados</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Observação</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prov74History.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-sm text-gray-500">Nenhum item</td></tr>
                ) : (
                  prov74History.map(h => (
                    <tr key={h.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{h.situacao}</div>
                        {h.classes && h.classes.length > 0 && (
                          <div className="mt-1 flex gap-2">
                            {h.classes.map((cls: string) => (
                              <span key={cls} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                {cls}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(h.data_hora).toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">

                        <div className="flex gap-4">
                          {PROV74_COLUMNS.map((col, i) => (
                            <div key={i} className="flex flex-col gap-1 min-w-[120px]">
                              {col.map(opt => {
                                const isChecked = (h.itens || []).includes(opt);
                                return (
                                  <div key={opt} className="flex items-center gap-1.5">
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChecked ? 'bg-brand-green-100 border-brand-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                      {isChecked && <svg className="w-3 h-3 text-brand-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`text-[11px] leading-tight ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{formatProv74Label(opt)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                        {h.observacao ? h.observacao : <span className="text-gray-300 italic">Sem observação</span>}
                        {h.imagem_url && (
                          <a href={h.imagem_url} target="_blank" rel="noreferrer" className="block text-blue-600 text-xs mt-1 hover:underline">Ver Imagem</a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingProv74Id(h.id);
                            setProv74Form({
                              situacao: h.situacao,
                              data_hora: h.data_hora.slice(0, 16), // Format for datetime-local
                              classes: h.classes || [],
                              itens: h.itens || [],
                              imagem_url: h.imagem_url,
                              observacao: h.observacao || ''
                            });
                            setShowProv74Form(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors text-xs font-bold"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div >
      )
      }
      {tab === 'relatorios' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Relatórios</h3>
            {!showRelatoriosForm && (
              <button
                onClick={() => {
                  setRelatoriosForm(prev => ({ ...prev, report_date: new Date().toISOString().split('T')[0] }));
                  setShowRelatoriosForm(true);
                }}
                className="bg-brand-blue-600 text-white px-4 py-2 rounded shadow hover:bg-brand-blue-700 font-medium text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Novo Relatório
              </button>
            )}
          </div>

          {showRelatoriosForm && (
            <div className="rounded-lg border bg-white p-6 shadow-sm border-l-4 border-l-brand-blue-500 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="font-semibold text-gray-800">Novo Relatório</h4>
                <button onClick={() => setShowRelatoriosForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={onRelatoriosSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FloatingLabelSelect label="Tipo" value={relatoriosForm.type} onChange={(e) => setRelatoriosForm({ ...relatoriosForm, type: e.target.value })}>
                    <option value="Relatório de Não Conformidade">Relatório de Não Conformidade</option>
                    <option value="Relatório Mensal">Relatório Mensal</option>
                    <option value="Relatório Técnico">Relatório Técnico</option>
                    <option value="Relatório de Lista de Equipamento">Relatório de Lista de Equipamento</option>
                  </FloatingLabelSelect>
                  <FloatingLabelInput label="Data" type="date" value={relatoriosForm.report_date} onChange={(e) => setRelatoriosForm({ ...relatoriosForm, report_date: e.target.value })} />
                  <FloatingLabelInput label="Versão" value={relatoriosForm.version} onChange={(e) => setRelatoriosForm({ ...relatoriosForm, version: e.target.value })} />

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Arquivo</span>
                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-green-50 file:text-brand-green-700 hover:file:bg-brand-green-100"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const { data: userData } = await supabase.auth.getUser();
                        const path = `${userData.user?.id || 'anon'}/reports/${Date.now()}-${file.name}`;
                        const { error, data } = await supabase.storage.from('files').upload(path, file);
                        if (!error && data) {
                          const { data: pub } = supabase.storage.from('files').getPublicUrl(path);
                          setRelatoriosForm({ ...relatoriosForm, file_url: pub.publicUrl });
                        }
                      }}
                    />
                    {relatoriosForm.file_url && <span className="text-xs text-green-600">Arquivo anexado!</span>}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowRelatoriosForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50">Cancelar</button>
                  <button type="submit" disabled={relatoriosLoading} className="bg-brand-green-600 text-white px-4 py-1.5 rounded shadow hover:bg-brand-green-700 font-medium text-sm">
                    {relatoriosLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Versão</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Arquivo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatoriosHistory.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-500">Nenhum relatório</td></tr>
                ) : (
                  relatoriosHistory.map(h => (
                    <tr key={h.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{h.report_date ? new Date(h.report_date).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{h.version}</td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        {h.file_url ? (
                          <a href={h.file_url} target="_blank" rel="noreferrer" className="hover:underline">Baixar/Ver</a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'pcn' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Histórico de PCN</h3>
            {!showPcnForm && (
              <button
                onClick={() => setShowPcnForm(true)}
                className="bg-brand-blue-600 text-white px-4 py-2 rounded shadow hover:bg-brand-blue-700 font-medium text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Novo PCN
              </button>
            )}
          </div>

          {showPcnForm && (
            <div className="rounded-lg border bg-white p-6 shadow-sm border-l-4 border-l-brand-blue-500 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="font-semibold text-gray-800">Novo PCN</h4>
                <button onClick={() => setShowPcnForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={onPcnSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pcnForm.pcn} onChange={(e) => setPcnForm({ ...pcnForm, pcn: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                      <span className="text-sm text-gray-700">pcn</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pcnForm.politica_ti} onChange={(e) => setPcnForm({ ...pcnForm, politica_ti: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                      <span className="text-sm text-gray-700">politica_ti</span>
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pcnForm.politica_backup} onChange={(e) => setPcnForm({ ...pcnForm, politica_backup: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                      <span className="text-sm text-gray-700">politica_backup</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pcnForm.encaminhado} onChange={(e) => setPcnForm({ ...pcnForm, encaminhado: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                      <span className="text-sm text-gray-700">encaminhado</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <FloatingLabelInput label="Link" value={pcnForm.link} onChange={(e) => setPcnForm({ ...pcnForm, link: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowPcnForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50">Cancelar</button>
                  <button type="submit" disabled={pcnLoading} className="bg-brand-green-600 text-white px-4 py-1.5 rounded shadow hover:bg-brand-green-700 font-medium text-sm">
                    {pcnLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">PCN</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">PoliticaBackup</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">PoliticaTI</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Encaminhado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pcnHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-sm text-gray-500">Nenhum registro</td></tr>
                ) : (
                  pcnHistory.map(h => (
                    <tr key={h.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.pcn ? 'Sim' : 'Não'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.politica_backup ? 'Sim' : 'Não'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.politica_ti ? 'Sim' : 'Não'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.encaminhado ? 'Sim' : 'Não'}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 max-w-[200px] truncate" title={h.link}>
                        {h.link ? (
                          <a href={h.link} target="_blank" rel="noreferrer" className="hover:underline">{h.link}</a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'dadosadicionais' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Observações / Dados Adicionais</h3>
            {!showDadosAdicionaisForm && (
              <button
                onClick={() => setShowDadosAdicionaisForm(true)}
                className="bg-brand-blue-600 text-white px-4 py-2 rounded shadow hover:bg-brand-blue-700 font-medium text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Editar Dados
              </button>
            )}
          </div>

          {showDadosAdicionaisForm && (
            <div className="rounded-lg border bg-white p-6 shadow-sm border-l-4 border-l-brand-blue-500 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="font-semibold text-gray-800">Novo Item Adicional</h4>
                <button onClick={() => setShowDadosAdicionaisForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={onDadosAdicionaisSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FloatingLabelSelect label="DadosAdicionais" value={dadosAdicionaisForm.type} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, type: e.target.value })}>
                    {DADOS_ADICIONAIS_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </FloatingLabelSelect>
                  <FloatingLabelInput label="Qtd" type="number" value={String(dadosAdicionaisForm.quantity)} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, quantity: Number(e.target.value) })} />

                  <div className="md:col-span-2">
                    <FloatingLabelInput label="Marca/Modelo" value={dadosAdicionaisForm.brand_model} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, brand_model: e.target.value })} placeholder="NHS 3000va, SMS 1.5va, ..." />
                  </div>

                  {dadosAdicionaisForm.type === 'Nobreak' && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={dadosAdicionaisForm.has_external_battery} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, has_external_battery: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                          <span className="text-sm text-gray-700">Possui Bateria Externa</span>
                        </label>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={dadosAdicionaisForm.has_generator} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, has_generator: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                          <span className="text-sm text-gray-700">Possui Gerador</span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <FloatingLabelInput label="Observacao" value={dadosAdicionaisForm.observation} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, observation: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <FloatingLabelInput label="Imagem" value={dadosAdicionaisForm.image_url} onChange={(e) => setDadosAdicionaisForm({ ...dadosAdicionaisForm, image_url: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowDadosAdicionaisForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50">Cancelar</button>
                  <button type="submit" disabled={dadosAdicionaisLoading} className="bg-brand-green-600 text-white px-4 py-1.5 rounded shadow hover:bg-brand-green-700 font-medium text-sm">
                    {dadosAdicionaisLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Qtd</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marca/Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dadosAdicionaisHistory.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-500">Nenhum registro</td></tr>
                ) : (
                  dadosAdicionaisHistory.map(h => (
                    <tr key={h.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{h.brand_model || '-'}</td>
                      <td className="px-6 py-4 text-sm text-red-600 cursor-pointer hover:underline" onClick={async () => {
                        if (!confirm('Excluir este item?')) return;
                        await supabase.from('client_additional_data').delete().eq('id', h.id);
                        loadDadosAdicionais();
                      }}>
                        Excluir
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DescriptionModal content={viewingDescription || ""} onClose={() => setViewingDescription(null)} />
      {VMModal()}

      {
        showRepCreateModal && (
          <RepresentativeCreateModal
            onClose={() => setShowRepCreateModal(false)}
            onCreated={(newRep) => {
              setRepsList((prev) => [...prev, newRep]);
              setSelectedReps((prev) => [...prev, newRep.id]);
              setShowRepCreateModal(false);
            }}
          />
        )
      }
    </div >
  );
}