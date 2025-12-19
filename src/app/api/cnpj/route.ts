import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cnpj = (searchParams.get("cnpj") || "").replace(/\D/g, "");
  if (!cnpj || cnpj.length !== 14) return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });

  async function fromBrasilApi(id: string) {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${id}`);
    if (!r.ok) return null;
    const d = await r.json();
    const s = String(d.descricao_situacao_cadastral || "").toUpperCase();
    return {
      corporate_name: d.razao_social || "",
      trade_name: d.nome_fantasia || "",
      cnpj: d.cnpj || id,
      street: d.logradouro || "",
      number: d.numero || "",
      neighborhood: d.bairro || "",
      complement: d.complemento || "",
      city: d.municipio || "",
      state: d.uf || "",
      zip: d.cep || "",
      email: d.email || "",
      phone: d.ddd_telefone_1 ? String(d.ddd_telefone_1) : "",
      situation: s.includes("ATIVA") ? "Ativo" : "Cancelado",
    };
  }

  async function fromReceitaWs(id: string) {
    const r = await fetch(`https://www.receitaws.com.br/v1/cnpj/${id}`);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.status === "ERROR") return null;
    const s = String(d.situacao || "").toUpperCase();
    return {
      corporate_name: d.nome || "",
      trade_name: d.fantasia || "",
      cnpj: d.cnpj || id,
      street: d.logradouro || "",
      number: d.numero || "",
      neighborhood: d.bairro || "",
      complement: d.complemento || "",
      city: d.municipio || d.cidade || "",
      state: d.uf || "",
      zip: d.cep || "",
      email: d.email || "",
      phone: d.telefone || "",
      situation: s.includes("ATIVA") ? "Ativo" : "Cancelado",
    };
  }

  const a = await fromBrasilApi(cnpj);
  if (a) return NextResponse.json(a);
  const b = await fromReceitaWs(cnpj);
  if (b) return NextResponse.json(b);
  return NextResponse.json({ error: "Consulta indisponível" }, { status: 503 });
}