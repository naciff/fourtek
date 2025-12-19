import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    const uid = user.id;
    const tables = [
      "client_contacts","client_representatives","contracts","contract_items",
      "clients","representatives","services","client_services",
      "diretoria","empresa","inventario","inventario_historico","dados_acesso","servidores",
      "pcn","relatorios","dados_adicionais","prov74_checklist"
    ];
    for (const t of tables) {
      try { await supabase.from(t).delete().eq("user_id", uid); } catch {}
    }
    let accountDeleted = false;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
    if (url && serviceKey && serviceKey.length > 20) {
      const admin = createClient(url, serviceKey);
      const { error } = await admin.auth.admin.deleteUser(uid);
      if (!error) accountDeleted = true;
    }
    return NextResponse.json({ ok: true, accountDeleted });
  } catch (e:any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

