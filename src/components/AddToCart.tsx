"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";

type Props = { productId: string; slug: string; name: string; price: number; image?: string; personalizable: boolean };

export default function AddToCart(p: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [text, setText] = useState("");
  const [added, setAdded] = useState(false);
  const needsText = p.personalizable && !text.trim();

  return (
    <div className="mt-6 space-y-4">
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
          <button className="px-3 py-2 text-lg" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="More">+</button>
        </div>
        <button
          className="btn btn-primary flex-1"
          disabled={needsText}
          onClick={() => {
            add({ productId: p.productId, slug: p.slug, name: p.name, price: p.price, image: p.image, personalization: text }, qty);
            setAdded(true);
          }}
        >
          Add to cart
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
