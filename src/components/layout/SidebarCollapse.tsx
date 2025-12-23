import { useLayout } from "./LayoutContext";

export default function SidebarCollapse() {
  const { settings, setSettings } = useLayout();
  const collapsed = settings.nav.collapsed;

  function toggle() {
    setSettings(prev => ({
      ...prev,
      nav: { ...prev.nav, collapsed: !collapsed }
    }));
  }

  const isLightSidebar = settings.theme.style === 'light' || settings.theme.style === 'flat';

  return (
    <button
      onClick={toggle}
      title={collapsed ? "Expandir" : "Recolher"}
      aria-label="Collapse sidebar"
      className={`w-full flex items-center justify-center rounded-lg py-2 transition-all ${isLightSidebar ? 'text-gray-400 hover:text-brand-blue-600 hover:bg-black/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
      {collapsed ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      )}
    </button>
  );
}
