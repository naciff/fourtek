"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ContractFileActions({ clientId, currentUrl }: { clientId: string; currentUrl?: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "pdf";
    const path = `contracts/${clientId}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("files").upload(path, file, { upsert: true });
    if (up.error) { setUploading(false); return; }
    const pub = supabase.storage.from("files").getPublicUrl(path);
    await supabase.from("clients").update({ contract_image_url: pub.data.publicUrl }).eq("id", clientId);
    setUploading(false);
    router.refresh();
  }

  function triggerUpload() {
    inputRef.current?.click();
  }

  function download() {
    if (!currentUrl) return;
    window.open(currentUrl, "_blank");
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input ref={inputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={onFileChange} />
      <button type="button" title="Upload contrato" aria-label="Upload" onClick={triggerUpload} className="text-gray-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l4 4h-3v6h-2V7H8l4-4z"/><path d="M5 19h14v2H5z"/></svg>
      </button>
      <button type="button" title="Download contrato" aria-label="Download" onClick={download} disabled={!currentUrl} className={`text-gray-600 ${!currentUrl?"opacity-50 cursor-not-allowed":""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-4-4h3V5h2v12h3l-4 4z"/><path d="M5 3h14v2H5z"/></svg>
      </button>
      {uploading && <span className="text-xs text-gray-500">Enviando...</span>}
    </div>
  );
}