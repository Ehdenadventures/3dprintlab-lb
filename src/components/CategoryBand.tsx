import Link from "next/link";
import type { Category } from "@/lib/types";

/** A band of category names that keeps scrolling sideways under the home banner. Each name opens its category.
 *  It pauses on hover or keyboard focus, and stands still (swipeable) for people who turn off motion. */
export default function CategoryBand({ categories }: { categories: Category[] }) {
  // Main categories, each followed by its subcategories.
  const list = categories.filter((c) => !c.parent_id).flatMap((c) => [c, ...categories.filter((s) => s.parent_id === c.id)]);
  if (!list.length) return null;
  const row = (copy: boolean) => (
    <ul className="band-row" aria-hidden={copy || undefined}>
      {list.map((c) => (
        <li key={c.id} className="flex items-center">
          <Link href={`/c/${c.slug}`} tabIndex={copy ? -1 : undefined}
            className={`whitespace-nowrap rounded-full px-3 py-1 hover:bg-white/15 hover:underline ${c.parent_id ? "font-medium text-white/90" : "font-extrabold uppercase tracking-wider"}`}>
            {c.name}
          </Link>
          <span aria-hidden className="mx-2 h-1.5 w-1.5 rotate-45 bg-white/60" />
        </li>
      ))}
    </ul>
  );
  return (
    <nav aria-label="All categories" className="band -mx-4 mt-3 overflow-hidden bg-[#c44a16] py-2.5 text-sm text-white sm:mx-0 sm:rounded-2xl">
      <div className="band-track" style={{ animationDuration: `${Math.max(20, list.length * 3)}s` }}>
        {row(false)}
        {row(true)}
      </div>
    </nav>
  );
}
