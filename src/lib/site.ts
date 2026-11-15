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
  // Where the shop is and its phone, for Google. Keep these exactly as on the Google Business Profile.
  address: {
    street: env("NEXT_PUBLIC_SHOP_STREET", "Main street"),
    locality: env("NEXT_PUBLIC_SHOP_TOWN", "Zgharta"),
    region: env("NEXT_PUBLIC_SHOP_REGION"),
  },
  phone: "+961 79 499 268",
  currency: "USD",
  deliveryFee: Number(env("NEXT_PUBLIC_DELIVERY_FEE_USD", "4")),
};

export const whatsappLink = (text: string) =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : "";

export const instagramUrl = `https://www.instagram.com/${site.instagram}/`;

export const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "")}`;
