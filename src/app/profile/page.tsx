import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold text-brand-blue-800">Meu Perfil</h1>
      <ProfileForm user={user} />
    </div>
  );
}
