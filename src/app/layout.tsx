import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | 3D printed sports gear, gadgets and souvenirs`, template: `%s | ${site.name}` },
  description: "3D printed sports gear, everyday items and Lebanese souvenirs. Cash on delivery all over Lebanon.",
  openGraph: { siteName: site.name, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
