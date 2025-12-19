import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import Pagination from "@/components/ui/Pagination";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelTextarea";
import StatusBadge from "@/components/ui/StatusBadge";
import { getClientById, getClients, getServicesList } from "@/services/clients";
import { ClientFilters } from "./ClientFilters";

export default async function ClientsListPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const supabase = supabaseServer();
  const q = searchParams?.q || "";
  const situationFilter = searchParams?.situation || "";
  const stateFilter = searchParams?.state || "";
  const serviceId = searchParams?.serviceId || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1"));
  const viewId = searchParams?.view || "";
  const pageSizeRaw = parseInt(searchParams?.pageSize || "20");
  const pageSize = [20, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 20;

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
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-blue-800">Clientes</h1>
      </div>
      <ClientFilters services={services || []} />
      <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-[#2C3E50] text-white">
            <tr>
              <th className="text-left p-2">Contrato</th>
              <th className="text-left p-2">Cliente</th>
              <th className="text-left p-2">Situação</th>
              <th className="text-left p-2">CNPJ</th>
              <th className="text-left p-2">Cidade/UF</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((c, idx) => (
              <tr key={c.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'} border-t border-[#F5F5F5]`}>
                <td className="p-2">
                  <Link href={{ pathname: "/clients", query: { q, situation: situationFilter, state: stateFilter, serviceId, page, view: (c as any).id } }} className="text-brand-blue-700">
                    {(c as any).client_contract}
                  </Link>
                </td>
                <td className="p-2">
                  <Link href={{ pathname: "/clients", query: { q, situation: situationFilter, state: stateFilter, serviceId, page, view: (c as any).id } }} className="text-brand-blue-700">
                    {(c as any).alias}
                  </Link>
                </td>
                <td className="p-2">{c.situation ? <StatusBadge status={String(c.situation)} /> : null}</td>
                <td className="p-2">{c.cnpj}</td>
                <td className="p-2">{c.city}/{c.state}</td>
                <td className="p-2 flex gap-2">
                  <Link href={`/clients/${c.id}`} className="text-gray-400" title="Editar" aria-label="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" /></svg>
                  </Link>
                  <Link href={`/clients/${c.id}/contracts`} className="text-gray-400" title="Contratos" aria-label="Contratos">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M14 2v6h6" /></svg>
                  </Link>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(buildAddress(c))}`} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700" title="Rota" aria-label="Rota">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z" /></svg>
                  </a>
                  <DeleteButton id={(c as any).id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewClient ? (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-brand-blue-800">Visualizar Cliente</h2>
              <Link href={{ pathname: "/clients", query: { q, situation: situationFilter, state: stateFilter, serviceId, page } }} className="text-gray-600 hover:text-gray-800" title="Fechar" aria-label="Fechar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FloatingLabelInput label="Razão Social" value={String(viewClient?.corporate_name ?? "")} readOnly />
              </div>
              <div>
                <FloatingLabelInput label="Apelido" value={String(viewClient?.alias ?? "")} readOnly />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <FloatingLabelInput label="CNPJ" value={String(viewClient?.cnpj ?? "")} readOnly />
                </div>
                {(() => {
                  const d = String(viewClient?.cnpj ?? "").replace(/\D/g, "");
                  const href = d.length === 14 ? `https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${d}` : "#";
                  const disabled = d.length !== 14;
                  return (
                    <a
                      href={href}
                      target={disabled ? undefined : "_blank"}
                      rel={disabled ? undefined : "noopener noreferrer"}
                      title="Consulta CNPJ"
                      aria-label="Consulta CNPJ"
                      className={`inline-flex items-center justify-center rounded bg-brand-blue-600 text-white w-[42px] h-[42px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" /><path d="M5 5h7v2H7v10h10v-5h2v7H5V5z" /></svg>
                    </a>
                  );
                })()}
              </div>
              <div className="sm:col-span-2">
                <FloatingLabelTextarea label="Endereço" value={buildAddress(viewClient)} readOnly className="min-h-[80px]" />
              </div>
              <div>
                <FloatingLabelInput label="Telefone" value={String(viewClient?.phone ?? "")} readOnly />
              </div>
              <div>
                <FloatingLabelInput label="E-mail" value={String(viewClient?.email ?? "")} readOnly />
              </div>
              <div className="sm:col-span-2">
                <FloatingLabelInput label="Nome do Representante" value={String(viewClient?.representatives_text ?? "")} readOnly />
              </div>
              <div className="sm:col-span-2">
                <FloatingLabelInput label="Cargo" value={String(viewClient?.position ?? "")} readOnly />
              </div>
              <div className="sm:col-span-2">
                <FloatingLabelInput label="Serviços contratados" value={String(viewClient?.services ?? "")} readOnly />
              </div>
              <div className="sm:col-span-2">
                <FloatingLabelInput label="Situação" value={String(viewClient?.situation ?? "")} readOnly />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Pagination
        pathname="/clients"
        params={{ q, situation: situationFilter, state: stateFilter, serviceId }}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        count={count ?? 0}
      />
    </div>
  );
}
