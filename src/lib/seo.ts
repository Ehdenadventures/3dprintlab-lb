import type { Category, Product } from "./types";
import { isSoldOut, priceRange } from "./stock";
import { instagramUrl, money, site } from "./site";

/*
 * Search engine text and Google structured data (JSON-LD).
 * Titles and descriptions are written automatically from each product's name, category and price,
 * with the words people in Lebanon search for. A product can override them in admin > product > Google.
 */

/** Phrases people search for, in English, Arabic and French. Used on the home page and in the shop's data. */
export const KEYWORDS = [
  "3D printing Lebanon",
  "3D printing Beirut",
  "3D printed gifts Lebanon",
  "3D printing shop Lebanon",
  "custom 3D printing Lebanon",
  "3D print Zgharta",
  "طباعة ثلاثية الأبعاد لبنان",
  "طباعة 3D لبنان",
  "impression 3D Liban",
];

export const HOME_TITLE = "3D Printing in Lebanon | 3D Printed Gifts, Sports Gear & Souvenirs";
export const HOME_DESCRIPTION =
  "3D printing shop in Lebanon: 3D printed sports gear, everyday items, gifts and Lebanese souvenirs, plus custom prints. Order online, cash on delivery all over Lebanon.";

/** Cuts text to about n characters at a word boundary. */
export function clip(text: string, n: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), n / 2)).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** The first sentence of a description, so the generated text stays short. */
const firstSentence = (s: string) => (s.replace(/\s+/g, " ").trim().match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim();

/** Per product overrides typed in admin. Empty strings mean "write it automatically". */
export type SeoText = { title: string; description: string };
export type SeoSettings = { products: Record<string, SeoText> };

export function cleanSeo(raw: unknown): SeoSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const products: Record<string, SeoText> = {};
  if (r.products && typeof r.products === "object")
    for (const [k, v] of Object.entries(r.products as Record<string, unknown>).slice(0, 2000)) {
      const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title.trim().slice(0, 120) : "";
      const description = typeof o.description === "string" ? o.description.trim().slice(0, 320) : "";
      if (title || description) products[k.slice(0, 64)] = { title, description };
    }
  return { products };
}

/** The category a product sits in, written for a search result ("3D Printed Cycling"). */
function kind(cat?: Category | null, parent?: Category | null) {
  return cat ? `${parent ? `${parent.name} › ` : ""}${cat.name}` : "";
}

/** Title shown in Google for a product page; " | 3D PrintLab LB" is added after it. */
export function productTitle(p: Product, override?: SeoText) {
  if (override?.title) return override.title;
  return `${p.name} | 3D Printed in Lebanon`;
}

export function productDescription(p: Product, cat?: Category | null, override?: SeoText) {
  if (override?.description) return override.description;
  const { min } = priceRange(p);
  const area = cat ? ` ${cat.name.toLowerCase()}` : "";
  const lead = p.description ? clip(firstSentence(p.description), 95) : `${p.name}, a 3D printed${area} item.`;
  const sep = /[.!?…]$/.test(lead) ? " " : ". ";
  const tail = `3D printed in Lebanon${min > 0 ? `, from ${money(min)}` : ""}. Cash on delivery all over Lebanon.`;
  return clip(`${lead}${sep}${tail}`, 165);
}

export function categoryTitle(c: Category) {
  return `${c.name} | 3D Printed in Lebanon`;
}

export function categoryDescription(c: Category, parent?: Category | null, subs: Category[] = []) {
  const what = c.description || `3D printed ${c.name.toLowerCase()} items${parent ? ` from our ${parent.name.toLowerCase()} range` : ""}${subs.length ? `: ${subs.map((s) => s.name).join(", ")}` : ""}.`;
  const sep = /[.!?…]$/.test(what) ? " " : ". ";
  return clip(`${what}${sep}Designed and 3D printed in Lebanon. Order online, cash on delivery all over Lebanon.`, 165);
}

/* ---------------- structured data for Google ---------------- */

const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${site.url}${u.startsWith("/") ? "" : "/"}${u}`);
const ORG_ID = `${site.url}/#store`;

export const sameAs = () => [instagramUrl, site.facebook, site.tiktok].filter(Boolean);

/** The shop itself: a store in Zgharta that delivers all over Lebanon. Shown once on every page. */
export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Store", "OnlineStore"],
        "@id": ORG_ID,
        name: site.name,
        alternateName: ["3D PrintLab", "3DPrintLab LB", "3D PrintLab Lebanon"],
        description: HOME_DESCRIPTION,
        url: site.url,
        logo: abs("/logo-3dprintlab.png"),
        image: abs("/banner-studio.jpg"),
        telephone: site.phone,
        priceRange: "$",
        currenciesAccepted: site.currency,
        paymentAccepted: "Cash on delivery",
        address: {
          "@type": "PostalAddress",
          ...(site.address.street && { streetAddress: site.address.street }),
          addressLocality: site.address.locality,
          ...(site.address.region && { addressRegion: site.address.region }),
          addressCountry: "LB",
        },
        areaServed: { "@type": "Country", name: "Lebanon" },
        knowsAbout: ["3D printing", "Custom 3D printing", "3D printed gifts", "3D printed sports accessories"],
        keywords: KEYWORDS.join(", "),
        sameAs: sameAs(),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: site.phone,
          areaServed: "LB",
          availableLanguage: ["English", "Arabic", "French"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function productJsonLd(p: Product, cat?: Category | null, parent?: Category | null, override?: SeoText) {
  const url = `${site.url}/p/${p.slug}`;
  const images = p.media.filter((m) => m.type === "image").map((m) => abs(m.url));
  const { min, max } = priceRange(p);
  const availability = isSoldOut(p) ? "https://schema.org/OutOfStock" : p.stock === null && !p.variants.length ? "https://schema.org/MadeToOrder" : "https://schema.org/InStock";
  // Prices are valid for a year; Google wants a date when there is one.
  const until = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);
  const shipping = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: site.deliveryFee, currency: site.currency },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "LB" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
    },
  };
  const common = { priceCurrency: site.currency, availability, itemCondition: "https://schema.org/NewCondition", url, seller: { "@id": ORG_ID } };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.description || productDescription(p, cat, override),
    sku: p.slug,
    url,
    ...(images.length && { image: images }),
    brand: { "@type": "Brand", name: site.name },
    ...(cat && { category: kind(cat, parent) }),
    material: p.materials.length ? p.materials.map((m) => m.name).join(", ") : "3D printed plastic",
    ...(p.variants.length && { color: p.variants.map((v) => v.name).join(", ") }),
    countryOfOrigin: { "@type": "Country", name: "Lebanon" },
    offers:
      max > min
        ? { "@type": "AggregateOffer", lowPrice: min, highPrice: max, ...common, shippingDetails: shipping, priceValidUntil: until }
        : { "@type": "Offer", price: min, priceValidUntil: until, ...common, shippingDetails: shipping },
  };
}

export function categoryJsonLd(c: Category, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${c.name} – 3D printed in Lebanon`,
    url: `${site.url}/c/${c.slug}`,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/p/${p.slug}`, name: p.name })),
    },
  };
}

/** Picture shared on WhatsApp, Facebook and Instagram when a page has no photo of its own. */
export const DEFAULT_SHARE_IMAGE = { url: "/banner-studio.jpg", alt: `${site.name} 3D printing studio in Lebanon` };

/** A <script type="application/ld+json"> body that can't break out of the tag. */
export const ldJson = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
