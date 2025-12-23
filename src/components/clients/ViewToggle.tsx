"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ViewToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentLayout = searchParams.get("layout") === "list" ? "list" : "grid";

    const toggle = (layout: "list" | "grid") => {
        const params = new URLSearchParams(searchParams);
        if (layout === "grid") {
            params.delete("layout");
        } else {
            params.set("layout", "list");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
                onClick={() => toggle("grid")}
                className={`p-1.5 rounded-md transition-all ${currentLayout === "grid" ? "bg-white dark:bg-gray-700 text-brand-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                title="Grade"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
            </button>
            <button
                onClick={() => toggle("list")}
                className={`p-1.5 rounded-md transition-all ${currentLayout === "list" ? "bg-white dark:bg-gray-700 text-brand-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                title="Lista"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
            </button>
        </div>
    );
}
