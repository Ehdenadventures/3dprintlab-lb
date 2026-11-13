import type { BannerPick, Product } from "./types";

/** The most products the banner can show. */
export const MAX_BANNER_PRODUCTS = 10;

export const photosOf = (p: Pick<Product, "media">) => p.media.filter((m) => m.type === "image").map((m) => m.url);

/**
 * The product slides of the home banner, in order, each with the photo to show.
 * With products picked in admin > Banner: those, in that order (skipping hidden ones or ones without a photo).
 * With none picked: the first 6 products that have a photo.
 */
export function bannerSlides<P extends Pick<Product, "id" | "media">>(products: P[], picks: BannerPick[]): { product: P; image: string }[] {
  if (!picks.length)
    return products.filter((p) => photosOf(p).length).slice(0, 6).map((p) => ({ product: p, image: photosOf(p)[0] }));
  const out: { product: P; image: string }[] = [];
  for (const pick of picks) {
    const p = products.find((x) => x.id === pick.id);
    const photos = p ? photosOf(p) : [];
    if (!p || !photos.length) continue;
    out.push({ product: p, image: photos.includes(pick.image) ? pick.image : photos[0] });
  }
  return out;
}
