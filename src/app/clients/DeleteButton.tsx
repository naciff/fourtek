"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  async function doDelete() {
    setLoading(true);
    const { error } = await supabase.from("clients").delete().eq("id", id);
    setLoading(false);
    setConfirming(false);
    if (!error) router.refresh();
  }
  return (
    <div className="inline-flex items-center gap-2">
      <button title="Excluir" aria-label="Excluir" onClick={()=> setConfirming(true)} className="text-gray-600" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12l-1 14H7L6 7z"/><path d="M9 4h6l1 2H8l1-2z"/></svg>
      </button>
      {confirming && (
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-gray-700">Confirmar exclusão?</span>
          <button type="button" onClick={doDelete} disabled={loading} className="rounded bg-red-600 px-2 py-1 text-white text-xs">Excluir</button>
          <button type="button" onClick={()=> setConfirming(false)} className="rounded border px-2 py-1 text-xs">Cancelar</button>
        </div>
      )}
    </div>
  );
}