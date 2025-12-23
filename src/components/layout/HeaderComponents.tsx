"use client";

import { useEffect, useState } from "react";
import { useLayout, ThemeStyle } from "./LayoutContext";


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
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200 border-r border-gray-300 dark:border-gray-700 pr-4 mr-4 ml-6 hidden md:flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{dateStr}</span>
        </div>
    );
}

export function ThemeToggle() {
    const { settings, setSettings } = useLayout();
    const theme = settings.theme.style;

    const setTheme = (style: ThemeStyle) => {
        setSettings(prev => ({ ...prev, theme: { ...prev.theme, style } }));
    };

    return (
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 border border-black/5 dark:border-white/5 shadow-inner">
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                title="Claro"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>
            <button
                onClick={() => setTheme("default")}
                className={`p-1.5 rounded-full transition-all ${theme === "default" ? "bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                title="Automático"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" strokeOpacity="0.5" /><circle cx="12" cy="12" r="8" strokeOpacity="0.5" /><text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">A</text></svg>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                title="Escuro"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    );
}

export function PrivacyToggle() {
    const { settings, setSettings } = useLayout();
    const showValues = settings.privacy.showValues;

    const toggle = () => {
        setSettings(prev => ({
            ...prev,
            privacy: { ...prev.privacy, showValues: !prev.privacy.showValues }
        }));
    };

    return (
        <button
            onClick={toggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            title={showValues ? "Ocultar Valores" : "Mostrar Valores"}
        >
            {showValues ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            )}
        </button>
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
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-800 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-700/50">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minha Conta</span>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                        <a
                            href="/profile"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            Perfil
                        </a>

                        <button
                            onClick={() => {
                                setOpen(false);
                                window.dispatchEvent(new CustomEvent("open-settings"));
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 group-hover:rotate-45 transition-transform">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </div>
                            Ajustes
                        </button>

                        <a
                            href="/help"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            </div>
                            Ajuda
                        </a>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />

                    <div className="p-1.5">
                        <form action="/auth/logout" method="post">
                            <button
                                type="submit"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all group"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                </div>
                                Sair
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export function SettingsDrawer() {
    const [open, setOpen] = useState(false);
    const { settings, setSettings } = useLayout();

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener("open-settings", handler);
        return () => window.removeEventListener("open-settings", handler);
    }, []);

    if (!open) return null;

    const updateHeader = (updates: Partial<typeof settings.header>) => setSettings(prev => ({ ...prev, header: { ...prev.header, ...updates } }));
    const updateNav = (updates: Partial<typeof settings.nav>) => setSettings(prev => ({ ...prev, nav: { ...prev.nav, ...updates } }));
    const updateFooter = (updates: Partial<typeof settings.footer>) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, ...updates } }));
    const updateTheme = (updates: Partial<typeof settings.theme>) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, ...updates } }));

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div
                className="relative w-80 h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h2>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                    {/* ESTILO DO TEMA */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Estilo do Tema</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'default', label: 'Padrão' },
                                { id: 'light', label: 'Luz' },
                                { id: 'dark', label: 'Escuro' },
                                { id: 'flat', label: 'Plano' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => updateTheme({ style: mode.id as any })}
                                    className={`py-3 text-[10px] font-bold uppercase rounded-xl border transition-all ${settings.theme.style === mode.id ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm' : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* BARRA DE FERRAMENTAS */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Barra de Ferramentas</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visível</span>
                                <div onClick={() => updateHeader({ visible: !settings.header.visible })} className={`w-11 h-6 rounded-full transition-colors relative ${settings.header.visible ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.header.visible ? 'left-6' : 'left-1'}`} />
                                </div>
                            </label>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Posição</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {['sticky', 'fixed', 'static'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => updateHeader({ position: pos as any })}
                                            className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${settings.header.position === pos ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 text-gray-400'}`}
                                        >
                                            {pos === 'sticky' ? 'Fixo' : pos === 'fixed' ? 'Sempre' : 'Base'}
                                        </button>
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
                                <div onClick={() => updateNav({ open: !settings.nav.open })} className={`w-11 h-6 rounded-full transition-colors relative ${settings.nav.open ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.nav.open ? 'left-6' : 'left-1'}`} />
                                </div>
                            </label>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Posição</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => updateNav({ position: 'top' })} className={`py-3 flex flex-col items-center gap-1 rounded-xl border transition-all ${settings.nav.position === 'top' ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm' : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 text-gray-400 hover:bg-gray-50'}`}>
                                        <div className="w-8 h-0.5 bg-current opacity-30 rounded-full" />
                                        <span className="text-[10px] font-bold uppercase">Topo</span>
                                    </button>
                                    <button onClick={() => updateNav({ position: 'side' })} className={`py-3 flex items-center gap-2 justify-center rounded-xl border transition-all ${settings.nav.position === 'side' ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm' : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 text-gray-400 hover:bg-gray-50'}`}>
                                        <div className="w-0.5 h-6 bg-current opacity-30 rounded-full" />
                                        <span className="text-[10px] font-bold uppercase">Lado</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block">Opções</span>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div onClick={() => updateNav({ collapsed: !settings.nav.collapsed })} className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${settings.nav.collapsed ? 'bg-teal-500 border-teal-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-teal-400'}`}>
                                        {settings.nav.collapsed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Recolher Menu (Desmoronou)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div onClick={() => updateNav({ showUserPanel: !settings.nav.showUserPanel })} className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${settings.nav.showUserPanel ? 'bg-teal-500 border-teal-500 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-teal-400'}`}>
                                        {settings.nav.showUserPanel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Exibir Painel do Usuário</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* RODAPÉ */}
                    <section>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Rodapé</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visível</span>
                                <div onClick={() => updateFooter({ visible: !settings.footer.visible })} className={`w-11 h-6 rounded-full transition-colors relative ${settings.footer.visible ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.footer.visible ? 'left-6' : 'left-1'}`} />
                                </div>
                            </label>

                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 block">Posição</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {['sticky', 'static'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => updateFooter({ position: pos as any })}
                                            className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${settings.footer.position === pos ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 text-gray-400'}`}
                                        >
                                            {pos === 'sticky' ? 'Fixo' : 'Base'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer buttons */}
                <div className="p-6 border-t border-black/5 dark:border-white/5 space-y-3">
                    <button
                        onClick={() => setSettings(prev => ({
                            ...prev,
                            header: { ...prev.header, visible: true, position: 'fixed' },
                            nav: { ...prev.nav, open: true, position: 'side', collapsed: false, showUserPanel: true },
                            footer: { ...prev.footer, visible: true, position: 'static' },
                            theme: { style: 'default' }
                        }))}
                        className="w-full py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity"
                    >
                        Redefinir Padrões
                    </button>
                </div>
            </div>
        </div>
    );
}
