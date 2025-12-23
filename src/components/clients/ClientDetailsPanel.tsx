"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useState, useEffect } from "react";
import DeleteButton from "../../app/clients/DeleteButton"; // Assuming this is reusable or I might need to move it

interface ClientDetailsPanelProps {
    client: any;
    searchParams: any;
}

import { supabaseBrowser } from "@/lib/supabase-browser";

export function ClientDetailsPanel({ client, searchParams }: ClientDetailsPanelProps) {
    const [contactsOpen, setContactsOpen] = useState(true);
    const [repsOpen, setRepsOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [reps, setReps] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        if (!client?.id) return;
        const supabase = supabaseBrowser();

        async function loadDetails() {
            // Load Reps
            const { data: repsData } = await supabase
                .from("client_representatives")
                .select("representatives(id, full_name, birth_date, phone, email)")
                .eq("client_id", client.id);

            if (repsData) {
                const flatReps = repsData.map((r: any) => r.representatives).filter(Boolean);
                console.log("ClientDetailsPanel: Fetched Reps ->", flatReps);
                setReps(flatReps);
            }

            // Load Services
            const { data: servicesData } = await supabase
                .from("client_services")
                .select("services(id, name)")
                .eq("client_id", client.id);

            if (servicesData) {
                const flatServices = servicesData.map((s: any) => s.services).filter(Boolean);
                console.log("ClientDetailsPanel: Fetched Services ->", flatServices);
                setServices(flatServices);
            }
        }

        loadDetails();
    }, [client]);

    if (!client) return null;

    function buildAddress(c: any) {
        return [c.street, c.number, c.complement, c.neighborhood, c.city, c.state, c.zip]
            .map((v: any) => String(v || "").trim())
            .filter(Boolean)
            .join(", ");
    }

    function formatDate(iso: string) {
        if (!iso) return "";
        const [year, month, day] = iso.split("-");
        return `${day}/${month}`;
    }

    const address = buildAddress(client);
    const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

    return (
        <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 bg-white dark:bg-gray-800 border dark:border-gray-700 h-full overflow-y-auto rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/clients/${client.id}`} className="p-2 text-gray-500 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:text-brand-blue-400 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" /></svg>
                        </Link>
                        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Mapa">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z" /></svg>
                        </a>
                        {/* Using a wrapper for delete functionality if possible, or just link to delete */}
                        <div className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                            {/* Reusing existing logic would be ideal, but for now just visual placeholder or simple logic */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                        </div>

                        <Link href={{ pathname: "/clients", query: searchParams }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="Fechar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </Link>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{client.alias || client.corporate_name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">Contrato #{client.client_contract}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-2 py-3 border-t border-b border-gray-100 dark:border-gray-700/50">
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">Situação</p>
                        <StatusBadge status={String(client.situation)} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">Tipo de Empresa</p>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {client.company_type || "Empresa"}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">CNPJ</p>
                        <div className="flex items-center justify-between group">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono truncate">{client.cnpj}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(client.cnpj)}
                                className="text-xs text-brand-blue-600 hover:text-brand-blue-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium ml-1"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">Cidade / UF</p>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate block" title={`${client.city} - ${client.state}`}>
                            {client.city} - {client.state}
                        </span>
                    </div>
                </div>

                <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                        onClick={() => setContactsOpen(!contactsOpen)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Contatos</span>
                        <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${contactsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {contactsOpen && (
                        <div className="p-4 space-y-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            {client.email && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email Principal</p>
                                        <a href={`mailto:${client.email}`} className="text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-brand-blue-600 truncate block">{client.email}</a>
                                    </div>
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Telefone</p>
                                        <a href={`tel:${client.phone}`} className="text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-brand-blue-600 truncate block">{client.phone}</a>
                                    </div>
                                </div>
                            )}
                            {!client.email && !client.phone && (
                                <p className="text-sm text-gray-400 italic">Sem contatos registrados.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Representatives Section */}
                <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                        onClick={() => setRepsOpen(!repsOpen)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Representante</span>
                        <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${repsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {repsOpen && (
                        <div className="p-4 space-y-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            {reps && reps.length > 0 ? (
                                reps.map((r: any, idx: number) => (
                                    <div key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0 space-y-3">
                                        {/* Name */}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Nome</p>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 block">{r.full_name || "Nome não encontrado"}</span>
                                            </div>
                                        </div>

                                        {/* Birthday & Phone Container */}
                                        <div className="flex flex-col gap-3">
                                            {r.birth_date && (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path></svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Aniversário</p>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{formatDate(r.birth_date)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {r.phone && (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Celular</p>
                                                        <a href={`tel:${r.phone}`} className="text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-brand-blue-600">{r.phone}</a>
                                                    </div>
                                                </div>
                                            )}

                                            {r.email && (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                                        <a href={`mailto:${r.email}`} className="text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-brand-blue-600 truncate block">{r.email}</a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Nenhum representante vinculado.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Services Section */}
                <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                        onClick={() => setServicesOpen(!servicesOpen)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Serviços Contratados</span>
                        <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${servicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {servicesOpen && (
                        <div className="p-4 space-y-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            {services && services.length > 0 ? (
                                services.map((s: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
                                        <span className="text-sm text-gray-700 dark:text-gray-200">{s.name || "Serviço não encontrado"}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Nenhum serviço contratado.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity Placeholder */}
                <div className="border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Histórico de Atividades</h4>
                    <div className="h-[120px] flex items-end justify-between gap-1 px-2 pb-2">
                        {[40, 70, 45, 90, 60, 30, 50].map((h, i) => (
                            <div key={i} className={`w-full rounded-t ${i === 3 ? 'bg-brand-blue-600' : 'bg-blue-100 dark:bg-blue-900/30'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <Link href={`/clients/${client.id}`} className="w-full flex items-center justify-center p-3 rounded-lg border border-brand-blue-200 dark:border-brand-blue-800 text-brand-blue-600 dark:text-brand-blue-400 hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20 font-medium transition-colors">
                        Ver detalhes completos
                    </Link>
                </div>

            </div>
        </div>
    );
}
