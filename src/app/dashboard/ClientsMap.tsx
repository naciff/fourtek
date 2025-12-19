"use client";
import { useEffect, useRef } from "react";

export default function ClientsMap({ points }: { points: Array<{ id: string; name?: string; address?: string; lat?: number; lng?: number }> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      if (ref.current) {
        ref.current.innerHTML = `<div style="padding:12px;color:#374151;font-size:13px">Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para exibir o mapa interativo.</div>`;
      }
      return;
    }
    function load() {
      const scriptId = "gmaps-loader";
      if (!document.getElementById(scriptId)) {
        const s = document.createElement("script");
        s.id = scriptId;
        s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        s.async = true;
        document.body.appendChild(s);
        s.onload = init;
      } else {
        init();
      }
    }
    function init() {
      if (!ref.current || !(window as any).google?.maps) return;
      const center = { lat: -14.2350, lng: -51.9253 };
      const map = new (window as any).google.maps.Map(ref.current, {
        center,
        zoom: 4,
        mapTypeControl: true,
      });
      points.filter(p=> typeof p.lat === "number" && typeof p.lng === "number").forEach(p => {
        const marker = new (window as any).google.maps.Marker({ position: { lat: p.lat!, lng: p.lng! }, map });
        const content = `<div style="font-size:12px;line-height:1.4"><div style="font-weight:600">${p.name || "Cliente"}</div><div>${p.address || ""}</div><div style="margin-top:4px"><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(p.lat)+","+String(p.lng))}">Abrir no Google Maps</a></div></div>`;
        const infowin = new (window as any).google.maps.InfoWindow({ content });
        marker.addListener("click", () => infowin.open({ anchor: marker, map }));
      });
    }
    load();
  }, [points]);
  return <div ref={ref} className="w-full h-[420px] rounded-lg border" />;
}