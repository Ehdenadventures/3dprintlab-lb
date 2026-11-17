import "server-only";
import { money, site } from "./site";
import type { Order } from "./types";

/*
 * Emails the shop owner when a new order comes in, using Resend (resend.com, free up to 100 emails a day).
 * Needs two Vercel variables: RESEND_API_KEY and ORDER_EMAIL_TO (the address that gets the emails).
 * Without them, orders still work and no email is sent.
 */

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const orderEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_TO);

function itemLine(i: Order["items"][number]) {
  const extras = [i.colour && `Colour: ${i.colour}`, i.material && `Filament: ${i.material}`, i.personalization && `Name: ${i.personalization}`]
    .filter(Boolean)
    .join(" · ");
  return { title: `${i.qty} × ${i.name}`, extras, price: money(i.price * i.qty) };
}

export function orderEmail(order: Order) {
  const items = order.items.map(itemLine);
  const payment = order.payment_method === "cash_on_delivery" ? "Cash on delivery" : order.payment_method;
  const phoneDigits = order.phone.replace(/\D/g, "");
  const wa = phoneDigits ? `https://wa.me/${phoneDigits.startsWith("961") ? phoneDigits : `961${phoneDigits.replace(/^0/, "")}`}` : "";
  const adminUrl = `${site.url.replace(/\/$/, "")}/admin`;

  const subject = `New order #${order.number}: ${money(order.total)} from ${order.customer_name}`;

  const text = [
    `New order #${order.number} on ${site.name}`,
    "",
    ...items.map((i) => `${i.title}  ${i.price}${i.extras ? `\n   ${i.extras}` : ""}`),
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${money(order.delivery_fee)}`,
    `Total: ${money(order.total)} (${payment})`,
    "",
    `Customer: ${order.customer_name}`,
    `Phone: ${order.phone}`,
    `Area: ${order.city}`,
    `Address: ${order.address}`,
    ...(order.notes ? [`Notes: ${order.notes}`] : []),
    "",
    `Open the orders page: ${adminUrl}`,
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${label}</td><td style="padding:4px 0">${value}</td></tr>`;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;max-width:560px">
<h2 style="margin:0 0 12px">New order #${order.number}</h2>
<table style="width:100%;border-collapse:collapse">
${items
  .map(
    (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee"><b>${esc(i.title)}</b>${
      i.extras ? `<br><span style="color:#666;font-size:13px">${esc(i.extras)}</span>` : ""
    }</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${esc(i.price)}</td></tr>`,
  )
  .join("\n")}
<tr><td style="padding:6px 0 0;color:#666">Subtotal</td><td style="padding:6px 0 0;text-align:right">${esc(money(order.subtotal))}</td></tr>
<tr><td style="padding:2px 0;color:#666">Delivery</td><td style="padding:2px 0;text-align:right">${esc(money(order.delivery_fee))}</td></tr>
<tr><td style="padding:6px 0"><b>Total (${esc(payment)})</b></td><td style="padding:6px 0;text-align:right"><b>${esc(money(order.total))}</b></td></tr>
</table>
<h3 style="margin:20px 0 8px">Customer</h3>
<table style="border-collapse:collapse">
${row("Name", esc(order.customer_name))}
${row("Phone", wa ? `<a href="${esc(wa)}">${esc(order.phone)}</a> (WhatsApp)` : esc(order.phone))}
${row("Area", esc(order.city))}
${row("Address", esc(order.address))}
${order.notes ? row("Notes", esc(order.notes)) : ""}
</table>
<p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open orders</a></p>
</div>`;

  return { subject, text, html };
}

/** Sends the new-order email. Never throws: a failed email must not fail the order. */
export async function sendOrderEmail(order: Order) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  if (!key || !to) return;
  const { subject, text, html } = orderEmail(order);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) console.error("Order email failed", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("Order email failed", e);
  }
}
