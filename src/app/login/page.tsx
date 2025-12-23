"use client";
import { FormEvent, useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState("/fourtek-logo.png");
  const bgUrl = process.env.NEXT_PUBLIC_LOGIN_BG_URL || "/login-illustration.svg";
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: auth, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    if (auth?.user) {
      // Update last_login in users table (parallel, non-blocking if possible)
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("user_id", auth.user.id);
    }
    router.replace("/dashboard");
    router.refresh();
  }

  useEffect(() => {
    (async () => {
      const envMsg = process.env.NEXT_PUBLIC_LOGIN_MESSAGE || "";
      if (envMsg && envMsg.trim().length) { setMessage(envMsg); return; }
      try {
        const r = await fetch("/api/login-message");
        if (r.ok) {
          const j = await r.json();
          if (j?.message && String(j.message).trim().length) { setMessage(String(j.message)); return; }
        }
        const { data, error } = await supabase
          .from("messages")
          .select("message")
          .limit(200);
        if (error) { setMessage(""); return; }
        const arr = (data || [])
          .map((x: any) => String(x?.message || "").trim())
          .filter((v: string) => v.length);
        if (!arr.length) { setMessage(""); return; }
        const idx = Math.floor(Math.random() * arr.length);
        setMessage(arr[idx]);
      } catch {
        setMessage("");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Pane: Image */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg-new-2.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
      </div>

      {/* Right Pane: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md flex flex-col items-center gap-4">

          <div className="flex flex-col items-center gap-2 mb-4">
            <img src={logoSrc} onError={() => setLogoSrc("/fourtek-logo.svg")} alt="FourTek" className="h-16" />
            <h1 className="sr-only">Entrar</h1>
          </div>

          <form className="w-full grid gap-4" onSubmit={onSubmit}>
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-gray-600">E-mail</label>
              <input
                className="w-full rounded border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-brand-green-600 outline-none transition-all"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-gray-600">Senha</label>
              <input
                className="w-full rounded border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-brand-green-600 outline-none transition-all"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-sm text-brand-green-600 hover:opacity-80 font-medium">
                Esqueceu a senha?
              </Link>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              disabled={loading}
              className="w-full rounded bg-brand-green-600 hover:bg-brand-green-700 text-white px-4 py-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 text-gray-600">
            <a href="https://www.fourtek.com.br" target="_blank" rel="noopener noreferrer" aria-label="Site" className="hover:opacity-80 transition-opacity">
              <img src="/icons/site.svg" alt="Site" width="22" height="22" />
            </a>
            <a href="https://www.instagram.com/fourteksolucoes/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-brand-blue-700 transition-colors">
              <img src="/icons/instagram.svg" alt="Instagram" width="22" height="22" />
            </a>
            <a href="https://www.facebook.com/fourteksolucoesti" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-brand-blue-700 transition-colors">
              <img src="/icons/facebook.svg" alt="Facebook" width="22" height="22" />
            </a>
            <a href="https://www.linkedin.com/company/fourtek-solu%C3%A7%C3%B5es-em-ti/about/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-brand-blue-700 transition-colors">
              <img src="/icons/linkedin.svg" alt="LinkedIn" width="22" height="22" />
            </a>
          </div>

          <div className="mt-8 text-center text-[10px] text-gray-400 w-full leading-relaxed whitespace-nowrap">
            Ao continuar, você concorda com nossos Termos de Serviços e Politica de Privacidade
          </div>

          {message ? (
            <div className="mt-4 text-xs italic text-gray-500 text-center px-4">&ldquo;{message}&rdquo;</div>
          ) : null}

        </div>
      </div>
    </div>
  );
}
