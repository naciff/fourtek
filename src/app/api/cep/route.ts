import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cep = (searchParams.get("cep") || "").replace(/\D/g, "");
  if (!cep || cep.length !== 8) return NextResponse.json({ error: "CEP inválido" }, { status: 400 });

  async function fromBrasilApi(id: string) {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${id}`);
    if (!r.ok) return null;
    const d = await r.json();
    return {
      street: d.street || "",
      neighborhood: d.neighborhood || "",
      city: d.city || "",
      state: d.state || "",
      zip: d.cep || id,
    };
  }

  async function fromViaCep(id: string) {
    const r = await fetch(`https://viacep.com.br/ws/${id}/json/`);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.erro) return null;
    return {
      street: d.logradouro || "",
      neighborhood: d.bairro || "",
      city: d.localidade || "",
      state: d.uf || "",
      zip: d.cep || id,
    };
  }

  const a = await fromBrasilApi(cep);
  if (a) return NextResponse.json(a);
  const b = await fromViaCep(cep);
  if (b) return NextResponse.json(b);
  return NextResponse.json({ error: "Consulta indisponível" }, { status: 503 });
}