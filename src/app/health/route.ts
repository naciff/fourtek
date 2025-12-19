import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const urlOk = url.startsWith("http");
  const keyOk = key.length > 20;
  return NextResponse.json({ urlOk, keyOk });
}
