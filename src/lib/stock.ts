import type { Material, Product, Variant } from "./types";
import { money } from "./site";

/** Safe to use in the browser and on the server. null = no limit. */
export const hasColours = (p: Pick<Product, "variants">) => p.variants.length > 0;

export function stockFor(p: Pick<Product, "stock" | "variants">, colour?: string): number | null {
  if (hasColours(p)) {
    const v = p.variants.find((x) => x.name === colour);
    return v ? v.stock : 0;
  }
  return p.stock;
}

export function isSoldOut(p: Pick<Product, "stock" | "variants">) {
  return hasColours(p) ? p.variants.every((v) => v.stock === 0) : p.stock === 0;
}

export function cleanVariants(raw: unknown): Variant[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Variant[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    const name = String(r?.name ?? "").trim().slice(0, 40);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const hex = /^#[0-9a-f]{6}$/i.test(String(r?.hex)) ? String(r.hex) : "#888888";
    const s = r?.stock;
    const stock = s === null || s === undefined || s === "" ? null : Math.max(0, Math.floor(Number(s)) || 0);
    const image = typeof r?.image === "string" && /^https?:\/\//.test(r.image) ? r.image : undefined;
    const extra = cleanExtra(r?.extra);
    out.push({ name, hex, stock, ...(image ? { image } : {}), ...(extra ? { extra } : {}) });
  }
  return out.slice(0, 30);
}

/** An extra price: a number rounded to cents, 0 when empty or not a number. */
function cleanExtra(v: unknown) {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n) ? 0 : Math.max(-100000, Math.min(100000, Math.round(n * 100) / 100));
}

export function cleanMaterials(raw: unknown): Material[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Material[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    const name = String(r?.name ?? "").trim().slice(0, 40);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({ name, extra: cleanExtra(r?.extra) });
  }
  return out.slice(0, 20);
}

type Priced = Pick<Product, "price" | "variants" | "materials">;
const cents = (n: number) => Math.max(0, Math.round(n * 100) / 100);

/** Price of one piece with the picked filament type and colour. */
export function unitPrice(p: Priced, colour?: string, material?: string) {
  const c = p.variants.find((v) => v.name === colour)?.extra ?? 0;
  const m = (p.materials ?? []).find((x) => x.name === material)?.extra ?? 0;
  return cents(p.price + c + m);
}

/** Cheapest and dearest price over the filament types and the colours still in stock. */
export function priceRange(p: Priced) {
  const mats = (p.materials ?? []).map((m) => m.extra);
  const cols = p.variants.filter((v) => v.stock !== 0).map((v) => v.extra ?? 0);
  const lo = (xs: number[]) => (xs.length ? Math.min(...xs) : 0);
  const hi = (xs: number[]) => (xs.length ? Math.max(...xs) : 0);
  return { min: cents(p.price + lo(mats) + lo(cols)), max: cents(p.price + hi(mats) + hi(cols)) };
}

/** "$12", or "From $12" when the options change the price. */
export function priceLabel(p: Priced) {
  const { min, max } = priceRange(p);
  return max > min ? `From ${money(min)}` : money(min);
}

/** "+$3" / "−$2" next to an option, or "" when it doesn't change the price. */
export const extraLabel = (n?: number) => (!n ? "" : n > 0 ? `+${money(n)}` : `−${money(-n)}`);
