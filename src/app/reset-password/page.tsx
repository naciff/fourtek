"use client";
import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password/update` : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Se existir uma conta, enviamos um e-mail de recuperação.");
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-semibold text-brand-blue-800">Recuperar senha</h1>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">E-mail</span>
          <input className="rounded border px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button disabled={loading} className="rounded bg-brand-green-600 px-4 py-2 text-white disabled:opacity-50">{loading?"Enviando...":"Enviar e-mail"}</button>
      </form>
      <div className="mt-4 text-sm">
        <Link href="/login" className="text-brand-blue-700">Voltar ao login</Link>
      </div>
    </div>
  );
}