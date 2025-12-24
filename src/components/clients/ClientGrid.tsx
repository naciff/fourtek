"use client";

import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { ClientRowActions } from "./ClientRowActions";
import { useState, useEffect, useMemo } from "react";

interface ClientGridProps {
    clients: any[];
    searchParams: any;
}

export function ClientGrid({ clients, searchParams }: ClientGridProps) {
    const [favoriteClients, setFavoriteClients] = useState<string[]>([]);

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('favorite-clients');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFavoriteClients(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const toggleFavorite = (clientId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const isFavorite = favoriteClients.includes(clientId);
        let newFavorites: string[];

        if (isFavorite) {
            // Remove from favorites
            newFavorites = favoriteClients.filter(id => id !== clientId);
            console.log('Removing from favorites:', clientId);
        } else {
            // Add to favorites (max 8)
            if (favoriteClients.length >= 8) {
                alert('Você já tem 8 clientes favoritos. Remova um favorito antes de adicionar outro.');
                return;
            }
            newFavorites = [...favoriteClients, clientId];
            console.log('Adding to favorites:', clientId);
        }

        setFavoriteClients(newFavorites);
        localStorage.setItem('favorite-clients', JSON.stringify(newFavorites));
    };

    // Separate favorites and non-favorites with useMemo to ensure reactivity
    const orderedClients = useMemo(() => {
        console.log('Reordering clients. Favorites:', favoriteClients);
        const favoriteClientsList = clients.filter(c => favoriteClients.includes(c.id));
        const nonFavoriteClientsList = clients.filter(c => !favoriteClients.includes(c.id));
        console.log('Favorite clients count:', favoriteClientsList.length);
        console.log('Non-favorite clients count:', nonFavoriteClientsList.length);
        const ordered = [...favoriteClientsList, ...nonFavoriteClientsList];
        // Show only first 8 clients in grid
        return ordered.slice(0, 8);
    }, [clients, favoriteClients]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-y-auto min-h-0 bg-gray-50 dark:bg-gray-900">
            {orderedClients.map((c) => {
                const getInitials = (name: string) => {
                    const parts = name.trim().split(' ').filter(Boolean);
                    if (parts.length === 0) return '?';
                    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                };
                const initials = getInitials(c.alias || c.corporate_name || "?");

                // Deterministic pastel colors
                const colors = [
                    'bg-blue-100 text-blue-600',
                    'bg-purple-100 text-purple-600',
                    'bg-green-100 text-green-600',
                    'bg-pink-100 text-pink-600',
                    'bg-yellow-100 text-yellow-600',
                    'bg-indigo-100 text-indigo-600'
                ];
                const colorIndex = (c.id.charCodeAt(0) || 0) % colors.length;
                const avatarClass = colors[colorIndex];
                const contractFormatted = String(c.client_contract).padStart(2, '0');
                const isFavorite = favoriteClients.includes(c.id);

                return (
                    <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-5 flex flex-col relative group h-full">
                        {/* Header: Avatar + Star + Actions */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${avatarClass} flex-shrink-0`}>
                                {initials}
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Star button */}
                                <button
                                    onMouseDown={(e) => toggleFavorite(c.id, e)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill={isFavorite ? "#FFA500" : "none"}
                                        stroke={isFavorite ? "#FFA500" : "currentColor"}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="transition-all pointer-events-none"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </button>
                                <ClientRowActions clientId={c.id} contractNumber={c.client_contract} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Contrato {contractFormatted}</span>
                                <StatusBadge status={String(c.situation)} />
                            </div>

                            <Link
                                href={`/clients/${c.id}`}
                                className="font-bold text-gray-900 dark:text-white text-lg hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors line-clamp-2"
                            >
                                {c.alias || c.corporate_name}
                            </Link>

                            {c.cnpj && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                    {c.cnpj}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {c.city} - {c.state}
                            </div>
                        </div>

                        {/* Footer Button same as list */}
                        <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                            <Link
                                href={`/clients/${c.id}`}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v18h-6M10 17l5-5-5-5M13.8 12H3" /></svg>
                                Ver Detalhes
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
