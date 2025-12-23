"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "accepted");
        setShow(false);
    };

    const handleReject = () => {
        localStorage.setItem("cookie_consent", "rejected");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[60] w-[340px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in slide-in-from-bottom-5 duration-500">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Sua privacidade é importante
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Utilizamos cookies para melhorar sua experiência, analisar o tráfego e oferecer conteúdo personalizado.
                Clique em &quot;Aceitar todos&quot; para consentir de acordo com nossas políticas de <strong className="font-bold">Cookies</strong> e <strong className="font-bold">Privacidade</strong>.
            </p>

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleAccept}
                    className="w-full py-2.5 px-4 bg-white border-2 border-black dark:border-white rounded-lg text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase tracking-wide"
                >
                    Aceitar todos
                </button>
                <button
                    onClick={handleAccept}
                    className="w-full py-2.5 px-4 bg-white border-2 border-black dark:border-white rounded-lg text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase tracking-wide"
                >
                    Gerenciar preferências
                </button>
                <button
                    onClick={handleReject}
                    className="w-full py-2.5 px-4 bg-white border-2 border-black dark:border-white rounded-lg text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase tracking-wide"
                >
                    Rejeitar todos
                </button>
            </div>
        </div>
    );
}
