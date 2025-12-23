"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";

// Reusing some icons
const Icons = {
    User: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    MapPin: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
    Phone: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    Mail: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    Calendar: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    CreditCard: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>,
    Server: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2" /><rect width="20" height="8" x="2" y="14" rx="2" ry="2" /><line x1="6" x2="6.01" y1="6" y2="6" /><line x1="6" x2="6.01" y1="18" y2="18" /></svg>,
    Edit: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>,
    Briefcase: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    Lock: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    Monitor: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>,
    Cpu: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
    FileText: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>,
    Shield: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    MoreHorizontal: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
}

function Card({ title, action, children, icon: Icon, className = "" }: { title: string, action?: React.ReactNode, children: React.ReactNode, icon?: any, className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col ${className}`}>
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h3>
                </div>
                {action}
            </div>
            <div className="p-5 flex-1">
                {children}
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon: Icon, className = "" }: { label: string, value: React.ReactNode, icon?: any, className?: string }) {
    if (!value || value === "-" || value === "") return null;

    return (
        <div className={`flex justify-between items-center py-1 ${className}`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200 text-right truncate max-w-[200px]">{value}</span>
        </div>
    );
}

const WIDGETS = [
    { id: 'profile', label: 'Perfil do Cliente' },
    { id: 'address', label: 'Endereço Principal' },
    { id: 'dates', label: 'Datas Importantes' },
    { id: 'contacts', label: 'Contatos Associados' },
    { id: 'services', label: 'Resumo Services' },
    { id: 'financial', label: 'Financeiro' },
    { id: 'access', label: 'Dados de Acesso' },
    { id: 'inventory', label: 'Inventário' },
    { id: 'servers', label: 'Servidores & VMs' },
    { id: 'systems', label: 'Sistemas' },
    { id: 'prov74', label: 'CheckList Prov. 74' },
    { id: 'pcn', label: 'PCN' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'additional', label: 'Dados Adicionais' },
];

export function ClientDashboard({ clientId }: { clientId: string }) {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Data States
    const [contacts, setContacts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [accessData, setAccessData] = useState<any[]>([]);
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [serversData, setServersData] = useState<any[]>([]);
    const [systemsData, setSystemsData] = useState<any[]>([]);
    const [prov74Data, setProv74Data] = useState<any>(null); // Latest
    const [pcnData, setPcnData] = useState<any>(null); // Latest
    const [reportsData, setReportsData] = useState<any[]>([]);
    const [additionalData, setAdditionalData] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data: c } = await supabase.from("clients").select("*").eq("id", clientId).single();
            if (c) {
                setClient(c);

                // Fetch all related data in parallel-ish
                const p1 = supabase.from("client_contacts").select("*").eq("client_id", clientId);
                const p2 = supabase.from("client_services").select("services(name)").eq("client_id", clientId);
                const p3 = supabase.from("dados_acesso").select("*").eq("client_id", clientId).order('created_at', { ascending: false });
                const p4 = supabase.from("inventario_historico").select("*").eq("client_id", clientId).order('created_at', { ascending: false });
                const p5 = supabase.from("servers").select("*, server_vms(*)").eq("client_id", clientId);
                const p6 = supabase.from("client_sistemas").select("sistemas(name)").eq("client_id", clientId);
                const p7 = supabase.from("prov74_checklist").select("*").eq("client_id", clientId).order('created_at', { ascending: false }).limit(1);
                const p8 = supabase.from("client_pcn").select("*").eq("client_id", clientId).order('created_at', { ascending: false }).limit(1);
                const p9 = supabase.from("client_reports").select("*").eq("client_id", clientId).order('report_date', { ascending: false }).limit(5);
                const p10 = supabase.from("client_additional_data").select("*").eq("client_id", clientId).order('created_at', { ascending: false });

                const [res1, res2, res3, res4, res5, res6, res7, res8, res9, res10] =
                    await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]);

                setContacts(res1.data || []);
                setServices(res2.data?.map((x: any) => x.services) || []);
                setAccessData(res3.data || []);
                setInventoryData(res4.data || []);
                setServersData(res5.data || []);
                setSystemsData(res6.data?.map((x: any) => x.sistemas) || []);
                setProv74Data(res7.data?.[0] || null);
                setPcnData(res8.data?.[0] || null);
                setReportsData(res9.data || []);
                setAdditionalData(res10.data || []);
            }
            setLoading(false);
        }
        load();
    }, [clientId]);

    const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
        // Initial state with everything visible by default, or loaded from local storage logic below
        return WIDGETS.reduce((acc, w) => ({ ...acc, [w.id]: true }), {});
    });
    const [showSettings, setShowSettings] = useState(false);


    useEffect(() => {
        const saved = localStorage.getItem('client_dashboard_widgets');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with default to ensure new widgets appear if not explicitly hidden in old config
                setVisibleWidgets(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse saved widgets preference", e);
            }
        }
    }, []);

    const toggleWidget = (id: string) => {
        const newState = { ...visibleWidgets, [id]: !visibleWidgets[id] };
        setVisibleWidgets(newState);
        localStorage.setItem('client_dashboard_widgets', JSON.stringify(newState));
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando dashboard...</div>;
    if (!client) return <div className="p-8 text-center text-red-500">Cliente não encontrado</div>;

    const initials = client.alias ? client.alias.substring(0, 2).toUpperCase() : client.corporate_name?.substring(0, 2).toUpperCase() || "CL";

    const EditButton = (
        <Link
            href={`/clients/${clientId}?mode=edit`}
            className="p-1.5 text-gray-400 hover:text-brand-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Editar / Ver Completo"
        >
            <Icons.Edit className="w-4 h-4" />
        </Link>
    );

    const hiddenCount = WIDGETS.filter(w => !visibleWidgets[w.id]).length;

    return (
        <div className="w-full space-y-6 p-2 md:p-6 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-blue-500/20">
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.alias || client.corporate_name}</h1>
                            <StatusBadge status={client.situation} />
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono">ID: #{String(client.client_contract).padStart(3, '0')}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>Desde {client.contract_date ? new Date(client.contract_date).getFullYear() : '2023'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border ${showSettings ? 'border-brand-blue-500 ring-1 ring-brand-blue-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 hover:text-brand-blue-600 transition-colors shadow-sm`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        Customizar
                    </button>

                    {showSettings && (
                        <div className="absolute top-12 right-0 w-64 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2 border-b border-gray-100 dark:border-gray-700">
                                Exibir Widgets
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                            </h3>
                            <div className="space-y-2">
                                {WIDGETS.map(widget => (
                                    <label key={widget.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${visibleWidgets[widget.id] ? 'bg-brand-blue-600 border-brand-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {visibleWidgets[widget.id] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={!!visibleWidgets[widget.id]}
                                            onChange={() => toggleWidget(widget.id)}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 select-none">{widget.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <Link
                        href={`/clients/${clientId}?mode=edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 hover:text-brand-blue-600 transition-colors shadow-sm"
                    >
                        <Icons.Edit className="w-4 h-4" />
                        Editar Dados
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {visibleWidgets.profile && (
                    <Card title="Perfil do Cliente" icon={Icons.User} action={EditButton} className="!h-fit">
                        <div className="flex flex-col items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg text-center">{client.corporate_name}</h3>
                            <p className="text-sm text-gray-500 text-center">{client.company_type}</p>
                        </div>
                        <div className="space-y-3">
                            <DetailRow label="CNPJ" value={client.cnpj} />
                            <DetailRow label="CNS" value={client.cns} />
                            <DetailRow label="Inscrição Estadual" value={client.state_registration} />
                            <DetailRow label="Email Pricipal" value={client.email} icon={Icons.Mail} />
                            <DetailRow label="Telefone" value={client.phone} icon={Icons.Phone} />
                            <DetailRow label="Website" value={client.website ? <a href={client.website} target="_blank" className="text-brand-blue-600 hover:underline">Visitar</a> : null} />
                        </div>
                    </Card>
                )}

                {/* Address Card & Dates (Grouped in col logic, but need individual checks) */}
                {(visibleWidgets.address || visibleWidgets.dates) && (
                    <div className="flex flex-col gap-6">
                        {visibleWidgets.address && (
                            <Card title="Endereço Principal" icon={Icons.MapPin} action={EditButton}>
                                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                    {client.street}, {client.number}
                                    {client.complement && ` - ${client.complement}`}<br />
                                    {client.neighborhood}<br />
                                    {client.city} - {client.state}<br />
                                    CEP: {client.zip}
                                </div>
                                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${client.street}, ${client.number}, ${client.city}`)}`, '_blank')}>
                                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-16.686891,-49.255032&zoom=14&size=400x200&sensor=false')] bg-cover opacity-50 contrast-50 grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    <span className="relative z-10 text-xs font-semibold bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-gray-700 dark:text-gray-200">
                                        Abrir no Google Maps
                                    </span>
                                </div>
                            </Card>
                        )}

                        {visibleWidgets.dates && (
                            <Card title="Datas Importantes" icon={Icons.Calendar} action={EditButton}>
                                <div className="space-y-3">
                                    <DetailRow label="Data Contrato" value={client.contract_date ? new Date(client.contract_date).toLocaleDateString() : null} />
                                    <DetailRow label="Instalação" value={client.installation_date ? new Date(client.installation_date).toLocaleDateString() : null} />
                                    <DetailRow label="Cloud" value={client.cloud_date ? new Date(client.cloud_date).toLocaleDateString() : null} />
                                    <DetailRow label="Cancelamento" value={client.cancellation_date ? <span className="text-red-600">{new Date(client.cancellation_date).toLocaleDateString()}</span> : null} />
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Access Data */}
                {visibleWidgets.access && (
                    <Card title="Dados de Acesso" icon={Icons.Lock} action={EditButton}>
                        {accessData.length > 0 ? (
                            <div className="space-y-3">
                                {accessData.map((d: any) => (
                                    <div key={d.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold uppercase text-brand-blue-600 dark:text-brand-blue-400">{d.tipo_acesso}</span>
                                            <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {d.url_tactical && <DetailRow label="URL" value={d.url_tactical} />}
                                        {d.usuario_vpn && <DetailRow label="Usuário VPN" value={d.usuario_vpn} />}
                                        {d.id_anydesk && <DetailRow label="AnyDesk" value={d.id_anydesk} />}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Nenhum dado de acesso registrado.</p>
                        )}
                    </Card>
                )}

                {/* Inventory */}
                {visibleWidgets.inventory && (
                    <Card title="Inventário" icon={Icons.Monitor} action={EditButton}>
                        {inventoryData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-2 py-2">Item</th>
                                            <th className="px-2 py-2 text-right">Qtd</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {inventoryData.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-2 py-2 font-medium text-gray-900 dark:text-white">{item.item}</td>
                                                <td className="px-2 py-2 text-right text-gray-600 dark:text-gray-300">{item.qtd}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Inventário vazio.</p>
                        )}
                    </Card>
                )}

                {/* Servers & VMs */}
                {visibleWidgets.servers && (
                    <Card title="Servidores & VMs" icon={Icons.Server} action={EditButton}>
                        {serversData.length > 0 ? (
                            <div className="space-y-4">
                                {serversData.map((srv: any) => (
                                    <div key={srv.id} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{srv.hostname}</span>
                                            <span className="text-xs text-gray-500">{srv.ip_address}</span>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-800 space-y-2">
                                            <p className="text-xs text-gray-500">{srv.description}</p>
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{srv.os}</span>
                                                {srv.equipment_model && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">{srv.equipment_model}</span>}
                                            </div>
                                            {srv.server_vms && srv.server_vms.length > 0 && (
                                                <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                                                    <p className="text-xs font-bold text-gray-400 mb-1">VMs ({srv.server_vms.length})</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {srv.server_vms.map((vm: any) => (
                                                            <span key={vm.id} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-[10px] border border-purple-100 dark:border-purple-800">
                                                                {vm.vm_name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Nenhum servidor.</p>
                        )}
                    </Card>
                )}

                {/* Systems */}
                {visibleWidgets.systems && (
                    <Card title="Sistemas Utilizados" icon={Icons.Cpu} action={EditButton}>
                        {systemsData.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {systemsData.map((s: any, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Nenhum sistema vinculado.</p>
                        )}
                    </Card>
                )}

                {/* Prov 74 Checklist */}
                {visibleWidgets.prov74 && (
                    <Card title="CheckList Prov. 74" icon={Icons.Shield} action={EditButton}>
                        {prov74Data ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={prov74Data.situacao} />
                                    <span className="text-xs text-gray-500">{new Date(prov74Data.data_hora).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Resumo da Conformidade</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-100 dark:border-green-900/20 text-green-700 dark:text-green-400 text-center">
                                            {Math.round((prov74Data.itens?.length || 0) / 14 * 100)}%
                                            <span className="block text-[10px] opacity-75">Aprovado</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-200 dark:border-gray-700 text-center">
                                            {14 - (prov74Data.itens?.length || 0)}
                                            <span className="block text-[10px] opacity-75">Pendentes</span>
                                        </div>
                                    </div>
                                </div>
                                {prov74Data.observacao && (
                                    <div className="text-xs bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded text-yellow-800 dark:text-yellow-200">
                                        Note: {prov74Data.observacao}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Nenhum checklist realizado.</p>
                        )}
                    </Card>
                )}

                {/* PCN */}
                {visibleWidgets.pcn && (
                    <Card title="PCN" icon={Icons.FileText} action={EditButton}>
                        {pcnData ? (
                            <div className="space-y-2">
                                <DetailRow label="PCN" value={pcnData.pcn ? "Sim" : "Não"} className={pcnData.pcn ? "text-green-600" : "text-gray-400"} />
                                <DetailRow label="Política Backup" value={pcnData.politica_backup ? "Sim" : "Não"} className={pcnData.politica_backup ? "text-green-600" : "text-gray-400"} />
                                <DetailRow label="Política TI" value={pcnData.politica_ti ? "Sim" : "Não"} className={pcnData.politica_ti ? "text-green-600" : "text-gray-400"} />
                                <DetailRow label="Encaminhado" value={pcnData.encaminhado ? "Sim" : "Não"} className={pcnData.encaminhado ? "text-blue-600" : "text-gray-400"} />
                                {pcnData.link && (
                                    <a href={pcnData.link} target="_blank" className="block mt-2 w-full text-center text-xs py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                                        Ver Documento
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Dados de PCN não informados.</p>
                        )}
                    </Card>
                )}

                {/* Reports */}
                {visibleWidgets.reports && (
                    <Card title="Relatórios Recentes" icon={Icons.FileText} action={EditButton}>
                        {reportsData.length > 0 ? (
                            <div className="space-y-2">
                                {reportsData.map((r: any) => (
                                    <div key={r.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30 text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{r.type}</span>
                                            <span className="text-gray-400">{new Date(r.report_date).toLocaleDateString()}</span>
                                        </div>
                                        {r.file_url && (
                                            <a href={r.file_url} target="_blank" className="text-brand-blue-600 hover:underline">Abrir</a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Nenhum relatório recente.</p>
                        )}
                    </Card>
                )}

                {/* Additional Data */}
                {visibleWidgets.additional && (
                    <Card title="Dados Adicionais" icon={Icons.MoreHorizontal} action={EditButton}>
                        {additionalData.length > 0 ? (
                            <div className="space-y-2">
                                {additionalData.map((ad: any) => (
                                    <div key={ad.id} className="p-2 border border-gray-100 dark:border-gray-700 rounded text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                                            {ad.type}
                                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 rounded">{ad.quantity || 1}</span>
                                        </div>
                                        {ad.brand_model && <div className="text-gray-500 text-xs">{ad.brand_model}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Nenhum dado adicional.</p>
                        )}
                    </Card>
                )}


                {/* Right Col */}
                {(visibleWidgets.contacts || visibleWidgets.services || visibleWidgets.financial) && (
                    <div className="flex flex-col gap-6">
                        {visibleWidgets.contacts && (
                            <Card title="Contatos Associados" icon={Icons.User} action={EditButton}>
                                {contacts.length > 0 ? (
                                    <div className="space-y-4">
                                        {contacts.map((c: any) => (
                                            <div key={c.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {c.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{c.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Nenhum contato adicionado.</p>
                                )}
                            </Card>
                        )}

                        {visibleWidgets.services && (
                            <Card title="Resumo Services" icon={Icons.Briefcase} action={EditButton}>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {services.length > 0 ? services.map((s: any, i: number) => (
                                            <span key={i} className="px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium border border-green-100 dark:border-green-800">
                                                {s.name}
                                            </span>
                                        )) : <span className="text-sm text-gray-400 italic">Nenhum serviço</span>}
                                    </div>

                                    {(serversData.length > 0 || serversData.some((s: any) => s.server_vms?.length > 0)) && (
                                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    <Icons.Server className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col leading-none">
                                                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Servidores</span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{serversData.length}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    <Icons.Cpu className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col leading-none">
                                                    <span className="text-[10px] text-gray-500 uppercase font-semibold">VMs</span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {serversData.reduce((acc: number, s: any) => acc + (s.server_vms?.length || 0), 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {visibleWidgets.financial && (
                            <Card title="Financeiro" icon={Icons.CreditCard} action={EditButton}>
                                <div className="space-y-4">
                                    <div className="relative pt-2">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Contrato</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                {client.signed ? 'Assinado' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full ${client.signed ? 'bg-green-500' : 'bg-yellow-400'}`} style={{ width: client.signed ? '100%' : '50%' }}></div>
                                        </div>
                                    </div>
                                    {client.contract_value && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center border border-blue-100 dark:border-blue-800">
                                            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Valor Mensal</span>
                                            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                                R$ {Number(client.contract_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden Widgets Placeholder */}
            {hiddenCount > 0 && (
                <div className="mt-8 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-4 text-gray-400 animate-in fade-in slide-in-from-bottom-4">
                    <span>
                        {hiddenCount} widget{hiddenCount > 1 ? 's' : ''} oculto{hiddenCount > 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-sm text-brand-blue-600 font-medium hover:underline"
                    >
                        Mostrar todos
                    </button>
                </div>
            )}
        </div>
    );
}
