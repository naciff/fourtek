import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import SidebarCollapse from "@/components/layout/SidebarCollapse";
import SidebarMenu from "@/components/layout/SidebarMenu";
import { DateDisplay, ThemeToggle, UserDropdown } from "@/components/layout/HeaderComponents";
import { supabaseServer } from "@/lib/supabase-server";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";
export const metadata = {
  title: "FourTek Sync",
  icons: {
    icon: "/fourtek-symbol.svg",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer();

  // Safe version reading
  let version = "v0.1.0";
  try {
    const pkg = require("../../../package.json");
    version = "v" + pkg.version;
  } catch (e) {
    console.warn("RootLayout: Could not read package.json version");
  }

  const logoHeaderSrc = process.env.NEXT_PUBLIC_LOGO_HEADER_URL || "/fourtek-logo.svg";
  const logoSymbolSrc = process.env.NEXT_PUBLIC_LOGO_SYMBOL_URL || "/fourtek-symbol.svg";

  let session: any = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data?.session;
  } catch (err) {
    console.warn("RootLayout: Session fetch failed");
  }
  const user = session?.user;
  let displayName = String(user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || "");
  try {
    if (user?.email) {
      const { data } = await supabase
        .from("diretoria")
        .select("id,nome,name,full_name,email,email_pessoal,email_principal")
        .limit(200);
      const logged = String(user.email).toLowerCase();
      const loggedLocal = logged.split("@")[0].replace(/\./g, "");
      let row: any = null;
      for (const r of data || []) {
        const emails = [r?.email, r?.email_pessoal, r?.email_principal]
          .map((e: any) => String(e || "").toLowerCase())
          .filter((e: string) => e.length);
        if (emails.find((e: string) => e === logged)) { row = r; break; }
        const match = emails.find((e: string) => {
          const loc = e.split("@")[0].replace(/\./g, "");
          return loc.includes(loggedLocal) || loggedLocal.includes(loc);
        });
        if (match) { row = r; break; }
      }
      const dirName = row ? String(row.nome || row.name || row.full_name || "").trim() : "";
      if (dirName) displayName = dirName;
    }

    // Check profiles table for updated name and avatar
    if (user?.id) {
      const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();
      if (profile?.full_name) displayName = profile.full_name;
      if (profile?.avatar_url) session.user.user_metadata.avatar_url = profile.avatar_url; // Update session metadata for display
    }
  } catch { }

  const avatar = String(
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    user?.user_metadata?.image ||
    ""
  );

  // Get first name
  const firstName = displayName.split(" ")[0];
  const hasSession = Boolean(session);

  return (
    <html lang="pt-br">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <div className={`min-h-screen grid grid-cols-1 ${hasSession ? 'grid-cols-[auto_1fr] md:grid-cols-[auto_1fr]' : 'md:grid-cols-1'}`}>
          {hasSession && (
            <aside className="flex flex-col sticky top-0 h-screen overflow-auto bg-[#f5f5f5] dark:bg-gray-800 text-gray-900 dark:text-gray-100 app-sidebar border-r border-black/10 dark:border-white/10 transition-all duration-300 ease-in-out">
              <div className="px-4 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-center">
                <Link href="/" className="flex items-center">
                  <img src={logoSymbolSrc} alt="FourTek" className="h-8" />
                </Link>
              </div>
              <nav className="flex-1">
                <SidebarMenu />
              </nav>
              <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-center">
                <SidebarCollapse />
              </div>
            </aside>
          )}
          <div className="flex flex-col">
            {hasSession && (
              <header className="hidden md:block border-b border-black/10 dark:border-white/10 bg-[#f5f5f5] dark:bg-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <img src={logoHeaderSrc} alt="FourTek" className="h-8" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                    <DateDisplay />
                    <ThemeToggle />
                    <UserDropdown displayName={firstName} avatarUrl={avatar} />
                  </div>
                </div>
              </header>
            )}
            {/* header móvel removido para usar o sidebar também em mobile */}
            <main className={hasSession ? "w-full px-4 py-3 flex-1 bg-white dark:bg-gray-900" : "w-full flex-1 dark:bg-gray-900"}>{children}</main>
            {hasSession && (
              <footer className="relative px-4 py-2 text-xs text-gray-600 dark:text-gray-400 bg-[#f5f5f5] dark:bg-gray-800 border-t border-black/10 dark:border-white/10 flex items-center justify-center">
                <span>@2026 Fourtek Soluções em Ti</span>
                <span className="absolute right-4">Versão {version.substring(1)}</span>
              </footer>
            )}
            {/* navegação móvel inferior removida */}
          </div>
        </div>
      </body>
    </html>
  );
}
