import Link from "next/link";

export default function Pagination({
  pathname,
  params,
  page,
  pageSize,
  totalPages,
  count,
  sizes = [15, 30, 50, 100],
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
            className={`rounded border px-3 py-1 transition-colors ${pageSize === size ? "bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500 font-bold" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
          >
            {size}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Página {page} de {totalPages}
          {typeof count === "number" ? ` (${count} itens)` : ""}
        </span>
        <Link
          href={{ pathname, query: { ...params, pageSize, page: Math.max(1, page - 1) } }}
          className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Anterior
        </Link>
        <Link
          href={{ pathname, query: { ...params, pageSize, page: Math.min(totalPages, page + 1) } }}
          className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}

