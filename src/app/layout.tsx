import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | 3D printed sports gear, gadgets and souvenirs`, template: `%s | ${site.name}` },
  description: "3D printed sports gear, everyday items and Lebanese souvenirs. Cash on delivery all over Lebanon.",
  openGraph: { siteName: site.name, type: "website" },
  // Ownership tags for Google Search Console and Meta (Facebook/Instagram) domain verification.
  // Paste only the code (the content="..." part) into Vercel > Settings > Environment Variables, then redeploy.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
    ...(process.env.FACEBOOK_DOMAIN_VERIFICATION && {
      other: { "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&family=Readex+Pro:wght@400;600&display=swap" />
      </head>
      <body className="min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
