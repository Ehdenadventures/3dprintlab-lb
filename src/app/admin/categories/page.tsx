import { requireAdmin } from "@/lib/auth";
import { getCategories, getProducts } from "@/lib/data";
import type { Category } from "@/lib/types";
import AdminNav from "../AdminNav";
import { deleteCategoryAction, saveCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

function Row({ c, tops, count }: { c?: Category; tops: Category[]; count?: number }) {
  return (
    <form action={saveCategoryAction} className="grid items-end gap-2 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[1.4fr_1.2fr_2fr_70px_auto_auto]">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="field"><label>Name</label><input name="name" className="input" defaultValue={c?.name} required placeholder="New category" /></div>
      <div className="field"><label>Inside</label>
        <select name="parent_id" className="input" defaultValue={c?.parent_id ?? ""}>
          <option value="">Main category</option>
          {tops.filter((t) => t.id !== c?.id).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="field"><label>Description</label><input name="description" className="input" defaultValue={c?.description} /></div>
      <div className="field"><label>Order</label><input name="sort" type="number" className="input" defaultValue={c?.sort ?? 0} /></div>
      <label className="flex items-center gap-2 pb-3 text-sm"><input type="checkbox" name="active" defaultChecked={c?.active ?? true} className="h-4 w-4" /> Live</label>
      <div className="flex gap-2 pb-0.5">
        <button className="btn py-2 text-sm">{c ? "Save" : "Add"}</button>
        {c && (
          <button formAction={deleteCategoryAction} className="btn py-2 text-sm text-bad" title={count ? `${count} products will become uncategorised` : ""}>Delete</button>
        )}
      </div>
    </form>
  );
}

export default async function CategoriesAdmin() {
  await requireAdmin();
  const [cats, products] = await Promise.all([getCategories({ includeHidden: true }), getProducts({ includeHidden: true })]);
  const tops = cats.filter((c) => !c.parent_id);
  const count = (id: string) => products.filter((p) => p.category_id === id).length;
  return (
    <>
      <AdminNav active="categories" />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <section>
          <h2 className="mb-2 font-semibold">Add a category</h2>
          <Row tops={tops} />
        </section>
        {tops.map((t) => (
          <section key={t.id} className="space-y-2">
            <h2 className="font-semibold">{t.name}</h2>
            <Row c={t} tops={tops} count={count(t.id)} />
            <div className="space-y-2 border-l-2 border-line pl-4">
              {cats.filter((c) => c.parent_id === t.id).map((c) => (
                <div key={c.id}>
                  <p className="mb-1 text-xs text-ink-3">{count(c.id)} products</p>
                  <Row c={c} tops={tops} count={count(c.id)} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
