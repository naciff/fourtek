import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        // Get active organization (for now using the first one linked to user)
        const { data: userOrgs } = await supabase.from("user_organizations").select("organization_id").limit(1).single();
        const orgId = userOrgs?.organization_id;

        if (!orgId) return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });

        const { data, error } = await supabase
            .from("integration_settings")
            .select("*")
            .eq("organization_id", orgId)
            .maybeSingle();

        if (error) throw error;

        // If no settings exist yet, return a default object with the orgId
        if (!data) return NextResponse.json({ organization_id: orgId });

        return NextResponse.json(data);
    } catch (e: any) {
        console.error("settings.integrations.get error", e?.message || e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const body = await req.json();

        // Basic auth check already handled by Supabase middleware/auth
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        const {
            organization_id,
            whatsapp_api_key,
            whatsapp_instance,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_pass,
            smtp_from
        } = body;

        const { data, error } = await supabase
            .from("integration_settings")
            .upsert({
                organization_id,
                whatsapp_api_key,
                whatsapp_instance,
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_pass,
                smtp_from,
                updated_at: new Date().toISOString()
            }, { onConflict: 'organization_id' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        console.error("settings.integrations.post error", e?.message || e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
