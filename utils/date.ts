// Small date helpers to avoid timezone-related off-by-one issues and keep a single source of truth

// Pads a number to 2 digits
export const pad2 = (n: number) => n.toString().padStart(2, '0');

// Format a Date as yyyy-MM-dd using local getters (no UTC conversions)
export const fmtYMD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// Parse a yyyy-MM-dd string to a Date in local time (no implicit UTC parsing)
export const parseLocalYMD = (s: string) => {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return new Date(NaN);
  const [, y, mo, da] = m;
  return new Date(Number(y), Number(mo) - 1, Number(da));
};
