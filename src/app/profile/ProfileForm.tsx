"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";

export default function ProfileForm({ user }: { user: any }) {
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);

    // Profile State
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email] = useState(user.email || "");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        async function getProfile() {
            try {
                setLoading(true);
                // Try to fetch from profiles table first
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url, phone")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setFullName(data.full_name || "");
                    setPhone(data.phone || "");
                    setAvatarUrl(data.avatar_url || null);
                } else {
                    // Fallback or init from metadata
                    setFullName(user.user_metadata?.full_name || "");
                    setAvatarUrl(user.user_metadata?.avatar_url || null);
                }
            } catch (error) {
                console.warn("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, [user, supabase]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 11) val = val.slice(0, 11);

        // Format: (XX) XXXXX-XXXX
        let formatted = val;
        if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
        if (val.length > 7) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;

        setPhone(formatted);
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("Selecione uma imagem para upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);
            setMessage(null);

            const updates = {
                id: user.id,
                full_name: fullName,
                phone,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("profiles").upsert(updates);
            if (error) throw error;

            // Also update auth metadata for sync
            await supabase.auth.updateUser({
                data: { full_name: fullName, avatar_url: avatarUrl }
            });

            setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
        } catch (error: any) {
            setMessage({ type: "error", text: "Erro ao atualizar perfil." });
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        try {
            setLoadingPass(true);
            setPassMessage(null);

            if (newPassword !== confirmPassword) {
                throw new Error("As senhas não conferem.");
            }
            if (newPassword.length < 6) {
                throw new Error("A senha deve ter pelo menos 6 caracteres.");
            }

            // Supabase update user password
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setPassMessage({ type: "success", text: "Senha alterada com sucesso!" });
            setNewPassword("");
            setConfirmPassword("");
            setCurrentPassword("");
        } catch (error: any) {
            setPassMessage({ type: "error", text: error.message || "Erro ao alterar senha." });
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6 max-w-2xl mx-auto shadow-sm">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative w-24 h-24 mb-3">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border border-gray-200" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                    )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                    Alterar foto
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={loading}
                    />
                </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <FloatingLabelInput
                    label="Nome"
                    type="text"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                />

                <div>
                    <FloatingLabelInput
                        label="E-mail"
                        type="text"
                        value={email}
                        disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 pl-1">Para alterar seu email de login, entre em contato com o suporte.</p>
                </div>

                <FloatingLabelInput
                    label="Celular"
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                />

                <div className="flex justify-end pt-2">
                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>
                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <hr className="my-8 border-gray-100" />

            {/* Change Password Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Alterar Senha</h3>
                <div className="space-y-6">
                    <FloatingLabelInput
                        label="Senha Atual"
                        type="password"
                        value={currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                        <FloatingLabelInput
                            label="Nova Senha"
                            type="password"
                            value={newPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        />
                        <FloatingLabelInput
                            label="Confirmar Nova Senha"
                            type="password"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={updatePassword}
                            disabled={loadingPass}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {loadingPass ? "Alterando..." : "Alterar Senha"}
                        </button>
                    </div>
                    {passMessage && (
                        <div className={`p-3 rounded-md text-sm ${passMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {passMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
