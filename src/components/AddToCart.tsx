"use client";
import { useState } from "react";
import Link from "next/link";
import type { Material, Variant } from "@/lib/types";
import { money } from "@/lib/site";
import { extraLabel, unitPrice } from "@/lib/stock";
import { useCart } from "./CartProvider";
import { useColour } from "./ColourContext";

type Props = {
  productId: string; slug: string; name: string; price: number; image?: string; personalizable: boolean;
  /** Stock when the product has no colours. null = no limit. */
  stock: number | null;
  colours: Variant[];
  materials?: Material[];
};

export default function AddToCart(p: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [text, setText] = useState("");
  const [added, setAdded] = useState(false);
  const local = useState(p.colours.find((c) => c.stock !== 0)?.name ?? "");
  const shared = useColour();
  const [colour, setColour] = shared ? [shared.colour, shared.setColour] : local;
  const materials = p.materials ?? [];
  const localMat = useState(materials[0]?.name ?? "");
  const [material, setMaterial] = shared ? [shared.material, shared.setMaterial] : localMat;
  const chosenMat = materials.find((m) => m.name === material);
  const price = unitPrice({ price: p.price, variants: p.colours, materials }, colour, chosenMat?.name);

  const chosen = p.colours.find((c) => c.name === colour);
  const left = p.colours.length ? (chosen ? chosen.stock : 0) : p.stock;
  const max = Math.min(99, left ?? 99);
  const needsText = p.personalizable && !text.trim();
  const blocked = needsText || (p.colours.length > 0 && !chosen) || (materials.length > 0 && !chosenMat) || left === 0;

  return (
    <div className="mt-6 space-y-4">
      {materials.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            Filament: <span className="font-normal text-ink-2">{material || "choose one"}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {materials.map((m) => {
              const on = m.name === material;
              return (
                <button
                  key={m.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { setMaterial(m.name); setAdded(false); }}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-accent ring-2 ring-accent" : "border-line hover:border-ink-3"}`}
                >
                  {m.name}
                  {extraLabel(m.extra) && <span className="ml-1.5 text-ink-3">{extraLabel(m.extra)}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {p.colours.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            Colour: <span className="font-normal text-ink-2">{colour || "choose one"}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {p.colours.map((c) => {
              const out = c.stock === 0;
              const on = c.name === colour;
              return (
                <button
                  key={c.name}
                  type="button"
                  disabled={out}
                  aria-pressed={on}
                  title={out ? `${c.name} (sold out)` : c.name}
                  onClick={() => { setColour(c.name); setQty((q) => Math.min(q, Math.min(99, c.stock ?? 99))); setAdded(false); }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-accent ring-2 ring-accent" : "border-line hover:border-ink-3"} ${out ? "cursor-not-allowed opacity-45 line-through" : ""}`}
                >
                  <span className="h-5 w-5 rounded-full border border-line" style={{ background: c.hex }} />
                  {c.name}
                  {extraLabel(c.extra) && <span className="text-ink-3">{extraLabel(c.extra)}</span>}
                </button>
              );
            })}
          </div>
          {chosen && chosen.stock !== null && chosen.stock > 0 && chosen.stock <= 5 && (
            <p className="mt-2 text-sm font-semibold text-[#c44a16] dark:text-pink">Only {chosen.stock} left in {chosen.name}</p>
          )}
        </fieldset>
      )}
      {p.personalizable && (
        <div className="field">
          <label htmlFor="pers">Name to print</label>
          <input id="pers" className="input" maxLength={30} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Chafic" />
          <span className="text-xs text-ink-3">Up to 30 characters. We print it exactly as written.</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-line bg-surface">
          <button className="px-3 py-2 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button className="px-3 py-2 text-lg" onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="More">+</button>
        </div>
        <button
          className="btn btn-primary flex-1"
          disabled={blocked}
          onClick={() => {
            add({ productId: p.productId, slug: p.slug, name: p.name, price, image: chosen?.image ?? p.image, personalization: text, colour: chosen?.name, material: chosenMat?.name }, qty);
            setAdded(true);
          }}
        >
          Add to cart{(materials.length > 0 || p.colours.some((c) => c.extra)) && ` · ${money(price * qty)}`}
        </button>
      </div>
      {added && (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm">
          Added to your cart. <Link href="/cart" className="font-semibold underline">Go to checkout</Link>
        </p>
      )}
    </div>
  );
}
