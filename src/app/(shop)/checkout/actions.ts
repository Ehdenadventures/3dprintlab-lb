"use server";
import { createOrder, getProductById, updateOrder } from "@/lib/data";
import { site } from "@/lib/site";
import type { OrderItem } from "@/lib/types";
import { sendToWakilni, wakilniAutoSend } from "@/lib/wakilni";

export type CheckoutInput = {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: { productId: string; qty: number; personalization: string }[];
};

export type CheckoutResult = { ok: true; orderId: string } | { ok: false; error: string };

const clean = (s: unknown, max: number) => String(s ?? "").trim().slice(0, max);

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = clean(input.name, 80);
  const phone = clean(input.phone, 30);
  const city = clean(input.city, 80);
  const address = clean(input.address, 300);
  const notes = clean(input.notes, 500);
  if (!name || !phone || !city || !address) return { ok: false, error: "Please fill in your name, phone, area and address." };
  if (phone.replace(/\D/g, "").length < 7) return { ok: false, error: "Please check your phone number." };
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 50) return { ok: false, error: "Your cart is empty." };

  // Prices always come from the database, never from the browser.
  const items: OrderItem[] = [];
  for (const it of input.items) {
    const p = await getProductById(String(it.productId));
    if (!p || !p.active) return { ok: false, error: "An item in your cart is no longer available. Please remove it and try again." };
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    const personalization = clean(it.personalization, 30);
    if (p.personalizable && !personalization) return { ok: false, error: `Please add the name to print for "${p.name}".` };
    items.push({ product_id: p.id, slug: p.slug, name: p.name, price: p.price, qty, personalization });
  }
  const subtotal = Math.round(items.reduce((a, i) => a + i.price * i.qty, 0) * 100) / 100;
  const delivery_fee = site.deliveryFee;
  const total = subtotal + delivery_fee;

  try {
    const order = await createOrder({ customer_name: name, phone, city, address, notes, items, subtotal, delivery_fee, total });
    if (wakilniAutoSend()) {
      try {
        const ref = await sendToWakilni(order);
        await updateOrder(order.id, { delivery_status: "sent", delivery_ref: ref, delivery_error: null });
      } catch (e) {
        // The order is saved either way; the admin page shows the error and a retry button.
        await updateOrder(order.id, { delivery_status: "failed", delivery_error: (e as Error).message });
      }
    }
    return { ok: true, orderId: order.id };
  } catch (e) {
    console.error("placeOrder failed", e);
    return { ok: false, error: "We couldn't save your order. Please try again, or message us on WhatsApp." };
  }
}
