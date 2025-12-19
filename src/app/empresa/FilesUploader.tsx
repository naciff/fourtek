"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function FilesUploader({ empresaId, chavePixImagem, contratoSocial, imagemCNPJ }: { empresaId: string, chavePixImagem?: string, contratoSocial?: string, imagemCNPJ?: string }) {
  const supabase = supabaseBrowser();
  const [pixImg, setPixImg] = useState<string>(String(chavePixImagem || ""));
  const [contrato, setContrato] = useState<string>(String(contratoSocial || ""));
  const [cnpjImg, setCnpjImg] = useState<string>(String(imagemCNPJ || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(field: "chave_pix_imagem" | "contrato_social" | "imagem_cnpj", file: File) {
    setError(null);
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id || "anon";
      const prefix = field === "contrato_social" ? "contratos" : "empresa";
      const path = `${uid}/${prefix}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("files").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("files").getPublicUrl(path);
      const url = data.publicUrl;
      const { error: updErr } = await supabase.from("company").update({ [field]: url }).eq("id", empresaId);
      if (updErr) throw updErr;
      if (field === "chave_pix_imagem") setPixImg(url);
      if (field === "contrato_social") setContrato(url);
      if (field === "imagem_cnpj") setCnpjImg(url);
    } catch (e: any) {
      setError(e?.message || "Falha no upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="grid gap-2">
          <span className="text-sm text-gray-700">Chave PIX Imagem</span>
          <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) handleUpload("chave_pix_imagem", f); }} disabled={loading} />
          {pixImg ? <img src={pixImg} alt="Chave PIX" className="h-24 rounded border" /> : null}
        </div>
        <div className="grid gap-2">
          <span className="text-sm text-gray-700">Imagem CNPJ</span>
          <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) handleUpload("imagem_cnpj", f); }} disabled={loading} />
          {cnpjImg ? <img src={cnpjImg} alt="CNPJ" className="h-24 rounded border" /> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <span className="text-sm text-gray-700">Contrato Social</span>
        <input type="file" accept="application/pdf,image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) handleUpload("contrato_social", f); }} disabled={loading} />
        {contrato ? <a href={contrato} target="_blank" rel="noopener noreferrer" className="text-brand-blue-700 text-sm">Abrir arquivo</a> : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}