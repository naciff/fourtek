import Link from "next/link";
import { SettingsNav } from "./SettingsNav";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="flex-shrink-0 border-b bg-white dark:bg-gray-800 dark:border-gray-700 px-6">
                <SettingsNav />
            </div>
            <div className="flex-1 overflow-auto p-6">{children}</div>
        </div>
    );
}
