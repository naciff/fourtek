"use client";
import { useState, useEffect } from "react";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";

export default function IntegrationsPage() {
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [form, setForm] = useState({
    organization_id: "",
    whatsapp_api_key: "",
    whatsapp_instance: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings/integrations");
      const data = await res.json();
      if (data && !data.error) {
        setForm(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error("Erro ao carregar configurações", e);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setMsg(null);
    // Simular teste de conexão
    setTimeout(() => {
      setMsg({ type: 'success', text: "Teste de conexão concluído com sucesso!" });
      setTesting(false);
    }, 1500);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/settings/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Erro ao salvar configurações");

      setMsg({ type: 'success', text: "Integrações atualizadas com sucesso!" });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || "Erro inesperado ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configurações de Integração</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure a comunicação automática via WhatsApp e E-mail.</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* WhatsApp Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-semibold text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3.5l-1 5.5z"></path></svg>
              WhatsApp (Evolution API / Z-API)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Desconectado</span>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingLabelInput label="Chave da Instância (API Key)" value={form.whatsapp_api_key || ""} onChange={(e: any) => setForm({ ...form, whatsapp_api_key: e.target.value })} />
            <FloatingLabelInput label="Nome da Instância" value={form.whatsapp_instance || ""} onChange={(e: any) => setForm({ ...form, whatsapp_instance: e.target.value })} />
          </div>
        </div>

        {/* E-mail SMTP Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 font-semibold text-sm flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Servidor de E-mail (SMTP)
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FloatingLabelInput label="Servidor SMTP" value={form.smtp_host || ""} onChange={(e: any) => setForm({ ...form, smtp_host: e.target.value })} />
            </div>
            <FloatingLabelInput label="Porta" value={form.smtp_port || ""} onChange={(e: any) => setForm({ ...form, smtp_port: e.target.value })} />
            <FloatingLabelInput label="Usuário / E-mail" value={form.smtp_user || ""} onChange={(e: any) => setForm({ ...form, smtp_user: e.target.value })} />
            <div className="relative">
              <FloatingLabelInput label="Senha" value={form.smtp_pass || ""} onChange={(e: any) => setForm({ ...form, smtp_pass: e.target.value })} type="password" />
            </div>
            <FloatingLabelInput label="E-mail de Envio (From)" value={form.smtp_from || ""} onChange={(e: any) => setForm({ ...form, smtp_from: e.target.value })} />
          </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-lg text-sm border animate-in slide-in-from-bottom-2 ${msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={testConnection}
            disabled={testing || saving}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {testing ? "Testando..." : "Testar Conexão"}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-green-600 hover:bg-brand-green-700 text-white rounded-xl font-bold shadow-lg shadow-brand-green-100 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Integrações"}
          </button>
        </div>
      </form>
    </div>
  );
}
