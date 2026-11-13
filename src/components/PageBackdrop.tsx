/* eslint-disable @next/next/no-img-element */
import type { BannerSettings } from "@/lib/types";

/** The default banner picture, very faint and fixed behind every shop page (strength set in admin > Banner). */
export default function PageBackdrop({ banner }: { banner: BannerSettings }) {
  if (!banner.image || !banner.page) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={banner.image} alt="" className="h-full w-full object-cover"
        style={{ opacity: banner.page / 100, objectPosition: `${banner.x}% ${banner.y}%` }} />
    </div>
  );
}
