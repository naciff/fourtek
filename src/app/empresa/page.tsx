import { supabaseServer } from "@/lib/supabase-server";
import FilesUploader from "./FilesUploader";

export default async function EmpresaPage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id || "";
  let row: any = null;
  if (uid) {
    const { data } = await supabase.from("company").select("*").eq("user_id", uid).limit(1);
    row = data?.[0] || null;
  }
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-black">Empresa</h1>
      <div className="mt-4 rounded-lg border bg-white p-6">
        {row ? (
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-gray-600">Razão Social</div>
                <div className="font-medium">{row.razao_social}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">CNPJ</div>
                <div className="font-medium">{row.cnpj}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Consulta CNPJ</div>
                {row.consulta_cnpj ? (
                  <a href={String(row.consulta_cnpj).startsWith("http") ? row.consulta_cnpj : `http://${row.consulta_cnpj}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue-700">Abrir</a>
                ) : (
                  <div className="font-medium">-</div>
                )}
              </div>
            </div>
              <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-gray-600">Data de Abertura</div>
                <div className="font-medium">{row.data_abertura ? new Date(row.data_abertura).toLocaleDateString("pt-BR") : ""}</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-600">Inscrição Municipal</div>
                <div className="font-medium">{row.inscricao_municipal || ""}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Inscrição Estadual</div>
                <div className="font-medium">{row.inscricao_estadual || ""}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Endereço Completo</div>
              <div className="font-medium">{row.endereco_completo || ""}</div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <div className="text-sm text-gray-600">E-mail</div>
                <div className="font-medium">{row.email || ""}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Contato</div>
                <div className="font-medium">{row.contato || ""}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Site</div>
                {row.site ? (
                  <div className="flex items-center gap-2">
                    <div className="font-medium break-all flex-1">{row.site}</div>
                    <a
                      href={String(row.site).startsWith("http") ? row.site : `http://${row.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir site"
                      aria-label="Abrir site"
                      className="inline-flex items-center justify-center rounded bg-brand-blue-600 text-white w-9 h-9"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"/><path d="M5 5h7v2H7v10h10v-5h2v7H5V5z"/></svg>
                    </a>
                  </div>
                ) : (
                  <div className="font-medium">-</div>
                )}
              </div>
              </div>
            <div>
              <div className="text-sm text-gray-600">Dados Bancários</div>
              <div className="font-medium break-words">{row.dados_bancarios || ""}</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-600">Chave PIX</div>
                <div className="font-medium break-all">{row.chave_pix || ""}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Chave PIX Imagem</div>
                {row.chave_pix_imagem ? (<img src={row.chave_pix_imagem} alt="Chave PIX" className="h-24 rounded border" />) : (<div className="font-medium">-</div>)}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-600">Contrato Social</div>
                {row.contrato_social ? (
                  <a href={row.contrato_social} target="_blank" rel="noopener noreferrer" className="text-brand-blue-700">Abrir</a>
                ) : (
                  <div className="font-medium">-</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Imagem CNPJ</div>
                {row.imagem_cnpj ? (<img src={row.imagem_cnpj} alt="CNPJ" className="h-24 rounded border" />) : (<div className="font-medium">-</div>)}
              </div>
            </div>
            <FilesUploader empresaId={row.id} chavePixImagem={row.chave_pix_imagem} contratoSocial={row.contrato_social} imagemCNPJ={row.imagem_cnpj} />
          </div>
        ) : (
          <div className="text-sm text-gray-700">Nenhuma empresa cadastrada.</div>
        )}
      </div>
    </div>
  );
}
