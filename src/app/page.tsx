import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function HomePage() {
  let session = null;
  try {
    const supabase = supabaseServer();
    const { data } = await supabase.auth.getSession();
    session = data?.session;
  } catch (e) {
    console.warn("HomePage: Failed to fetch session. Check environment variables.");
  }

  if (session) redirect("/dashboard");

  return (
    <div className="grid gap-6 p-10 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-brand-blue-800">Fourtek Sync</h1>
      <div className="space-y-4">
        <p className="text-lg text-gray-700">
          Bem-vindo ao sistema de gestão da Fourtek Soluções.
        </p>
        <p className="text-gray-500">
          Se você está vendo esta página, o servidor está ativo. Caso não consiga entrar, verifique suas credenciais ou as configurações do sistema.
        </p>
      </div>
      <div className="pt-4">
        <a href="/login" className="inline-block rounded-lg bg-brand-green-600 hover:bg-brand-green-700 transition-colors px-8 py-3 text-white font-medium shadow-md">
          Acessar Sistema
        </a>
      </div>
    </div>
  );
}