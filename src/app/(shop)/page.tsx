import Link from "next/link";
import type { Metadata } from "next";
import { priceLabel } from "@/lib/stock";
import ProductCard, { cover } from "@/components/ProductCard";
import CategoryBand from "@/components/CategoryBand";
import { CubeIcon } from "@/components/Icons";
import { homeLayout, sectionProducts } from "@/lib/home";
import { bannerSlides } from "@/lib/banner";
import HeroSlider from "@/components/HeroSlider";
import Logo from "@/components/Logo";
import { categoryTree, getBanner, getCategories, getHome, getProducts } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 60;
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [cats, products, banner, home] = await Promise.all([getCategories(), getProducts(), getBanner(), getHome()]);
  // The category sections chosen in admin > Home page, in that order, each with its products.
  const sections = homeLayout(cats, home)
    .filter((s) => s.show)
    .map((s) => ({ c: cats.find((c) => c.id === s.id)!, ...sectionProducts(s, cats, products) }));
  const top = cats.filter((c) => !c.parent_id);
  // The products picked in admin > Banner (or the first 6 with a photo), each with its chosen photo.
  const slides = bannerSlides(products, banner.products).map(({ product: p, image }) => ({
    id: p.id, href: `/p/${p.slug}`, name: p.name, price: priceLabel(p), image,
    label: cats.find((c) => c.id === p.category_id)?.name ?? site.tagline,
  }));
  return (
    <>
      <HeroSlider
        background={banner}
        products={slides}
        main={
          <div className="min-h-[420px] px-6 py-12 sm:px-12 sm:py-16">
            <div className="flex items-center justify-between gap-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ff8a52]">{site.tagline}</p>
                <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
                  Sports gear, everyday tools and Lebanese souvenirs, <span className="highlight">built layer by layer.</span>
                </h1>
                <p className="mt-5 max-w-xl text-[#dfe1f5]">Order online and pay cash when it arrives. Delivery all over Lebanon.</p>
                <p lang="ar" dir="rtl" className="mt-2 w-fit text-[#dfe1f5]" style={{ fontFamily: "'Readex Pro', sans-serif" }}>
                  اطلب أونلاين واِدفع عند الاستلام
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={`/c/${sections[0]?.c.slug ?? top[0]?.slug ?? ""}`} className="btn btn-pink">Shop now</Link>
                  <Link href="/custom" className="btn btn-ghost-dark">Request a custom print</Link>
                </div>
              </div>
              <div className="hidden shrink-0 lg:block"><Logo height={52} onDark /></div>
            </div>
          </div>
        }
      />

      {home.band && <CategoryBand categories={cats} />}

      {sections.length > 0 && (
        <section className="cat-panel mt-10 rounded-3xl p-4 sm:p-6" aria-labelledby="shop-by-category">
          <h2 id="shop-by-category" className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-accent">Shop by category</h2>
          <div className={`grid gap-4 sm:grid-cols-2 ${sections.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {sections.map(({ c, items, total }) => {
              const subs = cats.filter((s) => s.parent_id === c.id);
              const img = [...items, ...products.filter((p) => p.category_id && categoryTree(cats, c.id).has(p.category_id))].map(cover).find(Boolean);
              return (
                <Link key={c.id} href={`/c/${c.slug}`} className="cat-card group flex flex-col overflow-hidden rounded-2xl bg-surface transition hover:-translate-y-0.5">
                  <div className="relative h-28 overflow-hidden bg-[#283189]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={c.name} loading="lazy" className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[repeating-linear-gradient(0deg,rgb(255_255_255/.08)_0_3px,transparent_3px_10px)] text-[#ff8a52]">
                        <CubeIcon className="h-12 w-12" />
                      </div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-[#ed632c]" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-bold">{c.name}</h3>
                    {c.description && <p className="mt-1 text-sm text-ink-2">{c.description}</p>}
                    {subs.length > 0 && <p className="mt-2 text-xs text-ink-3">{subs.map((s) => s.name).join(" · ")}</p>}
                    <p className="mt-auto pt-3 text-sm font-semibold text-[#c44a16] dark:text-[#ff8a52]">{total} items →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {sections.map(({ c, items }) => {
        if (!items.length) return null;
        return (
          <section key={c.id} className="mt-12">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">{c.name}</h2>
              <Link href={`/c/${c.slug}`} className="text-sm font-semibold text-accent">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </section>
        );
      })}

      <section className="mt-16 rounded-3xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="about-3d-printing">
        <h2 id="about-3d-printing" className="text-2xl font-bold">3D printing in Lebanon</h2>
        <div className="mt-3 grid gap-6 text-sm text-ink-2 md:grid-cols-3">
          <p>
            {site.name} is a 3D printing shop in Zgharta, North Lebanon. We design and 3D print sports gear for armwrestling,
            cycling, running and the gym, everyday items for home, office and car, and Lebanese souvenirs and gifts. We also take
            {" "}<Link href="/custom" className="font-semibold text-accent">custom 3D printing orders</Link> from your idea or STL file,
            and deliver all over Lebanon, from Beirut and Jounieh to Tripoli, Zgharta and Ehden, with cash on delivery.
          </p>
          <p lang="ar" dir="rtl" style={{ fontFamily: "'Readex Pro', sans-serif" }}>
            طباعة ثلاثية الأبعاد في لبنان: معدات رياضية، أغراض للاستعمال اليومي، هدايا وتذكارات لبنانية، وطباعة حسب الطلب.
            نصمم ونطبع في زغرتا ونوصل إلى كل المناطق اللبنانية مع الدفع عند الاستلام.
          </p>
          <p lang="fr">
            Impression 3D au Liban : accessoires de sport, objets du quotidien, cadeaux et souvenirs libanais, et impressions
            sur mesure. Conçu et imprimé à Zgharta, livraison partout au Liban, paiement à la livraison.
          </p>
        </div>
      </section>
    </>
  );
}
