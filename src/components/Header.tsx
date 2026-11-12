import Link from "next/link";
import { getCategories } from "@/lib/data";
import { instagramUrl, site } from "@/lib/site";
import { InstagramIcon } from "./Icons";
import CartButton from "./CartButton";
import Logo from "./Logo";

export default async function Header() {
  const top = (await getCategories()).filter((c) => !c.parent_id);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo height={28} />
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
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram @${site.instagram}`}
            title={`@${site.instagram} on Instagram`}
            className="rounded-lg p-2 text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <InstagramIcon className="h-6 w-6" />
          </a>
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
