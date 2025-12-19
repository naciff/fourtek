import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return NextResponse.json({ message: "" });
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("messages")
    .select("id,message,active")
    .limit(200);
  if (error) return NextResponse.json({ message: "" });
  const pool = (data || [])
    .filter((x: any) => x?.active !== false)
    .map((x: any) => String(x?.message || "").trim())
    .filter((v: string) => v.length);
  if (!pool.length) return NextResponse.json({ message: "" });
  const idx = Math.floor(Math.random() * pool.length);
  return NextResponse.json({ message: pool[idx] });
}
