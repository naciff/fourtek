"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, ReactNode, useEffect } from "react";

function CollapsibleSection({ title, icon, children, activePaths = [] }: { title: string, icon: ReactNode, children: ReactNode, activePaths?: string[] }) {
  const pathname = usePathname();
  // Auto-open if any child is active
  const isChildActive = activePaths.some(path => pathname?.startsWith(path));
  const [isOpen, setIsOpen] = useState(isChildActive);

  // Update open state when pathname changes to ensure active section is visible
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [pathname, isChildActive]);

  return (
    <div className="grid gap-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="link flex items-center justify-between px-2 w-full text-left py-1 mt-2 hover:bg-black/5 rounded-md transition-colors group"
      >
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-[16px]">
          {icon}
          <span className="label hidden md:inline">{title}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`sidebar-arrow hidden md:block transition-transform duration-200 text-gray-400 group-hover:text-gray-600 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div className={`grid gap-1 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

export default function SidebarMenu() {
  const pathname = usePathname();
  const isActive = (href: string) => Boolean(pathname && pathname.startsWith(href));

  const itemCls = (active: boolean) =>
    `group link flex items-center gap-2 rounded-md px-2 py-2 text-[14px] ${active ? "bg-[#36a78b] text-white" : "text-gray-700 hover:bg-black/5"
    }`;

  const iconCls = (active: boolean) =>
    `h-4 w-4 ${active ? "text-white" : "text-gray-600 group-hover:text-gray-800"}`;

  return (
    <div className="flex-1 px-2 py-1 grid gap-2 overflow-y-auto">
      <div className="px-2 text-[16px] font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span className="label hidden md:inline">Menu Principal</span>
      </div>
      <nav className="grid gap-1 mb-2">
        <Link href="/dashboard" className={itemCls(isActive("/dashboard"))} aria-current={isActive("/dashboard") ? "page" : undefined}>
          <svg className={iconCls(isActive("/dashboard"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Dashboard</span>
        </Link>
        <Link href="/clients" className={itemCls(isActive("/clients"))} aria-current={isActive("/clients") ? "page" : undefined}>
          <svg className={iconCls(isActive("/clients"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-1.657-2.686-3-8-3z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Clientes</span>
        </Link>
      </nav>

      <CollapsibleSection
        title="Cadastro"
        activePaths={["/contracts", "/representatives"]}
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>}
      >
        <Link href="/contracts" className={itemCls(isActive("/contracts"))} aria-current={isActive("/contracts") ? "page" : undefined}>
          <svg className={iconCls(isActive("/contracts"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 7h5l-5-5v5z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Contratos</span>
        </Link>
        <Link href="/representatives" className={itemCls(isActive("/representatives"))} aria-current={isActive("/representatives") ? "page" : undefined}>
          <svg className={iconCls(isActive("/representatives"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 11c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm-8 0c2.761 0 5-2.239 5-5S10.761 1 8 1 3 3.239 3 6s2.239 5 5 5zm0 2c-3.314 0-6 1.343-6 3v3h10v-3c0-1.657-2.686-3-6-3zm8 0c-1.098 0-2.131.142-3 .391 1.815.762 3 1.935 3 3.609V19h8v-3c0-1.657-2.686-3-8-3z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Representantes</span>
        </Link>
      </CollapsibleSection>

      <CollapsibleSection
        title="Relatórios"
        activePaths={["/reports"]}
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>}
      >
        <Link href="/reports/clientes-por-valores" className={itemCls(isActive("/reports/clientes-por-valores"))} aria-current={isActive("/reports/clientes-por-valores") ? "page" : undefined}>
          <svg className={iconCls(isActive("/reports/clientes-por-valores"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v10h2V7H7zm4 6v4h2v-4h-2zm4-8v12h2V5h-2z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Clientes por Valores</span>
        </Link>
        <Link href="/reports/services" className={itemCls(isActive("/reports/services"))} aria-current={isActive("/reports/services") ? "page" : undefined}>
          <svg className={iconCls(isActive("/reports/services"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v2H3V3zm0 6h18v2H3V9zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Lista de Serviços</span>
        </Link>
        <Link href="/reports/respondentes" className={itemCls(isActive("/reports/respondentes"))} aria-current={isActive("/reports/respondentes") ? "page" : undefined}>
          <svg className={iconCls(isActive("/reports/respondentes"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-6 1.343-6 3v3h10v-3c0-1.657-2.686-3-6-3z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Respondentes (Interino)</span>
        </Link>
      </CollapsibleSection>

      <CollapsibleSection
        title="Administrativo"
        activePaths={["/administrativo", "/empresa"]}
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
      >
        <Link href="/administrativo/colaboradores" className={itemCls(isActive("/administrativo/colaboradores"))}>
          <svg className={iconCls(isActive("/administrativo/colaboradores"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 7v-1c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Colaboradores</span>
        </Link>
        <Link href="/administrativo/diretoria" className={itemCls(isActive("/administrativo/diretoria"))}>
          <svg className={iconCls(isActive("/administrativo/diretoria"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 4h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 4h4V6h-4v2z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Diretoria</span>
        </Link>
        <Link href="/empresa" className={itemCls(isActive("/empresa"))}>
          <svg className={iconCls(isActive("/empresa"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v6H4V4zm0 8h16v8H4v-8z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Empresa</span>
        </Link>
        <Link href="/administrativo/fornecedores" className={itemCls(isActive("/administrativo/fornecedores"))}>
          <svg className={iconCls(isActive("/administrativo/fornecedores"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v4H4V6zm0 6h16v6H4v-6z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Fornecedores</span>
        </Link>
        <Link href="/administrativo/gestao" className={itemCls(isActive("/administrativo/gestao"))}>
          <svg className={iconCls(isActive("/administrativo/gestao"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 3v2h8V7H8zm0 4v2h10v-2H8zm0 4v2h6v-2H8z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Gestão</span>
        </Link>
        <Link href="/administrativo/inventario" className={itemCls(isActive("/administrativo/inventario"))}>
          <svg className={iconCls(isActive("/administrativo/inventario"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Inventário</span>
        </Link>
        <Link href="/administrativo/parceiros" className={itemCls(isActive("/administrativo/parceiros"))}>
          <svg className={iconCls(isActive("/administrativo/parceiros"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 7a3 3 0 1 1 6 0v1h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h4V7z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Parceiros</span>
        </Link>
      </CollapsibleSection>

      <CollapsibleSection
        title="Configurações"
        activePaths={["/settings"]}
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
      >
        <Link href="/settings/users" className={itemCls(isActive("/settings/users"))} aria-current={isActive("/settings/users") ? "page" : undefined}>
          <svg className={iconCls(isActive("/settings/users"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm10 4a2 2 0 0 0-2-2h-1.09a7.963 7.963 0 0 0-1.5-2.587l.772-.772a2 2 0 1 0-2.828-2.828l-.772.772A7.963 7.963 0 0 0 14 5.09V4a2 2 0 1 0-4 0v1.09a7.963 7.963 0 0 0-2.587 1.5l-.772-.772a2 2 0 1 0-2.828 2.828l.772.772A7.963 7.963 0 0 0 5.09 10H4a2 2 0 1 0 0 4h1.09a7.963 7.963 0 0 0 1.5 2.587l-.772.772a2 2 0 1 0 2.828 2.828l.772-.772A7.963 7.963 0 0 0 10 18.91V20a2 2 0 1 0 4 0v-1.09a7.963 7.963 0 0 0 2.587-1.5l.772.772a2 2 0 1 0 2.828-2.828l-.772-.772A7.963 7.963 0 0 0 18.91 14H20a2 2 0 0 0 2-2z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Cadastro de Usuários</span>
        </Link>
        <Link href="/settings/integrations" className={itemCls(isActive("/settings/integrations"))} aria-current={isActive("/settings/integrations") ? "page" : undefined}>
          <svg className={iconCls(isActive("/settings/integrations"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 2a2 2 0 0 1 2 2v2h4V4a2 2 0 1 1 4 0v4a2 2 0 0 1-2 2h-2v4h2a2 2 0 1 1 0 4h-4a2 2 0 0 1-2-2v-2H10v2a2 2 0 1 1-4 0v-4a2 2 0 0 1 2-2h2V8H8A2 2 0 1 1 8 2z" fill="currentColor" /></svg>
          <span className="label hidden md:inline">Integrações</span>
        </Link>
      </CollapsibleSection>

    </div>
  );
}
