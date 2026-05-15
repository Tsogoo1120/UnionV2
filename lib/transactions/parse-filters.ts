const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDayToFromIso(value: string | undefined): string | undefined {
  if (!value || !DATE_RE.test(value)) return undefined;
  return `${value}T00:00:00.000Z`;
}

export function parseDayToToIso(value: string | undefined): string | undefined {
  if (!value || !DATE_RE.test(value)) return undefined;
  return `${value}T23:59:59.999Z`;
}

export function parseStatusesParam(
  raw: string | string[] | undefined,
): string[] | undefined {
  if (raw === undefined || raw === "") return undefined;
  const parts = Array.isArray(raw)
    ? raw.flatMap((s) => s.split(","))
    : raw.split(",");
  const cleaned = parts.map((s) => s.trim()).filter(Boolean);
  const allowed = new Set(["pending", "approved", "denied"]);
  const filtered = cleaned.filter((s) => allowed.has(s));
  return filtered.length > 0 ? filtered : undefined;
}

export function parseKindParam(
  raw: string | undefined,
): "all" | "subscription" | "coaching" {
  if (raw === "subscription" || raw === "coaching") return raw;
  return "all";
}

export function parsePageParam(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}
