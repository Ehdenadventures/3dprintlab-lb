import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { site } from "@/lib/site";
import { DEFAULT_SHARE_IMAGE, HOME_DESCRIPTION, KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `3D Printing in Lebanon: Gifts, Sports Gear & Souvenirs | ${site.name}`, template: `%s | ${site.name}` },
  description: HOME_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: site.name,
  openGraph: { siteName: site.name, type: "website", locale: "en_US", images: [DEFAULT_SHARE_IMAGE] },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
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
