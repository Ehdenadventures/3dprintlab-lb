import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PageBackdrop from "@/components/PageBackdrop";
import { getBanner } from "@/lib/data";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const banner = await getBanner();
  return (
    <>
      <PageBackdrop banner={banner} />
      <Header />
      <main className="mx-auto max-w-6xl px-4">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
