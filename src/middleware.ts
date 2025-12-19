import { NextResponse } from "next/server";

function getPath(url: string) {
  try { return new URL(url).pathname; } catch { return url; }
}

export async function middleware(req: Request) {
  // Autorização passa pelas cookies do Supabase; RLS controla acesso.
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
