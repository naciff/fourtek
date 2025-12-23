import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import SidebarCollapse from "@/components/layout/SidebarCollapse";
import SidebarMenu from "@/components/layout/SidebarMenu";
import { DateDisplay, FullscreenToggle, NotificationBell, SettingsDrawer, ThemeToggle, UserDropdown } from "@/components/layout/HeaderComponents";
import { LayoutProvider } from "@/components/layout/LayoutContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabaseServer } from "@/lib/supabase-server";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";
export const metadata = {
  title: "FourTek Sync",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer();

  // Safe version reading
  let version = "v0.1.0";
  try {
    const pkg = require("../../package.json");
    version = pkg.version;
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
        <LayoutProvider>
          <AppLayout
            hasSession={hasSession}
            logoSymbolSrc={logoSymbolSrc}
            logoHeaderSrc={logoHeaderSrc}
            displayName={displayName}
            avatar={avatar}
            userEmail={user?.email}
            version={version}
          >
            {children}
            <CookieConsent />
          </AppLayout>
        </LayoutProvider>
      </body>
    </html>
  );
}
