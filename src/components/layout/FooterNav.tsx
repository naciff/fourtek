"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function item(active: boolean) {
  return `flex flex-col items-center justify-center px-3 py-2 ${active ? "text-[#36a78b]" : "text-gray-700"}`;
}
function icon(active: boolean) {
  return `h-5 w-5 ${active ? "text-[#36a78b]" : "text-gray-600"}`;
}

export default function FooterNav() {
  const p = usePathname();
  const is = (href: string) => Boolean(p && p.startsWith(href));
  return (
    <div className="flex justify-around w-full">
      <Link href="/dashboard" className={item(is("/dashboard"))}>
        <svg className={icon(is("/dashboard"))} width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
      </Link>
      <Link href="/clients" className={item(is("/clients"))}>
        <svg className={icon(is("/clients"))} width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-1.657-2.686-3-8-3z" fill="currentColor"/></svg>
      </Link>
      <Link href="/representatives" className={item(is("/representatives"))}>
        <svg className={icon(is("/representatives"))} width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 11c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm-8 0c2.761 0 5-2.239 5-5S10.761 1 8 1 3 3.239 3 6s2.239 5 5 5zm0 2c-3.314 0-6 1.343-6 3v3h10v-3c0-1.657-2.686-3-6-3zm8 0c-1.098 0-2.131.142-3 .391 1.815.762 3 1.935 3 3.609V19h8v-3c0-1.657-2.686-3-8-3z" fill="currentColor"/></svg>
      </Link>
      <Link href="/contracts" className={item(is("/contracts"))}>
        <svg className={icon(is("/contracts"))} width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 7h5l-5-5v5z" fill="currentColor"/></svg>
      </Link>
      <Link href="/reports" className={item(is("/reports"))}>
        <svg className={icon(is("/reports"))} width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v2H3V3zm0 6h18v2H3V9zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" fill="currentColor"/></svg>
      </Link>
      <Link href="/profile" className={item(is("/profile"))}>
        <svg className={icon(is("/profile"))} width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5z" fill="currentColor"/></svg>
      </Link>
    </div>
  );
}

