// Russian-locale number & money formatting.

const nf = (opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat("ru-RU", opts);

export function fmtInt(n: number): string {
  return nf({ maximumFractionDigits: 0 }).format(n);
}

/** Compact money: 1,2 млрд / 340 млн / 12,5 тыс */
export function fmtShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return nf({ maximumFractionDigits: 2 }).format(n / 1e12) + " трлн";
  if (abs >= 1e9) return nf({ maximumFractionDigits: 1 }).format(n / 1e9) + " млрд";
  if (abs >= 1e6) return nf({ maximumFractionDigits: 1 }).format(n / 1e6) + " млн";
  if (abs >= 1e3) return nf({ maximumFractionDigits: 0 }).format(n / 1e3) + " тыс";
  return nf({ maximumFractionDigits: 0 }).format(n);
}

export function fmtTenge(n: number): string {
  return fmtShort(n) + " ₸";
}

export function fmtMoney(n: number, currency: "KZT" | "USD" = "KZT"): string {
  return fmtShort(n) + (currency === "USD" ? " $" : " ₸");
}

export function fmtPct(n: number, digits = 1): string {
  return nf({ maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n) + "%";
}

export function fmtSigned(n: number, digits = 1): string {
  const s = nf({ maximumFractionDigits: digits }).format(Math.abs(n));
  return (n >= 0 ? "+" : "−") + s;
}
