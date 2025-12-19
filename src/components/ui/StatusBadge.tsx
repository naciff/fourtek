export default function StatusBadge({ status }: { status: string }) {
    const s = String(status || "").toLowerCase();
    const cls = s === "ativo"
        ? "bg-brand-green-600"
        : s === "cancelado"
            ? "bg-gray-600"
            : "bg-yellow-500";
    return (
        <span className={`inline-flex items-center rounded px-1 py-px text-white uppercase text-[9px] ${cls}`}>{s}</span>
    );
}
