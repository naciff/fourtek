"use client";
import { useEffect, useState } from "react";

export default function SidebarCollapse() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    const isCollapsed = saved === "true";
    setCollapsed(isCollapsed);
    document.body.dataset.sidebar = isCollapsed ? "collapsed" : "expanded";
  }, []);
  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
    document.body.dataset.sidebar = next ? "collapsed" : "expanded";
  }
  return (
    <button onClick={toggle} title={collapsed ? "Expandir" : "Recolher"} aria-label="Collapse sidebar" className="rounded-md bg-black/5 hover:bg-black/10 text-gray-800 px-2 py-1 text-base font-semibold">
      {"\u2630"}
    </button>
  );
}
