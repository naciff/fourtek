export default function StatusBadge({ status }: { status: string }) {
    const raw = String(status || "").toLowerCase();

    // Map status to styles
    // Default to gray if unknown
    let styles = "bg-gray-100 text-gray-700";
    let label = status;

    if (raw === "ativo") {
        styles = "bg-green-100 text-green-700";
        label = "Ativo";
    } else if (raw === "cancelado" || raw === "inativo") {
        styles = "bg-red-100 text-red-700"; // User requested Cancelled -> Red
        label = raw === "cancelado" ? "Cancelado" : "Inativo";
    } else if (raw === "pendente") {
        styles = "bg-orange-100 text-orange-800";
        label = "Pendente";
    }

    return (
        <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-medium ${styles}`}>
            {label}
        </span>
    );
}
