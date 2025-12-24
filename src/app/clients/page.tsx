import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import Pagination from "@/components/ui/Pagination";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelTextarea";
import StatusBadge from "@/components/ui/StatusBadge";
import { getClientById, getClients, getServicesList } from "@/services/clients";
import { ClientFilters } from "./ClientFilters";
import { ClientDetailsPanel } from "@/components/clients/ClientDetailsPanel";
import { ClientRowActions } from "@/components/clients/ClientRowActions";
import { ClientGrid } from "@/components/clients/ClientGrid";
import { ViewToggle } from "@/components/clients/ViewToggle";

export default async function ClientsListPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const supabase = supabaseServer();
  const q = searchParams?.q || "";
  const situationFilter = searchParams?.situation || "";
  const stateFilter = searchParams?.state || "";
  const serviceId = searchParams?.serviceId || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1"));
  const viewId = searchParams?.view || "";
  const layout = searchParams?.layout === "list" ? "list" : "grid";
  const pageSizeRaw = parseInt(searchParams?.pageSize || "15");
  // In grid mode, fetch ALL clients so ClientGrid can sort by favorites and show top 8
  // In list mode, use pagination normally  
  const pageSize = layout === "grid" ? 1000 : ([15, 30, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 15);

  const { clients, count, totalPages } = await getClients(supabase, {
    q,
    situation: situationFilter,
    state: stateFilter,
    serviceId,
    page,
    pageSize,
  });

  const services = await getServicesList(supabase);

  const viewClient = viewId ? await getClientById(supabase, viewId) : null;

  function buildAddress(c: any) {
    return [c.street, c.number, c.complement, c.neighborhood, c.city, c.state, c.zip]
      .map((v: any) => String(v || "").trim())
      .filter(Boolean)
      .join(", ");
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-4 h-[calc(100vh-48px)] overflow-hidden">
      {/* List Section - Scrollable */}
      <div className="flex-1 w-full min-w-0 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Gestão de Clientes</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie todos os clientes cadastrados no sistema</p>
            </div>
            <ViewToggle />
          </div>
        </div>
        <ClientFilters services={services || []} />
        {/* Main Content Area: Table/Grid */}
        <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 pb-4">
          {layout === "grid" ? (
            <div className="flex-1 w-full min-w-0 flex flex-col h-full overflow-hidden rounded-2xl border bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 shadow-inner relative">
              <ClientGrid clients={clients || []} searchParams={searchParams} />
            </div>
          ) : (
            <div className="flex-1 w-full min-w-0 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-auto min-h-0 rounded-2xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm mx-1 mb-2 relative scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <table className="w-full text-xs sm:text-sm text-gray-700 dark:text-gray-300 relative table-fixed">
                  <thead className="bg-[#2C3E50] dark:bg-gray-950 text-white sticky top-0 z-10 text-xs font-semibold tracking-wider shadow-sm">
                    <tr>
                      <th className="text-left p-3 pl-4 w-[110px]">Contrato</th>
                      <th className="text-left p-3 w-[35%]">Nome do cliente</th>
                      <th className={`text-left p-3 w-[150px] ${viewClient ? 'hidden xl:table-cell' : ''}`}>CNPJ</th>
                      <th className={`text-left p-3 w-[180px] ${viewClient ? 'hidden 2xl:table-cell' : ''}`}>Cidade/uf</th>
                      <th className="text-center p-3 w-[100px]">Status</th>
                      <th className="text-center p-3 w-[60px] pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {clients?.map((c: any) => {
                      const isSelected = viewClient?.id === c.id;
                      const getInitials = (name: string) => {
                        const parts = name.trim().split(' ').filter(Boolean);
                        if (parts.length === 0) return '?';
                        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      };
                      const initials = getInitials(c.alias || c.corporate_name || "?");

                      // Deterministic pastel colors for avatar
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

                      // Format contract number to 2 digits
                      const contractFormatted = String(c.client_contract).padStart(2, '0');

                      return (
                        <tr
                          key={c.id}
                          className={`
                        group transition-colors duration-150 ease-in-out
                        ${isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }
                      `}
                        >
                          {/* Contrato */}
                          <td className="p-3 pl-4">
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-xs text-brand-blue-600 dark:text-brand-blue-400">
                              <Link href={{ pathname: "/clients", query: { ...searchParams, view: c.id } }} scroll={false} className="hover:underline transition-colors">
                                {contractFormatted}
                              </Link>
                            </div>
                          </td>

                          {/* Cliente (Avatar + Name) */}
                          <td className="p-3">
                            <Link href={{ pathname: "/clients", query: { ...searchParams, view: c.id } }} className="flex items-center gap-3 group/link" scroll={false}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarClass} flex-shrink-0`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-semibold truncate ${isSelected ? 'text-brand-blue-700 dark:text-brand-blue-300' : 'text-gray-900 dark:text-gray-100 group-hover/link:text-brand-blue-600'}`}>
                                  {c.alias || c.corporate_name}
                                </div>
                                {c.email && (
                                  <div className="text-xs text-gray-400 truncate hidden sm:block">
                                    {c.email}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </td>

                          {/* CNPJ */}
                          <td className={`p-3 text-xs text-gray-500 ${viewClient ? 'hidden xl:table-cell' : ''}`}>
                            {c.cnpj}
                          </td>

                          {/* Cidade/UF */}
                          <td className={`p-3 ${viewClient ? 'hidden 2xl:table-cell' : ''}`}>
                            <span className="text-gray-600 dark:text-gray-300">{c.city} - {c.state}</span>
                          </td>

                          {/* Status */}
                          <td className="p-3 text-center">
                            <StatusBadge status={String(c.situation)} />
                          </td>

                          {/* Ações */}
                          <td className="p-3 pr-4 text-center">
                            <ClientRowActions clientId={c.id} contractNumber={c.client_contract} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Only show pagination in list view, not in grid */}
          {layout !== "grid" && (
            <div className="flex-shrink-0">
              <Pagination
                pathname="/clients"
                params={{ q, situation: situationFilter, state: stateFilter, serviceId, layout }}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                count={count ?? 0}
                sizes={[15, 30, 50, 100]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel - Sticky Right */}
      {viewClient && (
        <ClientDetailsPanel
          client={viewClient}
          searchParams={{ q, situation: situationFilter, state: stateFilter, serviceId, page }}
        />
      )}

    </div >
  );
}
