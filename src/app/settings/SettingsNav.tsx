"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SettingsNav() {
    const pathname = usePathname();

    function TabLink({ href, label, disabled }: { href: string; label: string; disabled?: boolean }) {
        const isActive = pathname === href;
        const activeClass = "text-brand-blue-600 border-brand-blue-600 dark:text-brand-blue-400 dark:border-brand-blue-400";
        const inactiveClass = "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200";

        return (
            <Link
                href={disabled ? "#" : href}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${isActive ? activeClass : inactiveClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {label}
            </Link>
        );
    }

    return (
        <div className="flex space-x-8">
            <TabLink href="/settings/users" label="Usuários" />
            <TabLink href="/settings/reports" label="Relatórios" />
            <TabLink href="/settings/integrations" label="Integrações" />
        </div>
    );
}
