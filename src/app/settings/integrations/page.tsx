"use client";
import { useState } from "react";

export default function IntegrationsPage() {
  const [apiKey, setApiKey] = useState("");
  const [webhook, setWebhook] = useState("");
  const [active, setActive] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Configurações salvas (mock).");
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold">Integrações</h1>
      <form className="mt-4 grid gap-3" onSubmit={save}>
        <label className="grid gap-1">
          <span className="text-sm">Chave de API</span>
          <input className="border rounded px-2 py-2" value={apiKey} onChange={(e)=> setApiKey(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Webhook URL</span>
          <input className="border rounded px-2 py-2" value={webhook} onChange={(e)=> setWebhook(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={(e)=> setActive(e.target.checked)} />
          <span>Status da integração (ativo/inativo)</span>
        </label>
        {msg ? <div className="text-green-700 text-sm">{msg}</div> : null}
        <div>
          <button type="submit" className="rounded bg-[#36a78b] text-white px-4 py-2">Salvar</button>
        </div>
      </form>
    </div>
  );
}

