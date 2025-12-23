"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { useLayout } from "./LayoutContext";
import SidebarMenu from "./SidebarMenu";
import SidebarCollapse from "./SidebarCollapse";
import { DateDisplay, FullscreenToggle, NotificationBell, PrivacyToggle, SettingsDrawer, ThemeToggle, UserDropdown } from "./HeaderComponents";

interface AppLayoutProps {
    children: ReactNode;
    hasSession: boolean;
    logoSymbolSrc: string;
    logoHeaderSrc: string;
    displayName: string;
    avatar: string;
    userEmail?: string;
    version: string;
}

export function AppLayout({
    children,
    hasSession,
    logoSymbolSrc,
    logoHeaderSrc,
    displayName,
    avatar: avatarUrl,
    userEmail,
    version
}: AppLayoutProps) {
    const { settings } = useLayout();
    const isTopNav = hasSession && settings.nav.open && settings.nav.position === 'top';
    const isSideNav = hasSession && settings.nav.open && settings.nav.position === 'side';
    const isFlat = settings.theme.style === 'flat';
    const isLightSidebar = settings.theme.style === 'light' || isFlat;

    // Header position logic
    const headerPosClass = settings.header.position === 'fixed' ? 'fixed top-0 right-0 left-0 z-40' :
        settings.header.position === 'sticky' ? 'sticky top-0 z-40' : 'relative';

    // Footer position logic
    const footerPosClass = settings.footer.position === 'fixed' ? 'fixed bottom-0 right-0 left-0 z-40' : 'relative';

    const sidebarWidth = settings.nav.collapsed ? "w-16" : "w-64";
    const mainMargin = isSideNav ? (settings.nav.collapsed ? "ml-16" : "ml-64") : "ml-0";
    const headerPadding = isSideNav ? (settings.nav.collapsed ? "pl-16" : "pl-64") : "pl-0";

    const sidebarBg = isLightSidebar ? "bg-white border-r border-black/5" : "bg-[#1a2234] text-white";
    const sidebarText = isLightSidebar ? "text-gray-900" : "text-white";
    const sidebarBorder = isLightSidebar ? "border-black/5" : "border-white/5";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
            {/* Header */}
            {hasSession && settings.header.visible && (
                <header
                    className={`${headerBase} ${headerPosClass} flex items-center justify-between px-6 py-2 transition-all duration-300 ${headerPadding} ${isFlat ? 'shadow-none border-b-gray-100 dark:border-b-gray-800' : 'shadow-sm'}`}
                >
                    <div className="flex items-center gap-4">
                        {isTopNav && (
                            <div className="flex items-center gap-2 mr-6 border-r border-black/5 dark:border-white/5 pr-6">
                                <img src={logoSymbolSrc} alt="Logo" className="h-8 w-8" />
                                <span className="text-xl font-black text-brand-blue-600 dark:text-brand-blue-400 tracking-tighter">FOURTEK</span>
                            </div>
                        )}
                        <DateDisplay />
                    </div>

                    <div className="flex items-center gap-2">
                        <FullscreenToggle />
                        <NotificationBell count={3} />
                        <div className="w-px h-6 bg-black/5 dark:bg-white/5 mx-2" />
                        <PrivacyToggle />
                        <ThemeToggle />
                        <UserDropdown displayName={displayName} avatarUrl={avatarUrl} />
                    </div>
                </header>
            )}

            {/* Navigation (Top) */}
            {isTopNav && (
                <nav className={`${settings.header.position === 'fixed' ? 'fixed top-[52px]' : 'sticky top-0'} left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-black/5 dark:border-white/5 px-6 transition-all ${isFlat ? 'shadow-none' : 'shadow-sm'}`}>
                    <SidebarMenu horizontal={true} />
                </nav>
            )}

            {/* Sidebar */}
            {isSideNav && (
                <aside
                    className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 overflow-hidden ${sidebarBg} ${sidebarWidth} ${isFlat ? 'shadow-none' : 'shadow-2xl'}`}
                >
                    {/* Sidebar Logo */}
                    <div className={`h-[52px] flex items-center justify-center px-4 border-b shrink-0 overflow-hidden ${sidebarBorder}`}>
                        {settings.nav.collapsed ? (
                            <img src={logoSymbolSrc} alt="Logo" className="h-8 min-w-[32px] mx-auto" />
                        ) : (
                            isLightSidebar ? (
                                <div className="flex items-center gap-2">
                                    <img src={logoSymbolSrc} alt="Logo" className="h-8 w-8" />
                                    <span className="text-xl font-black tracking-tighter text-brand-blue-600">FOURTEK</span>
                                </div>
                            ) : (
                                <img src="/fourtek-logo-white.png" alt="FourTek" className="h-8 object-contain" />
                            )
                        )}
                    </div>

                    {/* User Panel (Sidebar only) */}
                    {settings.nav.showUserPanel && (
                        <div className={`p-4 border-b flex flex-col items-center transition-all duration-300 ${sidebarBorder} ${settings.nav.collapsed ? 'px-2' : 'p-6'}`}>
                            <div className="relative group">
                                <div className={`rounded-full border-[3px] p-0.5 transition-all group-hover:border-brand-green-400 ${isLightSidebar ? 'border-white bg-white shadow-sm' : 'border-white/20'} ${settings.nav.collapsed ? 'h-10 w-10' : 'h-20 w-20'}`}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <div className={`h-full w-full rounded-full flex items-center justify-center ${isLightSidebar ? 'bg-black/5 text-gray-400' : 'bg-white/5 text-white/40'}`}>
                                            <span className={settings.nav.collapsed ? "text-xs" : "text-xl"}>{displayName ? displayName[0].toUpperCase() : "U"}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute bottom-1 right-1 h-3.5 w-3.5 bg-brand-green-500 border-2 rounded-full ${isLightSidebar ? 'border-white' : 'border-[#1a2234]'}`} />
                            </div>

                            {!settings.nav.collapsed && (
                                <div className="mt-4 text-center w-full">
                                    <p className={`text-sm font-bold truncate px-2 ${isLightSidebar ? 'text-gray-900' : 'text-white'}`}>{displayName}</p>
                                    <p className={`text-[10px] truncate px-2 ${isLightSidebar ? 'text-gray-500' : 'text-white/40'}`}>{userEmail}</p>

                                    {/* Shortcuts */}
                                    <div className="flex items-center justify-center gap-3 mt-4">
                                        <Link href="/dashboard" className={`p-2 rounded-lg transition-colors group/tool ${isLightSidebar ? 'bg-transparent hover:bg-black/5' : 'bg-transparent hover:bg-white/10'}`} title="Dashboard">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isLightSidebar ? 'text-gray-400 group-hover/tool:text-brand-blue-600' : 'text-white/40 group-hover/tool:text-brand-green-400'}`}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        </Link>
                                        <Link href="/clients" className={`p-2 rounded-lg transition-colors group/tool ${isLightSidebar ? 'bg-transparent hover:bg-black/5' : 'bg-transparent hover:bg-white/10'}`} title="Clientes">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isLightSidebar ? 'text-gray-400 group-hover/tool:text-brand-blue-600' : 'text-white/40 group-hover/tool:text-brand-green-400'}`}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </Link>
                                        <button onClick={() => window.dispatchEvent(new CustomEvent("open-settings"))} className={`p-2 rounded-lg transition-colors group/tool ${isLightSidebar ? 'bg-transparent hover:bg-black/5' : 'bg-transparent hover:bg-white/10'}`} title="Configurações">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isLightSidebar ? 'text-gray-400 group-hover/tool:text-brand-blue-600' : 'text-white/40 group-hover/tool:text-brand-green-400'}`}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                        </button>
                                        <form action="/auth/logout" method="post">
                                            <button type="submit" className={`p-2 rounded-lg transition-colors group/tool ${isLightSidebar ? 'bg-transparent hover:bg-black/5' : 'bg-transparent hover:bg-white/10'}`} title="Sair">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isLightSidebar ? 'text-gray-400 group-hover/tool:text-red-500' : 'text-white/40 group-hover/tool:text-red-400'}`}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sidebar Menu */}
                    <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
                        <SidebarMenu />
                    </div>

                    <div className={`p-4 border-t ${sidebarBorder}`}>
                        <SidebarCollapse />
                    </div>
                </aside>
            )
            }

            {/* Main Content */}
            <main
                className={`flex-1 flex flex-col transition-all duration-300 ${mainMargin} ${!settings.header.visible ? "mt-0" : ""} ${isTopNav && settings.header.visible ? (settings.header.position === 'fixed' ? 'pt-[92px]' : '') : (hasSession && settings.header.visible && settings.header.position === 'fixed' ? 'pt-[52px]' : '')}`}
            >
                <div className={`flex-1 p-6 ${isFlat ? 'p-8' : ''}`}>
                    {children}
                </div>

                {/* Footer */}
                {hasSession && settings.footer.visible && (
                    <footer
                        className={`${footerBase} ${footerPosClass} transition-all z-30 ${headerPadding} ${isFlat ? 'shadow-none' : 'shadow-inner'}`}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>&copy; {new Date().getFullYear()} Fourtek Systems. Todos os direitos reservados.</div>
                            <div className="flex items-center gap-4">
                                <span className="">Versão {version}</span>
                                <div className="flex items-center gap-6">
                                    <Link href="/privacy" className="hover:text-brand-blue-600 transition-colors">Privacidade</Link>
                                    <Link href="/terms" className="hover:text-brand-blue-600 transition-colors">Termos</Link>
                                    <Link href="/support" className="hover:text-brand-blue-600 transition-colors">Suporte</Link>
                                </div>
                            </div>
                        </div>
                    </footer>
                )}
            </main>

            <SettingsDrawer />
        </div >
    );
}

const headerBase = "border-b border-black/10 dark:border-white/10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transition-all duration-300";
const footerBase = "p-4 text-xs text-gray-400 border-t border-black/5 dark:border-white/5 bg-white dark:bg-gray-800 transition-all duration-300";
