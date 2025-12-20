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

export default function EditClientPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const btnBase = "inline-flex items-center justify-center rounded-md h-10 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const btnPrimary = `${btnBase} bg-brand-blue-600 text-white hover:bg-brand-blue-700 shadow-sm`;
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
  const [showInvForm, setShowInvForm] = useState(false);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);

  const [acessos, setAcessos] = useState<any[]>([]);
  const [acessoForm, setAcessoForm] = useState({ tipo_acesso: 'Tactical', url_tactical: '', url_link_externo: '', usuario_link_externo: '', senha_link_externo: '', id_anydesk: '', senha_anydesk: '', usuario_vpn: '', senha_vpn: '', observacoes: '' });
  const [acessoLoading, setAcessoLoading] = useState(false);
  const [acessoError, setAcessoError] = useState<string | null>(null);
  const [showAcessoForm, setShowAcessoForm] = useState(false);
  const [editingAcessoId, setEditingAcessoId] = useState<string | null>(null);

  const [servers, setServers] = useState<any[]>([]);
  const [serverForm, setServerForm] = useState({ hostname: '', ip_address: '', os: '', description: '', username: '', password: '', external_link: '', equipment_model: '', disk_qty: '', disk_size: '' });
  const [serverLoading, setServerLoading] = useState(false);
  const [showServerForm, setShowServerForm] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [viewingDescription, setViewingDescription] = useState<string | null>(null);

  const [showVMModal, setShowVMModal] = useState(false);
  const [selectedServerForVM, setSelectedServerForVM] = useState<string | null>(null);
  const [vmForm, setVmForm] = useState({ vm_name: '', ip: '', os: '', username: '', password: '', description: '' });
  const [vmLoading, setVmLoading] = useState(false);
  const [vms, setVms] = useState<any[]>([]);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab === 'inventario') { void loadInvHist(); }
    else if (tab === 'acesso') { void loadAcessos(); }
    else if (tab === 'servidores') { void loadServers(); void loadVMs(); }
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
      disk_size: serverForm.disk_size
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
      setServerForm({ hostname: '', ip_address: '', os: '', description: '', username: '', password: '' });
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
      disk_size: item.disk_size || ''
    });
    setEditingServerId(item.id);
    setShowServerForm(true);
  }
  function onServerCancel() {
    setServerForm({ hostname: '', ip_address: '', os: '', description: '', username: '', password: '', external_link: '', equipment_model: '', disk_qty: '', disk_size: '' });
    setShowServerForm(false);
    setEditingServerId(null);
  }
  async function onServerDelete(sid: string) {
    if (!confirm("Excluir servidor?")) return;
    await supabase.from('servers').delete().eq('id', sid);
    await loadServers();
  }

  function onVMOpen(serverId: string) {
    setSelectedServerForVM(serverId);
    setVmForm({ vm_name: '', ip: '', os: '', username: '', password: '', description: '' });
    setShowVMModal(true);
  }

  async function onVMSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedServerForVM) return;
    setVmLoading(true);

    // NOTE: assuming server_vms table exists as per migration
    const payload = {
      server_id: selectedServerForVM,
      vm_name: vmForm.vm_name,
      ip: vmForm.ip,
      os: vmForm.os,
      username: vmForm.username,
      password: vmForm.password,
      description: vmForm.description
    };

    const { error } = await supabase.from('server_vms').insert(payload);
    setVmLoading(false);

    if (error) {
      alert("Erro ao salvar VM: " + error.message);
    } else {
      alert("VM adicionada com sucesso!");
      setShowVMModal(false);
      setVmForm({ vm_name: '', ip: '', os: '', username: '', password: '', description: '' });
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
    dadosadicionais: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  };

  return (
    <div className="w-full p-2 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
        <div className="flex gap-2">
          <button type="submit" form="client-form" disabled={loading} className={`${btnPrimary} w-32`}>{loading ? "Salvando..." : "Salvar"}</button>
          <button type="button" onClick={() => router.replace("/clients")} className={btnSecondary}>Cancelar</button>
          <button onClick={onDelete} type="button" className={btnDestructive}>Excluir Cliente</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {(['dados', 'acesso', 'inventario', 'servidores', 'prov74', 'relatorios', 'pcn', 'dadosadicionais'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={navTabClass(t)}>
            {tabIcons[t]}
            {t === 'dados' ? 'Dados do Cliente' : t === 'inventario' ? 'Inventário' : t === 'acesso' ? 'Dados de Acesso' : t === 'servidores' ? 'Servidores' : t === 'prov74' ? 'Prov. 74' : t === 'relatorios' ? 'Relatórios' : t === 'pcn' ? 'PCN' : 'Dados Adicionais'}
          </button>
        ))}
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
                            setForm(f => ({ ...f, contact_name: '', contact_phone: '' }));
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
                      <div className="sm:col-span-2">
                        <FloatingLabelInput label="Modelo Equipamento" name="equipment_model" value={serverForm.equipment_model} onChange={onServerChange} />
                      </div>
                    )}

                    {serverForm.hostname === 'Storage' && (
                      <>
                        <FloatingLabelInput label="Quantidade de Disco" name="disk_qty" value={serverForm.disk_qty} onChange={onServerChange} />
                        <FloatingLabelInput label="Tamanho dos Discos" name="disk_size" value={serverForm.disk_size} onChange={onServerChange} />
                      </>
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

            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostname</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acesso</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servers.length === 0 ? <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum servidor cadastrado.</td></tr> :
                    servers.map(s => (
                      <React.Fragment key={s.id}>
                        <tr className={expandedServers.has(s.id) ? "bg-gray-50" : ""}>
                          <td className="px-6 py-4 text-sm text-gray-500 text-center">
                            <button onClick={() => toggleServerExpand(s.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                              {expandedServers.has(s.id) ?
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 -rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              }
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.hostname}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => s.description ? setViewingDescription(s.description) : null}
                              className={`text-left hover:text-brand-blue-600 hover:underline ${!s.description ? 'cursor-default no-underline opacity-70' : 'cursor-pointer'}`}
                              title={s.description ? "Clique para ver a descrição completa" : "Sem descrição"}
                            >
                              {(s.equipment_model || '').replace(/^Modelo:\s*/i, '') || (s.hostname === 'Storage' ? `${s.disk_qty || ''} Unid. / ${s.disk_size || ''}` : '-')}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{s.ip_address}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{s.os}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{s.username} / {s.password}</td>
                          <td className="px-6 py-4 text-right text-sm space-x-2 whitespace-nowrap">
                            <button onClick={() => onVMOpen(s.id)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-2">Adicionar VM</button>
                            <button onClick={() => onServerEdit(s)} className="text-blue-600 hover:text-blue-900">Editar</button>
                            <button onClick={() => onServerDelete(s.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                          </td>
                        </tr>
                        {expandedServers.has(s.id) && (
                          <tr>
                            <td colSpan={7} className="px-0 py-0 bg-gray-50 border-t border-gray-100">
                              <div className="p-4 pl-16 pr-8">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Máquinas Virtuais (VMs)</h4>
                                {vms.filter(v => v.server_id === s.id).length === 0 ? (
                                  <p className="text-sm text-gray-400 italic">Nenhuma VM cadastrada para este servidor.</p>
                                ) : (
                                  <table className="min-w-full divide-y divide-gray-200 border rounded-md overflow-hidden bg-white">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nome</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">IP</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">OS</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Usuário / Senha</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descrição</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {vms.filter(v => v.server_id === s.id).map(vm => (
                                        <tr key={vm.id}>
                                          <td className="px-4 py-2 text-sm text-gray-900">{vm.vm_name}</td>
                                          <td className="px-4 py-2 text-sm text-gray-500">{vm.ip}</td>
                                          <td className="px-4 py-2 text-sm text-gray-500">{vm.os}</td>
                                          <td className="px-4 py-2 text-sm text-gray-500">{vm.username} / {vm.password}</td>
                                          <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate" title={vm.description}>{vm.description}</td>
                                          <td className="px-4 py-2 text-right text-sm">
                                            <button onClick={async () => {
                                              if (!confirm('Excluir VM?')) return;
                                              await supabase.from('server_vms').delete().eq('id', vm.id);
                                              await loadVMs();
                                            }} className="text-red-600 hover:text-red-800 text-xs">Excluir</button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* Placeholders for other tabs */}
      {tab === 'prov74' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Módulo Provimento 74 em manutenção.</div>}
      {tab === 'relatorios' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Módulo de Relatórios em manutenção.</div>}
      {tab === 'pcn' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Módulo PCN em desenvolvimento.</div>}
      {tab === 'dadosadicionais' && <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">Dados Adicionais vazio.</div>}

      <DescriptionModal content={viewingDescription || ""} onClose={() => setViewingDescription(null)} />
      <VMModal />

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