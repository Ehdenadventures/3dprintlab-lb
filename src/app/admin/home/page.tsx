import { requireAdmin } from "@/lib/auth";
import { getCategories, getHome, getProducts } from "@/lib/data";
import { photosOf } from "@/lib/banner";
import { homeLayout } from "@/lib/home";
import AdminNav from "../AdminNav";
import HomeForm from "./HomeForm";

export const dynamic = "force-dynamic";

export default async function HomeAdmin() {
  await requireAdmin();
  const [home, cats, products] = await Promise.all([getHome(), getCategories(), getProducts()]);
  // Visible categories and products only: hidden ones never show on the home page.
  return (
    <>
      <AdminNav active="home" />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold">Home page</h1>
        <p className="text-sm text-ink-2">Choose which categories show on the home page and in what order. Each category gets a card at the top and a row of products below. For each one, show its first few products automatically or pick the products and their order yourself.</p>
        <HomeForm
          band={home.band}
          initial={homeLayout(cats, home)}
          categories={cats.map((c) => ({ id: c.id, name: c.name, parent_id: c.parent_id }))}
          products={products.map((p) => ({ id: p.id, name: p.name, category_id: p.category_id, photo: photosOf(p)[0] ?? "" }))}
        />
      </main>
    </>
  );
}
