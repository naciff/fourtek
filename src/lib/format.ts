export function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

export function formatCNPJ(v: string) {
  const d = onlyDigits(v).slice(0,14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatCPF(v: string) {
  const d = onlyDigits(v).slice(0,11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCEP(v: string) {
  const d = onlyDigits(v).slice(0,8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

export function formatPhone(v: string) {
  const d = onlyDigits(v).slice(0,11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function formatCNS(v: string) {
  const d = onlyDigits(v).slice(0,6);
  if (d.length <= 2) return d;
  if (d.length <= 5) return d.replace(/(\d{2})(\d{0,3})/, "$1.$2");
  return d.replace(/(\d{2})(\d{3})(\d{1})/, "$1.$2-$3");
}