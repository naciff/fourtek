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

export function FullscreenToggle() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const toggle = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <button
            onClick={toggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
        >
            {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            )}
        </button>
    );
}

export function NotificationBell({ count = 5 }: { count?: number }) {
    return (
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {count > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue-600 text-[10px] font-bold text-white border-2 border-white dark:border-gray-800">
                    {count}
                </span>
            )}
        </button>
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
                className="flex items-center gap-3 py-1 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="relative">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-600 object-cover" />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                            <span className="text-sm font-semibold">{displayName ? displayName[0].toUpperCase() : "U"}</span>
                        </div>
                    )}
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayName || "Usuário"}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 mb-1 border-b border-gray-50 dark:border-gray-700/50">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minha Conta</span>
                    </div>

                    <div className="space-y-1 mt-1">
                        <a
                            href="/profile"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-brand-blue-50/50 dark:hover:bg-blue-900/20 hover:text-brand-blue-600 dark:hover:text-blue-400 transition-all group"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            Perfil
                        </a>

                        <button
                            onClick={() => {
                                setOpen(false);
                                window.dispatchEvent(new CustomEvent("open-settings"));
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all group"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 group-hover:rotate-45 transition-transform">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </div>
                            Configurações
                        </button>

                        <a
                            href="/help"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400 transition-all group"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            </div>
                            Ajuda
                        </a>
                    </div>

                    <div className="my-2 h-px bg-gray-100 dark:bg-gray-700 mx-2" />

                    <form action="/auth/logout" method="post" className="p-1">
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all group"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </div>
                            Sair
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export function SettingsDrawer() {
    const [open, setOpen] = useState(false);
    const [toolbar, setToolbar] = useState({ visible: true, position: 'fixed' });
    const [nav, setNav] = useState({ open: true, position: 'side', options: ['user-panel'] });
    const [footer, setFooter] = useState({ visible: true, position: 'static' });

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener("open-settings", handler);
        return () => window.removeEventListener("open-settings", handler);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setOpen(false)}>
            <div
                className="w-80 h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h2>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="space-y-10">
                    {/* BARRA DE FERRAMENTAS */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Barra de Ferramentas</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visível</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={toolbar.visible} onChange={(e) => setToolbar({ ...toolbar, visible: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-green-500"></div>
                                </div>
                            </label>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Posição</span>
                                <div className="space-y-3">
                                    {['Acima Fixo', 'Fixo', 'Estático'].map((pos) => (
                                        <label key={pos} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input type="radio" name="toolbar-pos" checked={toolbar.position === pos.toLowerCase().replace(' ', '-')} onChange={() => setToolbar({ ...toolbar, position: pos.toLowerCase().replace(' ', '-') })} className="peer sr-only" />
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-brand-green-500 transition-all"></div>
                                                <div className="absolute h-2.5 w-2.5 rounded-full bg-brand-green-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{pos}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* NAVEGAÇÃO */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Navegação</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Abrir</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={nav.open} onChange={(e) => setNav({ ...nav, open: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-green-500"></div>
                                </div>
                            </label>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Posição</span>
                                <div className="space-y-3">
                                    {['Principal', 'Lado'].map((pos) => (
                                        <label key={pos} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input type="radio" name="nav-pos" checked={nav.position === pos.toLowerCase()} onChange={() => setNav({ ...nav, position: pos.toLowerCase() })} className="peer sr-only" />
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-brand-green-500 transition-all"></div>
                                                <div className="absolute h-2.5 w-2.5 rounded-full bg-brand-green-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{pos}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Opções</span>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Desmoronou</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={nav.options.includes('user-panel')} onChange={() => { }} className="h-5 w-5 rounded border-gray-300 text-brand-green-600 focus:ring-brand-green-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Exibir painel do usuário</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RODAPÉ */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Rodapé</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visível</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={footer.visible} onChange={(e) => setFooter({ ...footer, visible: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-green-500"></div>
                                </div>
                            </label>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Posição</span>
                                <div className="space-y-3">
                                    {['Acima Fixo', 'Fixo', 'Estático'].map((pos) => (
                                        <label key={pos} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input type="radio" name="footer-pos" checked={footer.position === pos.toLowerCase().replace(' ', '-')} onChange={() => setFooter({ ...footer, position: pos.toLowerCase().replace(' ', '-') })} className="peer sr-only" />
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-brand-green-500 transition-all"></div>
                                                <div className="absolute h-2.5 w-2.5 rounded-full bg-brand-green-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{pos}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
