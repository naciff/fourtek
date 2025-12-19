"use client";

import { useEffect, useState } from "react";

export function DateDisplay() {
    const [dateStr, setDateStr] = useState("");

    useEffect(() => {
        const s = new Intl.DateTimeFormat("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date());
        setDateStr(s.charAt(0).toUpperCase() + s.slice(1));
    }, []);

    if (!dateStr) return null;

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 border-r border-gray-300 pr-4 mr-4 hidden md:flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{dateStr}</span>
        </div>
    );
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as any;
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "auto") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
            // Also set data-theme for DaisyUI or other libs if needed
            root.setAttribute("data-theme", systemTheme);
        } else {
            root.classList.add(theme);
            root.setAttribute("data-theme", theme);
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Icons from Lucide or similar
    return (
        <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-white text-nrand-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                title="Claro"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>
            <button
                onClick={() => setTheme("auto")}
                className={`p-1.5 rounded-full transition-all ${theme === "auto" ? "bg-white text-brand-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                title="Automático"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" strokeOpacity="0.5" /><circle cx="12" cy="12" r="8" strokeOpacity="0.5" /><text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">A</text></svg>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-white text-brand-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                title="Escuro"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    );
}

export function UserDropdown({ displayName, avatarUrl }: { displayName: string, avatarUrl?: string }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const close = () => setOpen(false);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-gray-200 object-cover" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        <span className="text-xs">{displayName ? displayName[0].toUpperCase() : "U"}</span>
                    </div>
                )}
                <span>Olá, {displayName || "Usuário"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-100 bg-white shadow-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <a
                        href="/profile"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Meu Perfil
                    </a>
                    <div className="my-1 h-px bg-gray-100" />
                    <form action="/auth/logout" method="post">
                        <button
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Sair
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
