"use client";
import { FormEvent, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function UpdatePasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 8) { setError("A senha deve ter ao menos 8 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage("Senha atualizada com sucesso.");
    setTimeout(() => router.replace("/login"), 1500);
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold text-brand-blue-800">Definir nova senha</h1>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Nova senha</span>
          <input type="password" className="rounded border px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Confirmar senha</span>
          <input type="password" className="rounded border px-3 py-2" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white">Salvar</button>
      </form>
    </div>
  );
}