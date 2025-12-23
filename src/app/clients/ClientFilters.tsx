"use client";

import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelSelect } from "@/components/ui/FloatingLabelSelect";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "use-debounce";

interface ClientFiltersProps {
    services: { id: string; name: string }[];
}

export function ClientFilters({ services }: ClientFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [text, setText] = useState(searchParams.get("q") || "");
    const [debouncedText] = useDebounce(text, 500);

    const situation = searchParams.get("situation") || "";
    const state = searchParams.get("state") || "";
    const serviceId = searchParams.get("serviceId") || "";

    // Effect to sync URL when filters change
    useEffect(() => {
        // Avoid double firing on load if params match state
        const currentQ = searchParams.get("q") || "";
        if (debouncedText === currentQ) return;

        updateFilter("q", debouncedText);
    }, [debouncedText]);

    function updateFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset page on filter change
        params.set("page", "1");

        router.replace(`${pathname}?${params.toString()}`);
    }

    function clearFilters() {
        startTransition(() => {
            router.replace(pathname);
        });
        setText("");
    }

    const hasActiveFilters = !!(searchParams.get("q") || searchParams.get("situation") || searchParams.get("state") || searchParams.get("serviceId"));

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <Link href="/clients/new" className="rounded bg-brand-green-600 px-3 py-2 text-white shadow-sm hover:bg-brand-green-700 transition-colors whitespace-nowrap h-[42px] flex items-center">
                Novo cliente
            </Link>

            <div className="flex-initial w-[260px]">
                <FloatingLabelInput
                    label="Buscar..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            <div className="w-[120px]">
                <FloatingLabelSelect
                    label="Situação"
                    value={situation}
                    onChange={(e) => updateFilter("situation", e.target.value)}
                >
                    <option value=""></option>
                    <option value="Ativo">Ativo</option>
                    <option value="Aguardando">Aguardando</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Cancelado">Cancelado</option>
                </FloatingLabelSelect>
            </div>

            <div className="w-[80px]">
                <FloatingLabelSelect
                    label="UF"
                    value={state}
                    onChange={(e) => updateFilter("state", e.target.value)}
                >
                    <option value=""></option>
                    {[
                        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
                    ].map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                    ))}
                </FloatingLabelSelect>
            </div>

            <div className="w-[320px]">
                <FloatingLabelSelect
                    label="Serviço"
                    value={serviceId}
                    onChange={(e) => updateFilter("serviceId", e.target.value)}
                >
                    <option value=""></option>
                    <option value="only_cloud" className="text-gray-900">Somente Cloud</option>
                    {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </FloatingLabelSelect>
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-sm text-brand-blue-700 hover:underline px-2 h-[42px] flex items-center"
                >
                    Limpar filtro
                </button>
            )}

            <div className="ml-auto">
                <button className="text-gray-400 hover:text-gray-600" title="Informações">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
