import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categoryTree, getCategories, getProducts } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function Home() {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  const top = cats.filter((c) => !c.parent_id);
  return (
    <>
      <section className="layers -mx-4 mt-6 rounded-3xl border border-line bg-surface px-6 py-12 sm:mx-0 sm:px-10 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{site.tagline}</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Sports gear, everyday tools and Lebanese souvenirs, printed layer by layer.
        </h1>
        <p className="mt-4 max-w-xl text-ink-2">Order online and pay cash when it arrives. Delivery all over Lebanon.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/c/${top[0]?.slug ?? ""}`} className="btn btn-primary">Shop now</Link>
          <Link href="/custom" className="btn">Request a custom print</Link>
        </div>
      </section>

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
