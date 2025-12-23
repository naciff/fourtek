import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, ReactNode, useEffect } from "react";
import { useLayout } from "./LayoutContext";

function CollapsibleSection({ title, icon, children, activePaths = [], horizontal = false }: { title: string, icon: ReactNode, children: ReactNode, activePaths?: string[], horizontal?: boolean }) {
  const pathname = usePathname();
  const { settings } = useLayout();
  const collapsed = settings.nav.collapsed && settings.nav.position === 'side' && !horizontal;
  const isFlat = settings.theme.style === 'flat';
  const isLightSidebar = !horizontal && (settings.theme.style === 'light' || isFlat);

  const isChildActive = activePaths.some(path => pathname?.startsWith(path));
  const [isOpen, setIsOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [pathname, isChildActive]);

  if (horizontal) {
    return (
      <div className="relative group">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
          {icon}
          <span>{title}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div className={`absolute left-0 top-full hidden group-hover:block w-48 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-lg p-1 z-[60] ${isFlat ? 'shadow-none' : 'shadow-xl'}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      <button
        onClick={() => !collapsed && setIsOpen(!isOpen)}
        className={`link flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 w-full text-left py-1 mt-2 rounded-md transition-colors group ${isLightSidebar ? 'text-gray-600 hover:bg-black/5 hover:text-gray-900' : 'text-gray-100 hover:bg-white/10 hover:text-white'}`}
      >
        <div className="flex items-center gap-2 font-bold text-[14px]">
          <div className={isLightSidebar ? (isOpen ? 'text-[#36a78b]' : 'text-gray-400 group-hover:text-gray-900') : (isOpen ? 'text-[#36a78b]' : 'text-white group-hover:text-white')}>
            {icon}
          </div>
          {!collapsed && <span className="label">{title}</span>}
        </div>
        {!collapsed && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isLightSidebar ? 'text-gray-300' : 'text-white'} group-hover:text-current ${isOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        )}
      </button>
      {!collapsed && (
        <div className={`grid gap-1 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function SidebarMenu({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();
  const { settings } = useLayout();
  const isActive = (href: string) => Boolean(pathname && pathname.startsWith(href));
  const collapsed = settings.nav.collapsed && settings.nav.position === 'side' && !horizontal;
  const isLightSidebar = !horizontal && (settings.theme.style === 'light' || settings.theme.style === 'flat');

  const itemCls = (active: boolean) => {
    const base = `group link flex items-center ${collapsed ? 'justify-center' : 'gap-2'} rounded-md px-2 py-2 text-[14px] transition-all`;
    const activeCls = "bg-[#36a78b] text-white shadow-sm";

    if (active) return `${base} ${activeCls}`;

    if (isLightSidebar) {
      return `${base} text-gray-600 hover:bg-black/5 hover:text-gray-900`;
    }

    return `${base} text-gray-100 hover:bg-white/10 hover:text-white`;
  };

  const iconCls = (active: boolean) => {
    if (active) return "h-4 w-4 text-white";
    if (isLightSidebar) return "h-4 w-4 text-gray-400 group-hover:text-gray-900";
    return "h-4 w-4 text-white group-hover:text-white";
  };

  return (
    <div className={`${horizontal ? 'flex flex-row items-center gap-2' : 'flex-1 px-2 py-1 flex flex-col gap-2'}`}>
      {!horizontal && !collapsed && (
        <div className={`px-2 text-[10px] uppercase tracking-widest font-bold mb-1 flex items-center gap-2 ${isLightSidebar ? 'text-gray-400' : 'text-white'}`}>
          <span className="label">Menu Principal</span>
        </div>
      )}
      <nav className={`${horizontal ? 'flex flex-row gap-1' : 'flex flex-col gap-1 mb-2'}`}>
        <Link href="/dashboard" className={itemCls(isActive("/dashboard"))} title={collapsed ? "Dashboard" : ""}>
          <svg className={iconCls(isActive("/dashboard"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" /></svg>
          {!collapsed && <span className={horizontal ? "" : "label"}>Dashboard</span>}
        </Link>
        <Link href="/clients" className={itemCls(isActive("/clients"))} title={collapsed ? "Clientes" : ""}>
          <svg className={iconCls(isActive("/clients"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-1.657-2.686-3-8-3z" fill="currentColor" /></svg>
          {!collapsed && <span className={horizontal ? "" : "label"}>Clientes</span>}
        </Link>
      </nav>

      <CollapsibleSection
        horizontal={horizontal}
        title="Cadastro"
        activePaths={["/contracts", "/representatives"]}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>}
      >
        <Link href="/contracts" className={itemCls(isActive("/contracts"))}>
          <svg className={iconCls(isActive("/contracts"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 7h5l-5-5v5z" fill="currentColor" /></svg>
          <span>Contratos</span>
        </Link>
        <Link href="/representatives" className={itemCls(isActive("/representatives"))}>
          <svg className={iconCls(isActive("/representatives"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 11c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm-8 0c2.761 0 5-2.239 5-5S10.761 1 8 1 3 3.239 3 6s2.239 5 5 5zm0 2c-3.314 0-6 1.343-6 3v3h10v-3c0-1.657-2.686-3-6-3zm8 0c-1.098 0-2.131.142-3 .391 1.815.762 3 1.935 3 3.609V19h8v-3c0-1.657-2.686-3-8-3z" fill="currentColor" /></svg>
          <span>Representantes</span>
        </Link>
      </CollapsibleSection>

      <CollapsibleSection
        horizontal={horizontal}
        title="Relatórios"
        activePaths={["/reports"]}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>}
      >
        <Link href="/reports/clientes-por-valores" className={itemCls(isActive("/reports/clientes-por-valores"))}>
          <svg className={iconCls(isActive("/reports/clientes-por-valores"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v10h2V7H7zm4 6v4h2v-4h-2zm4-8v12h2V5h-2z" fill="currentColor" /></svg>
          <span>Clientes por Valores</span>
        </Link>
        <Link href="/reports/services" className={itemCls(isActive("/reports/services"))}>
          <svg className={iconCls(isActive("/reports/services"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v2H3V3zm0 6h18v2H3V9zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" fill="currentColor" /></svg>
          <span>Lista de Serviços</span>
        </Link>
        <Link href="/reports/respondentes" className={itemCls(isActive("/reports/respondentes"))}>
          <svg className={iconCls(isActive("/reports/respondentes"))} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-6 1.343-6 3v3h10v-3c0-1.657-2.686-3-6-3z" fill="currentColor" /></svg>
          <span>Respondentes</span>
        </Link>
      </CollapsibleSection>

      <CollapsibleSection
        horizontal={horizontal}
        title="Administrativo"
        activePaths={["/administrativo", "/empresa"]}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
      >
        <Link href="/administrativo/colaboradores" className={itemCls(isActive("/administrativo/colaboradores"))}>
          <span>Colaboradores</span>
        </Link>
        <Link href="/administrativo/diretoria" className={itemCls(isActive("/administrativo/diretoria"))}>
          <span>Diretoria</span>
        </Link>
        <Link href="/empresa" className={itemCls(isActive("/empresa"))}>
          <span>Empresa</span>
        </Link>
        <Link href="/administrativo/fornecedores" className={itemCls(isActive("/administrativo/fornecedores"))}>
          <span>Fornecedores</span>
        </Link>
        <Link href="/administrativo/gestao" className={itemCls(isActive("/administrativo/gestao"))}>
          <span>Gestão</span>
        </Link>
        <Link href="/administrativo/inventario" className={itemCls(isActive("/administrativo/inventario"))}>
          <span>Inventário</span>
        </Link>
        <Link href="/administrativo/parceiros" className={itemCls(isActive("/administrativo/parceiros"))}>
          <span>Parceiros</span>
        </Link>
      </CollapsibleSection>

      <CollapsibleSection
        horizontal={horizontal}
        title="Configurações"
        activePaths={["/settings"]}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a 1.65 1.65 0 0 0 -1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
      >
        <Link href="/settings/users" className={itemCls(isActive("/settings/users"))}>
          <span>Usuários</span>
        </Link>
        <Link href="/settings/integrations" className={itemCls(isActive("/settings/integrations"))}>
          <span>Integrações</span>
        </Link>
      </CollapsibleSection>
    </div>
  );
}
