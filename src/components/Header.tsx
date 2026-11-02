import Link from "next/link";
import { getCategories } from "@/lib/data";
import { site } from "@/lib/site";
import CartButton from "./CartButton";

export default async function Header() {
  const top = (await getCategories()).filter((c) => !c.parent_id);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="layers inline-block h-7 w-7 rounded-md border border-line" aria-hidden />
          <span className="text-lg">{site.name}</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Categories">
          {top.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">
              {c.name}
            </Link>
          ))}
          <Link href="/custom" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">
            Custom orders
          </Link>
        </nav>
        <div className="ml-auto md:ml-2">
          <CartButton />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Categories">
        {top.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium">
            {c.name}
          </Link>
        ))}
        <Link href="/custom" className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium">
          Custom orders
        </Link>
      </nav>
    </header>
  );
}
