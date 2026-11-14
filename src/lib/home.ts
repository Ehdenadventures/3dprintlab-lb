import type { Category, Product } from "./types";

/** Most products a home section can show. */
export const MAX_HOME_PRODUCTS = 12;
/** Products a section shows when none are picked. */
export const DEFAULT_HOME_COUNT = 4;

/** One category block on the home page: its card and its row of products. */
export type HomeSection = {
  /** Category id (a main category or a subcategory). */
  id: string;
  show: boolean;
  /** How many products show when none are picked (0 = card only, no product row). */
  count: number;
  /** Products picked for this section, in order. Empty = automatic (the first `count` of the category). */
  products: string[];
};

/** What the home page shows, set in admin > Home page. */
export type HomeSettings = {
  /** The scrolling band of category names under the banner. */
  band: boolean;
  /** Sections in the order they show. Main categories missing from the list are added at the end. */
  sections: HomeSection[];
};

const clampCount = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(MAX_HOME_PRODUCTS, n)) : DEFAULT_HOME_COUNT;
};

export function cleanHome(raw: unknown): HomeSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const sections: HomeSection[] = [];
  if (Array.isArray(r.sections))
    for (const v of (r.sections as unknown[]).slice(0, 60)) {
      const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id.slice(0, 64) : "";
      if (!id || sections.some((s) => s.id === id)) continue;
      const products = Array.isArray(o.products)
        ? [...new Set((o.products as unknown[]).filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 64)))].slice(0, MAX_HOME_PRODUCTS)
        : [];
      sections.push({ id, show: o.show !== false, count: o.count === undefined ? DEFAULT_HOME_COUNT : clampCount(o.count), products });
    }
  return { band: r.band !== false, sections };
}

/** Every category id at or below `rootId` (a main category includes its subcategories). */
export function categoryTree(categories: Pick<Category, "id" | "parent_id">[], rootId: string): Set<string> {
  const ids = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories)
      if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
  }
  return ids;
}

/** The saved sections that still match a category, then any main category not in the list yet (shown, automatic). */
export function homeLayout(categories: Category[], settings: HomeSettings): HomeSection[] {
  const known = new Set(categories.map((c) => c.id));
  const out = settings.sections.filter((s) => known.has(s.id));
  for (const c of categories)
    if (!c.parent_id && !out.some((s) => s.id === c.id)) out.push({ id: c.id, show: true, count: DEFAULT_HOME_COUNT, products: [] });
  return out;
}

/** The products of one section, in order: the picked ones (if still in the category and visible) or the first `count`. */
export function sectionProducts<P extends Pick<Product, "id" | "category_id">>(
  section: HomeSection, categories: Pick<Category, "id" | "parent_id">[], products: P[],
): { items: P[]; total: number } {
  const ids = categoryTree(categories, section.id);
  const inCat = products.filter((p) => p.category_id && ids.has(p.category_id));
  if (!section.products.length) return { items: inCat.slice(0, section.count), total: inCat.length };
  const items = section.products.map((id) => inCat.find((p) => p.id === id)).filter((p): p is P => !!p);
  return { items, total: inCat.length };
}
