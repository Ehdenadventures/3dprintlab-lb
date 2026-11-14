"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { categoryTree, MAX_HOME_PRODUCTS, sectionProducts, type HomeSection } from "@/lib/home";
import type { Category } from "@/lib/types";
import { saveHomeAction } from "../actions";

type Cat = Pick<Category, "id" | "name" | "parent_id">;
type Item = { id: string; name: string; category_id: string | null; photo: string };

const swap = <T,>(list: T[], i: number, d: number) => {
  const next = [...list];
  [next[i], next[i + d]] = [next[i + d], next[i]];
  return next;
};

function Thumb({ src }: { src: string }) {
  return src
    ? <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
    : <span className="layers h-10 w-10 shrink-0 rounded-md bg-surface-2" />;
}

function SectionEditor({ s, i, last, cat, parent, categories, products, onChange, onMove, onRemove }: {
  s: HomeSection; i: number; last: boolean; cat: Cat; parent?: Cat; categories: Cat[]; products: Item[];
  onChange: (s: HomeSection) => void; onMove: (d: number) => void; onRemove?: () => void;
}) {
  const ids = categoryTree(categories, s.id);
  const inCat = products.filter((p) => p.category_id && ids.has(p.category_id));
  const byId = new Map(inCat.map((p) => [p.id, p]));
  const auto = !s.products.length;
  const { items } = sectionProducts(s, categories, inCat);
  const addable = inCat.filter((p) => !s.products.includes(p.id));
  return (
    <li className={`space-y-3 rounded-2xl border border-line bg-surface p-4 ${s.show ? "" : "opacity-70"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-6 shrink-0 text-sm font-bold text-ink-3">{i + 1}.</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{cat.name}</p>
          {parent && <p className="text-xs text-ink-3">inside {parent.name}</p>}
        </div>
        <button type="button" className="btn px-2.5 py-1 text-sm" aria-label={`Move ${cat.name} up`} disabled={i === 0} onClick={() => onMove(-1)}>↑</button>
        <button type="button" className="btn px-2.5 py-1 text-sm" aria-label={`Move ${cat.name} down`} disabled={last} onClick={() => onMove(1)}>↓</button>
        {onRemove && <button type="button" className="px-1 text-sm text-bad" onClick={onRemove}>Remove</button>}
      </div>
      <label className="flex items-center gap-2 pl-8 text-sm">
        <input type="checkbox" checked={s.show} onChange={(e) => onChange({ ...s, show: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
        Show on the home page
      </label>

      {s.show && (
        <div className="space-y-2 pl-8">
          {auto ? (
            <>
              <label className="flex flex-wrap items-center gap-2 text-sm">
                Show the first
                <select className="input py-1" style={{ width: "auto" }} value={s.count} aria-label={`How many products for ${cat.name}`}
                  onChange={(e) => onChange({ ...s, count: Number(e.target.value) })}>
                  {Array.from({ length: MAX_HOME_PRODUCTS + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                </select>
                products {s.count === 0 && <span className="text-ink-3">(card only, no product row)</span>}
              </label>
              {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((p) => <span key={p.id} title={p.name}><Thumb src={p.photo} /></span>)}
                </div>
              )}
              {inCat.length > 0 ? (
                <button type="button" className="text-sm font-semibold text-accent"
                  onClick={() => onChange({ ...s, products: (items.length ? items : inCat.slice(0, 4)).map((p) => p.id) })}>
                  Pick the products and their order myself
                </button>
              ) : <p className="text-xs text-ink-3">No products in this category yet.</p>}
            </>
          ) : (
            <>
              <ol className="space-y-1.5">
                {s.products.map((id, k) => {
                  const p = byId.get(id);
                  return (
                    <li key={id} className="flex items-center gap-2 rounded-lg border border-line p-1.5">
                      <Thumb src={p?.photo ?? ""} />
                      <p className="min-w-0 flex-1 truncate text-sm">{p?.name ?? "No longer in this category (skipped)"}</p>
                      <button type="button" className="btn px-2 py-0.5 text-sm" aria-label={`Move ${p?.name ?? "product"} up`} disabled={k === 0}
                        onClick={() => onChange({ ...s, products: swap(s.products, k, -1) })}>↑</button>
                      <button type="button" className="btn px-2 py-0.5 text-sm" aria-label={`Move ${p?.name ?? "product"} down`} disabled={k === s.products.length - 1}
                        onClick={() => onChange({ ...s, products: swap(s.products, k, 1) })}>↓</button>
                      <button type="button" className="px-1 text-sm text-bad" aria-label={`Remove ${p?.name ?? "product"}`}
                        onClick={() => onChange({ ...s, products: s.products.filter((x) => x !== id) })}>✕</button>
                    </li>
                  );
                })}
              </ol>
              {s.products.length < MAX_HOME_PRODUCTS && addable.length > 0 && (
                <select className="input" value="" aria-label={`Add a product to ${cat.name}`}
                  onChange={(e) => e.target.value && onChange({ ...s, products: [...s.products, e.target.value] })}>
                  <option value="">+ Add a product…</option>
                  {addable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <button type="button" className="text-sm text-ink-2 underline" onClick={() => onChange({ ...s, products: [] })}>
                Go back to automatic
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default function HomeForm({ band: initialBand, initial, categories, products }: {
  band: boolean; initial: HomeSection[]; categories: Cat[]; products: Item[];
}) {
  const [band, setBand] = useState(initialBand);
  const [sections, setSections] = useState(initial);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const byId = new Map(categories.map((c) => [c.id, c]));
  const addable = categories.filter((c) => c.parent_id && !sections.some((s) => s.id === c.id));

  function save() {
    setError(""); setMsg("");
    start(async () => {
      const r = await saveHomeAction({ band, sections });
      if (r.error) setError(r.error);
      else setMsg("Saved. The home page shows it now.");
    });
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-semibold">Category band</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={band} onChange={(e) => setBand(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Show the scrolling band of category names under the banner
        </label>
      </section>

      <h2 className="pt-2 text-lg font-bold">Categories on the home page</h2>
      <p className="text-sm text-ink-2">Top to bottom is the order on the home page. Untick a category to hide it from the home page (it stays in the shop). You can also add a subcategory, for example Armwrestling, as its own section.</p>
      <ol className="space-y-3">
        {sections.map((s, i) => {
          const cat = byId.get(s.id);
          if (!cat) return null;
          return (
            <SectionEditor key={s.id} s={s} i={i} last={i === sections.length - 1} cat={cat}
              parent={cat.parent_id ? byId.get(cat.parent_id) : undefined} categories={categories} products={products}
              onChange={(v) => setSections(sections.map((x, k) => (k === i ? v : x)))}
              onMove={(d) => setSections(swap(sections, i, d))}
              onRemove={cat.parent_id ? () => setSections(sections.filter((_, k) => k !== i)) : undefined} />
          );
        })}
      </ol>
      {addable.length > 0 && (
        <select className="input" value="" aria-label="Add a subcategory as its own section"
          onChange={(e) => e.target.value && setSections([...sections, { id: e.target.value, show: true, count: 4, products: [] }])}>
          <option value="">+ Add a subcategory as its own section…</option>
          {addable.map((c) => <option key={c.id} value={c.id}>{c.name} (inside {byId.get(c.parent_id!)?.name})</option>)}
        </select>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <button type="button" className="btn btn-primary" onClick={save} disabled={pending}>{pending ? "Saving..." : "Save home page"}</button>
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        {msg && <p className="text-sm text-ink-2" aria-live="polite">{msg}</p>}
      </div>
    </div>
  );
}
