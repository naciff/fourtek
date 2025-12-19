"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function AvatarUploader() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    })();
  }, []);

  const displayName = String(
    user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email || ""
  );
  const avatar = String(
    user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      user?.user_metadata?.avatar ||
      user?.user_metadata?.image || ""
  );

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError(null);
    setUploading(true);
    try {
      const uid = user.id;
      const path = `${uid}/avatars/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("files").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("files").getPublicUrl(path);
      const url = data.publicUrl;
      const { error: updErr } = await supabase.auth.updateUser({ data: { avatar_url: url } });
      if (updErr) throw updErr;
      setUser((u: any) => ({ ...u, user_metadata: { ...(u?.user_metadata || {}), avatar_url: url } }));
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    if (!user) return;
    setError(null);
    setUploading(true);
    try {
      const url = avatar;
      if (url) {
        const m = url.match(/\/storage\/v1\/object\/public\/files\/(.+)$/);
        if (m) {
          await supabase.storage.from("files").remove([m[1]]);
        }
      }
      const { error: updErr } = await supabase.auth.updateUser({ data: { avatar_url: null } });
      if (updErr) throw updErr;
      setUser((u: any) => ({ ...u, user_metadata: { ...(u?.user_metadata || {}), avatar_url: "" } }));
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Falha ao remover foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={displayName || "Usuário"} className="h-12 w-12 rounded-full border" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200 border flex items-center justify-center text-gray-700">
            <span className="text-sm">{displayName ? displayName[0]?.toUpperCase() : "U"}</span>
          </div>
        )}
        <div className="grid">
          <span className="font-medium">{displayName || "Usuário"}</span>
          <span className="text-xs text-gray-600">Atualize sua foto de perfil</span>
        </div>
      </div>
      <div>
        <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
        <button type="button" onClick={removeAvatar} disabled={uploading} className="ml-2 rounded bg-red-600 px-3 py-1.5 text-white">Remover foto</button>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}