import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) redirect("/dashboard");
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Gestão de Clientes Fourtek</h1>
      <p className="text-gray-700">O aplicativo da Fourtek Soluções é uma ferramenta completa de gestão empresarial projetada para otimizar processos, aumentar a eficiência e facilitar a tomada de decisões.</p>
      <p className="text-gray-700">Faça login para acessar o sistema.</p>
      <a href="/login" className="w-fit rounded bg-brand-green-600 px-4 py-2 text-white">Entrar</a>
    </div>
  );
}