import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCategories, getProductById, getProductSeo, isDemo } from "@/lib/data";
import { productDescription, productTitle } from "@/lib/seo";
import AdminNav from "../../AdminNav";
import ProductForm from "./ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = id === "new" ? null : await getProductById(id);
  if (id !== "new" && !product) notFound();
  const cats = await getCategories({ includeHidden: true });
  const seo = product ? await getProductSeo(product.id) : undefined;
  // What Google shows when the boxes are left empty.
  const auto = product
    ? { title: productTitle(product), description: productDescription(product, cats.find((c) => c.id === product.category_id)) }
    : { title: "Product name | 3D Printed in Lebanon", description: "Written from the description, price and category when you save." };
  const options = cats
    .filter((c) => c.parent_id)
    .map((c) => ({ id: c.id, label: `${cats.find((p) => p.id === c.parent_id)?.name ?? ""} › ${c.name}` }))
    .concat(cats.filter((c) => !c.parent_id).map((c) => ({ id: c.id, label: c.name })))
    .sort((a, b) => a.label.localeCompare(b.label));
  return (
    <>
      <AdminNav active="products" />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ProductForm product={product} categories={options} uploads={!isDemo()} seo={seo} autoSeo={auto} />
      </main>
    </>
  );
}
