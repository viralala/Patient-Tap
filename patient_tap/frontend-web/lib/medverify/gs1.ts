/**
 * Parser for the codes printed on Indian medicine packs.
 *
 * Since Aug 2023 the top drug brands must carry a QR / barcode encoding the
 * product code, batch, manufacturing & expiry dates and a unique serial. In
 * practice these follow GS1 Application Identifiers:
 *
 *   (01) GTIN-14 · (10) batch · (11) mfg date · (17) expiry · (21) serial
 *
 * We accept the human-readable bracketed form, the raw machine form (with the
 * GS / FNC1 separator), GS1 Digital Link URLs, simple query-string URLs and a
 * bare EAN-13 / GTIN-14 from a 1-D barcode.
 */

export interface PackCode {
  gtin?: string; // always normalised to 14 digits
  batch?: string;
  serial?: string;
  expiry?: string; // ISO yyyy-mm-dd
  mfgDate?: string; // ISO yyyy-mm-dd
  format: "gs1" | "digital-link" | "url" | "barcode" | "manual";
  raw: string;
}

const GS = "\u001d";

/** GS1 mod-10 check digit over every digit but the last. */
export function isValidGtin(gtin: string): boolean {
  if (!/^\d{8,14}$/.test(gtin)) return false;
  const digits = gtin.split("").map(Number);
  const check = digits.pop()!;
  const sum = digits
    .reverse()
    .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export function normaliseGtin(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) return undefined;
  return digits.padStart(14, "0");
}

/** GS1 YYMMDD → ISO date. DD = 00 means "last day of that month". */
export function gs1DateToIso(yymmdd: string): string | undefined {
  if (!/^\d{6}$/.test(yymmdd)) return undefined;
  const year = 2000 + Number(yymmdd.slice(0, 2));
  const month = Number(yymmdd.slice(2, 4));
  let day = Number(yymmdd.slice(4, 6));
  if (month < 1 || month > 12) return undefined;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day === 0) day = lastDay;
  if (day > lastDay) return undefined;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const clean = (v: string | undefined | null, max = 40) => {
  const s = (v ?? "").trim().toUpperCase();
  return s && s.length <= max && /^[\x21-\x7E]+$/.test(s) ? s : undefined;
};

function assign(out: PackCode, ai: string, value: string) {
  switch (ai) {
    case "01":
    case "02":
      out.gtin = normaliseGtin(value);
      break;
    case "10":
      out.batch = clean(value, 20);
      break;
    case "21":
      out.serial = clean(value, 20);
      break;
    case "17":
      out.expiry = gs1DateToIso(value);
      break;
    case "11":
      out.mfgDate = gs1DateToIso(value);
      break;
  }
}

// Fixed-length AIs we care about; anything else is variable (ends at GS).
const FIXED: Record<string, number> = { "01": 14, "02": 14, "11": 6, "13": 6, "15": 6, "17": 6 };

function parseRawElementString(s: string, out: PackCode) {
  let i = 0;
  while (i < s.length) {
    if (s[i] === GS) {
      i++;
      continue;
    }
    const ai = s.slice(i, i + 2);
    if (!/^\d{2}$/.test(ai)) break;
    i += 2;
    const fixed = FIXED[ai];
    let value: string;
    if (fixed) {
      value = s.slice(i, i + fixed);
      i += fixed;
    } else {
      const end = s.indexOf(GS, i);
      value = end === -1 ? s.slice(i) : s.slice(i, end);
      i = end === -1 ? s.length : end + 1;
    }
    assign(out, ai, value);
  }
}

export function parsePackCode(input: string): PackCode | null {
  const raw = input.trim().slice(0, 512);
  if (!raw) return null;
  const out: PackCode = { format: "gs1", raw };

  // 1. URLs: GS1 Digital Link (…/01/<gtin>/10/<batch>/21/<serial>?17=YYMMDD) or ?gtin=…
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const parts = url.pathname.split("/").filter(Boolean);
      for (let p = 0; p < parts.length - 1; p++) {
        if (/^(01|02|10|21|17|11)$/.test(parts[p])) {
          assign(out, parts[p], decodeURIComponent(parts[p + 1]));
          p++;
        }
      }
      if (out.gtin) {
        out.format = "digital-link";
        for (const [k, v] of url.searchParams) if (/^\d{2}$/.test(k)) assign(out, k, v);
      } else {
        const q = url.searchParams;
        const g = q.get("gtin") ?? q.get("01");
        if (g) out.gtin = normaliseGtin(g);
        out.batch = clean(q.get("batch") ?? q.get("10"));
        out.serial = clean(q.get("serial") ?? q.get("21"));
        const exp = q.get("exp") ?? q.get("expiry") ?? q.get("17");
        if (exp) out.expiry = /^\d{6}$/.test(exp) ? gs1DateToIso(exp) : /^\d{4}-\d{2}-\d{2}$/.test(exp) ? exp : undefined;
        out.format = "url";
      }
      return out.gtin ? out : null;
    } catch {
      return null;
    }
  }

  // 2. Human-readable bracketed form: (01)…(17)…(10)…(21)…
  if (raw.includes("(")) {
    for (const m of raw.matchAll(/\((\d{2,4})\)([^()]*)/g)) assign(out, m[1], m[2].trim());
    return out.gtin ? out : null;
  }

  // 3. Bare 1-D barcode (EAN-13 / UPC / GTIN-14).
  if (/^\d{8,14}$/.test(raw)) {
    out.gtin = normaliseGtin(raw);
    out.format = "barcode";
    return out;
  }

  // 4. Raw element string, optionally with a symbology identifier (]C1, ]d2, ]Q3).
  const body = raw.replace(/^\][A-Za-z]\d/, "");
  if (/^0[12]\d{14}/.test(body)) {
    parseRawElementString(body, out);
    return out.gtin ? out : null;
  }

  return null;
}

/** Build the bracketed human-readable string (for demo packs and display). */
export function formatGs1(code: Pick<PackCode, "gtin" | "batch" | "serial" | "expiry">): string {
  const yymmdd = code.expiry ? code.expiry.slice(2).replace(/-/g, "") : "";
  return [
    code.gtin && `(01)${code.gtin}`,
    yymmdd && `(17)${yymmdd}`,
    code.batch && `(10)${code.batch}`,
    code.serial && `(21)${code.serial}`,
  ]
    .filter(Boolean)
    .join("");
}
