import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { bannerSlides } from "@/lib/banner";
import HeroSlider from "@/components/HeroSlider";
import Logo from "@/components/Logo";
import { categoryTree, getBanner, getCategories, getProducts } from "@/lib/data";
import { money, site } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const [cats, products, banner] = await Promise.all([getCategories(), getProducts(), getBanner()]);
  const top = cats.filter((c) => !c.parent_id);
  // The products picked in admin > Banner (or the first 6 with a photo), each with its chosen photo.
  const slides = bannerSlides(products, banner.products).map(({ product: p, image }) => ({
    id: p.id, href: `/p/${p.slug}`, name: p.name, price: money(p.price), image,
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
                  <Link href={`/c/${top[0]?.slug ?? ""}`} className="btn btn-pink">Shop now</Link>
                  <Link href="/custom" className="btn btn-ghost-dark">Request a custom print</Link>
                </div>
              </div>
              <div className="hidden shrink-0 lg:block"><Logo height={52} onDark /></div>
            </div>
          </div>
        }
      />

      <section className="mt-12 grid gap-4 sm:grid-cols-3" aria-label="Categories">
        {top.map((c) => {
          const ids = categoryTree(cats, c.id);
          const n = products.filter((p) => p.category_id && ids.has(p.category_id)).length;
          const subs = cats.filter((s) => s.parent_id === c.id);
          return (
            <Link key={c.id} href={`/c/${c.slug}`} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-ink-3">
              <h2 className="text-xl font-bold">{c.name}</h2>
              <p className="mt-1 text-sm text-ink-2">{c.description}</p>
              <p className="mt-3 text-xs text-ink-3">{subs.map((s) => s.name).join(" · ")}</p>
              <p className="mt-3 text-sm font-semibold text-accent">{n} items →</p>
            </Link>
          );
        })}
      </section>

      {top.map((c) => {
        const ids = categoryTree(cats, c.id);
        const items = products.filter((p) => p.category_id && ids.has(p.category_id)).slice(0, 4);
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
    </>
  );
}
