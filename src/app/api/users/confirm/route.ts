import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { full_name, email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    const supabase = createRouteHandlerClient({ cookies });
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/login` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { name: full_name }
      }
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, user: data.user?.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

