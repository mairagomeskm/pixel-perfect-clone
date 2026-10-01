const f = (id: string, v: string) => id + String(v.length).padStart(2, "0") + v;
const ascii = (s: string) => s.normalize("NFD").replace(/[^\x20-\x7E]/g, "").replace(/[^A-Za-z0-9 ]/g, "");

function crc16(p: string) {
  let crc = 0xffff;
  for (let i = 0; i < p.length; i++) {
    crc ^= p.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Gera o código PIX "copia e cola" (BR Code estático). */
export function pixPayload(o: { key: string; name: string; city?: string; amount?: number; txid?: string }) {
  const gui = f("00", "br.gov.bcb.pix") + f("01", o.key.trim());
  let p =
    f("00", "01") +
    f("26", gui) +
    f("52", "0000") +
    f("53", "986") +
    (o.amount && o.amount > 0 ? f("54", o.amount.toFixed(2)) : "") +
    f("58", "BR") +
    f("59", ascii(o.name).slice(0, 25) || "Caritas Pets") +
    f("60", ascii(o.city ?? "Brasilia").slice(0, 15)) +
    f("62", f("05", (o.txid ?? "***").slice(0, 25)));
  p += "6304";
  return p + crc16(p);
}
