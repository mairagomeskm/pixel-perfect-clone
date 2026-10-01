export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function isValidCPF(raw: string) {
  const c = onlyDigits(raw);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += Number(c[i]) * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10]);
}

export function isValidCNPJ(raw: string) {
  const c = onlyDigits(raw);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = w.reduce((a, wi, i) => a + wi * Number(c[i]), 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(c[12]) && calc(13) === Number(c[13]);
}

export type CepResult = { ok: true; address: string; uf: string } | { ok: false; error: string };

/** Consulta o CEP no ViaCEP e aceita apenas DF e entorno (GO). */
export async function lookupCep(raw: string): Promise<CepResult> {
  const c = onlyDigits(raw);
  if (c.length !== 8) return { ok: false, error: "CEP deve ter 8 números." };
  try {
    const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
    const d = await r.json();
    if (d.erro) return { ok: false, error: "CEP não encontrado." };
    if (d.uf !== "DF" && d.uf !== "GO") return { ok: false, error: "Atendemos apenas DF e entorno." };
    return { ok: true, uf: d.uf, address: [d.logradouro, d.bairro, `${d.localidade}/${d.uf}`].filter(Boolean).join(", ") };
  } catch {
    return { ok: false, error: "Não foi possível consultar o CEP agora." };
  }
}

export const maskCPF = (v: string) =>
  onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
export const maskCEP = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
export const maskPhone = (v: string) =>
  onlyDigits(v).slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
export const maskCNPJ = (v: string) =>
  onlyDigits(v)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
