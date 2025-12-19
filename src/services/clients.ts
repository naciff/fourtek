import { SupabaseClient } from "@supabase/supabase-js";

export async function getClients(
    supabase: SupabaseClient,
    {
        q,
        situation,
        state,
        serviceId,
        page = 1,
        pageSize = 20,
    }: {
        q?: string;
        situation?: string;
        state?: string;
        serviceId?: string;
        page?: number;
        pageSize?: number;
    }
) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let base = supabase.from("clients");
    let countQuery = base.select("id", { count: "exact", head: true });

    if (q) countQuery = countQuery.ilike("alias", `%${q}%`);
    if (situation) countQuery = countQuery.eq("situation", situation);
    if (state) countQuery = countQuery.eq("state", state);
    if (serviceId) {
        const { data: links } = await supabase
            .from("client_services")
            .select("client_id")
            .eq("service_id", serviceId);
        const ids = (links ?? []).map((l: any) => l.client_id);
        countQuery = ids.length
            ? countQuery.in("id", ids)
            : countQuery.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }
    const { count } = await countQuery;

    let query = base
        .select(
            "id, client_contract, alias, situation, cnpj, city, state, street, number, complement, neighborhood, zip"
        )
        .order("client_contract", { ascending: true, nullsFirst: false });

    if (q) query = query.ilike("alias", `%${q}%`);
    if (situation) query = query.eq("situation", situation);
    if (state) query = query.eq("state", state);
    if (serviceId) {
        const { data: links } = await supabase
            .from("client_services")
            .select("client_id")
            .eq("service_id", serviceId);
        const ids = (links ?? []).map((l: any) => l.client_id);
        query = ids.length
            ? query.in("id", ids)
            : query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }

    const { data: clientsRaw } = await query;
    // Sort in memory as client_contract might be string but needed numeric sort?
    // Original code did: Number(a.client_contract||0) - Number(b.client_contract||0)
    const sorted = [...(clientsRaw || [])].sort(
        (a: any, b: any) =>
            Number(a.client_contract || 0) - Number(b.client_contract || 0)
    );
    const clients = sorted.slice(from, to + 1);
    const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;

    return { clients, count, totalPages };
}

export async function getClientById(supabase: SupabaseClient, id: string) {
    const { data } = await supabase
        .from("clients")
        .select("*", { count: "exact" })
        .eq("id", id)
        .single();
    return data;
}

export async function getServicesList(supabase: SupabaseClient) {
    const { data } = await supabase.from("services").select("id,name").order("name");
    return data;
}
