import { z } from "zod";

function digits(value: string) {
  return (value || "").replace(/\D/g, "");
}

function isValidCPF(value: string) {
  const v = digits(value);
  if (!v || v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i]) * (factor - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calc(v.slice(0, 9), 10);
  const d2 = calc(v.slice(0, 10), 11);
  return d1 === parseInt(v[9]) && d2 === parseInt(v[10]);
}

function isValidCNPJ(value: string) {
  const v = digits(value);
  if (!v || v.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(v)) return false;
  const calc = (base: string) => {
    const factors = [5,4,3,2,9,8,7,6,5,4,3,2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(base[i]) * factors[i];
    let rest = sum % 11;
    const d1 = rest < 2 ? 0 : 11 - rest;
    const factors2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
    sum = 0;
    const base2 = base + d1;
    for (let i = 0; i < 13; i++) sum += parseInt(base2[i]) * factors2[i];
    rest = sum % 11;
    const d2 = rest < 2 ? 0 : 11 - rest;
    return [d1, d2];
  };
  const [d1, d2] = calc(v.slice(0, 12));
  return d1 === parseInt(v[12]) && d2 === parseInt(v[13]);
}

export const ClientSchema = z.object({
  corporate_name: z.string().min(2),
  trade_name: z.string().min(1),
  cnpj: z.string().refine(isValidCNPJ, "CNPJ inválido"),
  state_registration: z.string().optional(),
  street: z.string().min(1),
  number: z.string().optional(),
  neighborhood: z.string().min(1),
  complement: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().refine((v) => digits(v).length === 8, "CEP inválido"),
  phone: z.string().optional(),
  email: z.union([z.string().email("E-mail inválido"), z.string().length(0)]).optional(),
  cns: z.string().optional().refine((v)=>{
    const s = String(v ?? "").trim();
    if (!s) return true;
    const d = digits(s);
    return d.length === 6;
  }, "CNS deve possuir 6 dígitos"),
  consulta_cnpj: z.string().optional(),
  website: z.string().optional(),
  alias: z.string().optional(),
  company_type: z.enum(["Cartório","Empresa"]),
  client_contract: z.coerce.number().int().positive("Contrato deve ser número positivo"),
  contract_value: z.coerce.number().optional(),
  installation_date: z.string().min(1),
  cancellation_date: z.string().optional(),
  situation: z.enum(["Ativo","Aguardando","Suspenso","Cancelado"]),
  services: z.string().optional(),
  cloud_size: z.string().optional(),
  cloud_date: z.string().optional(),
  logo_url: z.string().optional(),
  contract_image_url: z.string().optional(),
  cloud_image_url: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  position: z.string().optional(),
  cargo: z.enum(["Oficial(a)", "Respondente (Interino)", "Representante"]).optional(),
  contract_done: z.boolean().optional(),
  signed: z.boolean().optional(),
  implemented: z.boolean().optional(),
  contract_value_details: z.string().optional(),
  representatives_text: z.string().optional(),
  notes: z.string().optional(),
});

export const RepresentativeSchema = z.object({
  full_name: z.string().min(2),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  phone: z.string().optional(),
  email: z.union([z.string().email("E-mail inválido"), z.string().length(0)]).optional(),
  rg: z.string().optional(),
  birth_date: z.string().optional().refine((v)=>{
    const s = String(v ?? "").trim();
    if (!s) return true;
    const m = s.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    const dd = parseInt(m[1]);
    const mm = parseInt(m[2]);
    return dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12;
  }, "Data deve estar no formato DD/MM"),
  image_url: z.string().optional(),
});

export const ContractSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  due_day: z.string().optional().refine((v)=>{
    const s = String(v ?? "").trim();
    if (!s) return true;
    if (!/^\d{1,2}$/.test(s)) return false;
    const n = parseInt(s, 10);
    return n >= 1 && n <= 31;
  }, "Informe o dia (1-31)"),
  total_value: z.union([z.string(), z.number()]).refine((v)=>Number(v)>0, "Valor deve ser maior que 0"),
  status: z.enum(["ativo","encerrado","suspenso"]),
  client_id: z.string().uuid(),
});

export const validators = { isValidCPF, isValidCNPJ, digits };
