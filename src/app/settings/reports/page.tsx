"use client";
import { useState, useEffect } from "react";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ReportsSettingsPage() {
    const supabase = supabaseBrowser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [settings, setSettings] = useState<any>({
        organization_id: "",
        company_name: "",
        company_document: "",
        phone: "",
        email: "",
        address_street: "",
        address_number: "",
        address_complement: "",
        address_neighborhood: "",
        address_city: "",
        address_state: "",
        address_zip: "",
        logo_url: "",
        header_text: "",
        footer_text: "",
        signatures: []
    });

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/settings/reports");
                if (res.ok) {
                    const data = await res.json();
                    setSettings((prev: any) => ({ ...prev, ...data }));
                }
            } catch (e) {
                console.error("Erro ao carregar configurações", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleChange = (field: string, value: string) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMsg(null);

        try {
            const { data: userData } = await supabase.auth.getUser();
            const uid = userData?.user?.id || 'anon';
            const path = `settings/logos/${uid}-${Date.now()}-${file.name}`;

            const { error: upErr } = await supabase.storage.from('files').upload(path, file, { upsert: true });
            if (upErr) throw upErr;

            const { data: pubData } = supabase.storage.from('files').getPublicUrl(path);
            handleChange("logo_url", pubData.publicUrl);
            setMsg({ type: 'success', text: "Logo enviada com sucesso!" });
        } catch (err: any) {
            console.error("Upload error:", err);
            setMsg({ type: 'error', text: "Erro ao enviar logo: " + err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSignatureChange = (index: number, field: string, value: string) => {
        const next = [...settings.signatures];
        next[index] = { ...next[index], [field]: value };
        setSettings((prev: any) => ({ ...prev, signatures: next }));
    };

    const addSignature = () => {
        setSettings((prev: any) => ({ ...prev, signatures: [...prev.signatures, { name: "", role: "" }] }));
    };

    const removeSignature = (index: number) => {
        const next = settings.signatures.filter((_: any, i: number) => i !== index);
        setSettings((prev: any) => ({ ...prev, signatures: next }));
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch("/api/settings/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setMsg({ type: 'success', text: "Configurações salvas com sucesso!" });
            } else {
                throw new Error("Erro ao salvar");
            }
        } catch (e) {
            setMsg({ type: 'error', text: "Falha ao salvar as configurações." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configurações de Relatórios</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personalize o cabeçalho, rodapé e as assinaturas dos seus relatórios exportados.</p>
            </div>

            <form onSubmit={save} className="space-y-6">
                {/* Dados da Empresa */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-semibold text-sm flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        Identificação da Empresa
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput label="Nome Fantasia / Razão Social" value={settings.company_name} onChange={(e: any) => handleChange("company_name", e.target.value)} />
                        <FloatingLabelInput label="CNPJ / CPF" value={settings.company_document} onChange={(e: any) => handleChange("company_document", e.target.value)} />
                        <FloatingLabelInput label="Telefone / WhatsApp" value={settings.phone} onChange={(e: any) => handleChange("phone", e.target.value)} />
                        <FloatingLabelInput label="E-mail de Contato" value={settings.email} onChange={(e: any) => handleChange("email", e.target.value)} />
                    </div>
                </div>

                {/* Endereço */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-semibold text-sm flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Localização
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <FloatingLabelInput label="Rua / Logradouro" value={settings.address_street} onChange={(e: any) => handleChange("address_street", e.target.value)} />
                        </div>
                        <FloatingLabelInput label="Número" value={settings.address_number} onChange={(e: any) => handleChange("address_number", e.target.value)} />
                        <FloatingLabelInput label="Bairro" value={settings.address_neighborhood} onChange={(e: any) => handleChange("address_neighborhood", e.target.value)} />
                        <FloatingLabelInput label="Cidade" value={settings.address_city} onChange={(e: any) => handleChange("address_city", e.target.value)} />
                        <FloatingLabelInput label="UF" value={settings.address_state} onChange={(e: any) => handleChange("address_state", e.target.value)} />
                    </div>
                </div>

                {/* Customização Visual */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-semibold text-sm flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue-500"><path d="M12 20v-6M9 11l3 3 3-3M4 16.5a6 6 0 0 1 0-9h.2A6.6 6.6 0 0 1 12 4c3.4 0 6.2 2.6 6.5 6h.5a5 5 0 0 1 0 10l-4 0"></path></svg>
                        Personalização Visual
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1 space-y-4 w-full">
                                <FloatingLabelInput label="URL da Logo" value={settings.logo_url} onChange={(e: any) => handleChange("logo_url", e.target.value)} />
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase ml-1">Upload da Logo</span>
                                    <div className="flex items-center gap-3">
                                        <label className="cursor-pointer bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-300 px-4 py-2 rounded-lg border border-brand-blue-200 dark:border-brand-blue-800 hover:bg-brand-blue-100 transition-colors flex items-center gap-2 text-sm font-bold">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            {uploading ? "Enviando..." : "Escolher Arquivo"}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                        <span className="text-[10px] text-gray-400">Recomendado: Altura 50px, PNG transparente.</span>
                                    </div>
                                </div>
                            </div>
                            {settings.logo_url && (
                                <div className="flex-shrink-0 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Preview</span>
                                    <img src={settings.logo_url} alt="Logo Preview" className="h-12 object-contain" />
                                </div>
                            )}
                        </div>
                        <label className="block space-y-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase ml-1">Mensagem do Cabeçalho</span>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none transition-all min-h-[80px]"
                                value={settings.header_text || ""}
                                onChange={(e) => handleChange("header_text", e.target.value)}
                                placeholder="Texto que aparecerá logo abaixo da logo no topo..."
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase ml-1">Mensagem do Rodapé</span>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none transition-all min-h-[80px]"
                                value={settings.footer_text || ""}
                                onChange={(e) => handleChange("footer_text", e.target.value)}
                                placeholder="Geralmente uma mensagem institucional ou legal..."
                            />
                        </label>
                    </div>
                </div>

                {/* Assinaturas */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-semibold text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Bloco de Assinaturas
                        </div>
                        <button type="button" onClick={addSignature} className="text-xs text-brand-blue-600 hover:text-brand-blue-700 font-bold flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Adicionar
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {(settings.signatures || []).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Nenhuma assinatura configurada.</p>
                        )}
                        {(settings.signatures || []).map((sig: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="flex-1">
                                    <FloatingLabelInput label="Nome para Assinatura" value={sig.name} onChange={(e: any) => handleSignatureChange(idx, "name", e.target.value)} />
                                </div>
                                <div className="flex-1">
                                    <FloatingLabelInput label="Cargo / Função" value={sig.role} onChange={(e: any) => handleSignatureChange(idx, "role", e.target.value)} />
                                </div>
                                <button type="button" onClick={() => removeSignature(idx)} className="p-2 text-red-400 hover:text-red-600 mb-1">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {msg && (
                    <div className={`p-4 rounded-lg text-sm border animate-in slide-in-from-bottom-2 ${msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl font-bold shadow-lg shadow-brand-blue-200 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Salvando..." : "Salvar Configurações"}
                    </button>
                </div>
            </form>
        </div>
    );
}
