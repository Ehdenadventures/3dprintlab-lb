import type { Metadata } from "next";

// The cart is personal: keep it out of Google.
export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
