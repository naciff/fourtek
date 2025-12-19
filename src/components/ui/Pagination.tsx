import Link from "next/link";

export default function Pagination({
  pathname,
  params,
  page,
  pageSize,
  totalPages,
  count,
  sizes = [20, 50, 100],
}: {
  pathname: string;
  params: Record<string, any>;
  page: number;
  pageSize: number;
  totalPages: number;
  count?: number | null;
  sizes?: number[];
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm">
        {sizes.map((size) => (
          <Link
            key={size}
            href={{ pathname, query: { ...params, pageSize: size, page: 1 } }}
            className={`rounded border px-3 py-1 ${pageSize === size ? "bg-gray-200" : ""}`}
          >
            {size}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
          {typeof count === "number" ? ` (${count} itens)` : ""}
        </span>
        <Link
          href={{ pathname, query: { ...params, pageSize, page: Math.max(1, page - 1) } }}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Anterior
        </Link>
        <Link
          href={{ pathname, query: { ...params, pageSize, page: Math.min(totalPages, page + 1) } }}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}

