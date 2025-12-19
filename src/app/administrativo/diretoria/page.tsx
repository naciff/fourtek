import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DiretoriaForm from "@/app/profile/DiretoriaForm";

export const dynamic = "force-dynamic";

export default async function DiretoriaOnlyPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");
  return (
    <div className="max-w-3xl mx-auto grid gap-6">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Diretoria</h1>
      <div className="rounded-lg border bg-white p-6">
        <DiretoriaForm />
      </div>
    </div>
  );
}

