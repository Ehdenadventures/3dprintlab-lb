"use client";
import type { Product } from "@/lib/types";
import { money } from "@/lib/site";
import { unitPrice } from "@/lib/stock";
import { useColour } from "./ColourContext";

/** The product price, updated as the customer picks a filament type and colour. */
export default function LivePrice({ p }: { p: Pick<Product, "price" | "variants" | "materials"> }) {
  const pick = useColour();
  return <p className="mt-2 text-2xl font-bold text-accent" aria-live="polite">{money(unitPrice(p, pick?.colour, pick?.material))}</p>;
}
