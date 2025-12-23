import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Autorização via cookies Supabase + RLS; verificação JWT própria removida.

const usersStore: any[] = [];
async function tryInsertSupabase(user: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) throw new Error("Usuário não autenticado");
    const dup = await supabase.from("users").select("id").eq("email", user.email).limit(1);
    if (Array.isArray(dup.data) && dup.data.length) return { error: new Error("E-mail já cadastrado") };
    const { data, error } = await supabase.from("users").insert({
      user_id: uid,
      full_name: user.full_name,
      email: user.email,
      group: user.group,
      permissions: user.permissions,
      password_hash: user.password_hash,
    }).select("id").single();
    if (error) throw error;
    return { id: data?.id };
  } catch (e: any) {
    console.error("usuarios.insert error", e?.message || e);
    return { error: e };
  }
}
async function tryListSupabase() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.from("users").select("id,full_name,email,group,permissions,last_login,phone").order("id", { ascending: false });
    if (error) throw error;
    return { data };
  } catch (e: any) {
    return { error: e };
  }
}

export async function POST(req: Request) {
  try {
    // RLS do Supabase controla acesso conforme a sessão do usuário nas cookies
    const body = await req.json();
    const { full_name, email, password, group, permissions } = body || {};
    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }
    const crypto = await import("node:crypto");
    const salt = process.env.PASSWORD_SALT || "dev-salt";
    const password_hash = crypto.createHash("sha256").update(String(password) + salt).digest("hex");
    const user = { id: Date.now(), full_name, email, group: group || "gestor", permissions: permissions || [], password_hash };
    const ins = await tryInsertSupabase(user);
    if (!ins.error && ins.id) {
      user.id = ins.id;
    } else {
      const msg = ins.error?.message || "Falha ao inserir no banco";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return NextResponse.json({ id: user.id, full_name: user.full_name, email: user.email, group: user.group, permissions: user.permissions }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const list = await tryListSupabase();
  if (!list.error && Array.isArray(list.data)) return NextResponse.json(list.data, { status: 200 });
  return NextResponse.json({ error: "Falha ao listar do banco" }, { status: 500 });
}

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { error } = await supabase.from("users").delete().eq("id", id).eq("user_id", uid);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const body = await req.json();
    const { id, full_name, email, group, permissions, password } = body || {};
    if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
    const update: any = { full_name, email, group, permissions };
    if (password) {
      const crypto = await import("node:crypto");
      const salt = process.env.PASSWORD_SALT || "dev-salt";
      update.password_hash = crypto.createHash("sha256").update(String(password) + salt).digest("hex");
    }
    const { error } = await supabase.from("users").update(update).eq("id", id).eq("user_id", uid);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
