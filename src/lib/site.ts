// Shop settings. Change them in .env (or in Vercel > Settings > Environment Variables).
const env = (k: string, d = "") => process.env[k] || d;

export const site = {
  name: "3D PrintLab LB",
  tagline: "Designed and 3D printed in Lebanon",
  url: env("NEXT_PUBLIC_SITE_URL", "https://3dprintlab-lb.com"),
  // WhatsApp number in international format without + or spaces, e.g. 96170123456
  // Shop WhatsApp (country code + number, no + or spaces). Set here so an old Vercel setting can't override it.
  whatsapp: "96179499268",
  // Instagram username (no @). Set here so an old Vercel setting can't override it.
  instagram: "3dprintlab.lb",
  facebook: env("NEXT_PUBLIC_FACEBOOK_URL"),
  tiktok: env("NEXT_PUBLIC_TIKTOK_URL"),
  currency: "USD",
  deliveryFee: Number(env("NEXT_PUBLIC_DELIVERY_FEE_USD", "4")),
};

export const whatsappLink = (text: string) =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : "";

export const instagramUrl = `https://www.instagram.com/${site.instagram}/`;

export const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "")}`;
