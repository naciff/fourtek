import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET || "";
  const headerKey = req.headers.get("x-cron-key") || "";
  if (!secret || headerKey !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "missing env" }, { status: 500 });
  }
  const supabase = createClient(url, serviceKey);
  const todayISO = new Date().toISOString().slice(0,10);
  const res = await supabase
    .from("contracts")
    .update({ status: "encerrado" })
    .not("end_date", "is", null)
    .lte("end_date", todayISO)
    .eq("status", "ativo")
    .select("id");
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  const count = (res.data ?? []).length;
  return NextResponse.json({ closed: count, date: todayISO });
}