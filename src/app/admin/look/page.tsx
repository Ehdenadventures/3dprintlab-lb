import { requireAdmin } from "@/lib/auth";
import { getBanner, getProducts, isDemo } from "@/lib/data";
import { photosOf } from "@/lib/banner";
import AdminNav from "../AdminNav";
import BannerForm from "./BannerForm";

export const dynamic = "force-dynamic";

export default async function LookAdmin() {
  await requireAdmin();
  const [banner, products] = await Promise.all([getBanner(), getProducts()]);
  // Visible products only: hidden ones never show on the banner.
  const choices = products.map((p) => ({ id: p.id, name: p.name, photos: photosOf(p) }));
  return (
    <>
      <AdminNav active="look" />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold">Home banner</h1>
        <p className="text-sm text-ink-2">Choose which products the big rotating banner shows, in what order and with which photo. Then give each slide of the big rotating banner its own background picture (for example the print studio or a finished piece). For each one, choose how strong it shows and which part of the picture stays in view. Slides without their own picture use the default picture at the top.</p>
        <BannerForm initial={banner} products={choices} uploads={!isDemo()} />
      </main>
    </>
  );
}
