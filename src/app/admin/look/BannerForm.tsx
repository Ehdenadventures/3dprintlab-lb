"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import type { BannerPick, BannerSettings, SlideBackground } from "@/lib/types";
import { bannerSlides, MAX_BANNER_PRODUCTS } from "@/lib/banner";
import { Backdrop, slideBackground } from "@/components/HeroSlider";
import { createUploadUrl, saveBannerAction } from "../actions";

type Choice = { id: string; name: string; photos: string[] };
/** The picture that ships with the site (public/banner-studio.jpg). */
const STUDIO = "/banner-studio.jpg";
const EMPTY: SlideBackground = { image: "", opacity: 20, x: 50, y: 50 };

async function uploadFile(file: File): Promise<string> {
  if (file.size > 15 * 1024 * 1024) throw new Error("Please use a picture under 15 MB.");
  const res = await createUploadUrl(file.name, "banner");
  if ("error" in res) throw new Error(res.error);
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", file);
  const put = await fetch(res.uploadUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
  if (!put.ok) throw new Error(`Upload failed (${put.status}).`);
  return res.publicUrl;
}

/** Picture, strength and position controls for one background, with a preview in the banner's colours. */
function BackgroundEditor({ title, value, onChange, preview, photo, uploads, note, studio }: {
  studio?: boolean; title: string; value: SlideBackground; onChange: (v: SlideBackground) => void; preview?: SlideBackground; photo?: string; uploads: boolean; note?: React.ReactNode;
}) {
  const [busy, setBusy] = useState("");
  const set = (patch: Partial<SlideBackground>) => onChange({ ...value, ...patch });
  const slider = (label: string, key: "opacity" | "x" | "y", hint: [string, string]) => (
    <div className="field">
      <label>{label}: <b>{value[key]}%</b></label>
      <input type="range" min={0} max={100} step={5} value={value[key]} disabled={!value.image} aria-label={`${label} for ${title}`}
        onChange={(e) => set({ [key]: Number(e.target.value) })} className="w-full accent-[var(--accent)] disabled:opacity-40" />
      <span className="flex justify-between text-xs text-ink-3"><span>{hint[0]}</span><span>{hint[1]}</span></span>
    </div>
  );
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="relative overflow-hidden rounded-xl bg-[#283189] text-white">
        <Backdrop bg={preview} />
        <div className="relative grid min-h-36 grid-cols-2 items-center gap-3 px-5 py-6">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#ff8a52]">Preview</p>
            <p className="mt-1 text-xl font-extrabold leading-tight">{title}</p>
          </div>
          {photo && <img src={photo} alt="" className="ml-auto max-h-28 rounded-lg object-contain" />}
        </div>
      </div>
      {note}
      <div className="flex flex-wrap items-center gap-3">
        {uploads ? (
          <label className="btn cursor-pointer py-1.5 text-sm">
            {value.image ? "Change picture" : "Upload picture"}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy("Uploading...");
              try { set({ image: await uploadFile(f) }); setBusy(""); } catch (err) { setBusy((err as Error).message); }
            }} />
          </label>
        ) : (
          <input className="input flex-1" placeholder="Paste a picture link" aria-label={`Picture link for ${title}`} value={value.image} onChange={(e) => set({ image: e.target.value })} />
        )}
        {value.image && <button type="button" className="text-sm text-bad" onClick={() => set({ image: "" })}>Remove picture</button>}
        {studio && value.image !== STUDIO && <button type="button" className="text-sm font-semibold text-accent" onClick={() => set({ image: STUDIO })}>Use the 3D printing studio picture</button>}
        {busy && <span className="text-xs text-ink-3" aria-live="polite">{busy}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {slider("Strength", "opacity", ["see-through", "strong"])}
        {slider("Left – right", "x", ["left side", "right side"])}
        {slider("Top – bottom", "y", ["top", "bottom"])}
      </div>
    </section>
  );
}

/** Pick the products shown as banner slides, their order and the photo each one shows. */
function ProductPicker({ value, onChange, products }: { value: BannerPick[]; onChange: (v: BannerPick[]) => void; products: Choice[] }) {
  const withPhoto = products.filter((p) => p.photos.length);
  const byId = new Map(products.map((p) => [p.id, p]));
  const addable = withPhoto.filter((p) => !value.some((v) => v.id === p.id));
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
      <h2 className="font-semibold">Products in the banner</h2>
      <p className="text-sm text-ink-2">
        {value.length
          ? "These products get a slide, in this order. Tap a photo to choose which one shows."
          : "None chosen yet, so the banner shows the first 6 products that have a photo. Add products below to choose them yourself."}
      </p>
      <ol className="space-y-3">
        {value.map((pick, i) => {
          const p = byId.get(pick.id);
          const photos = p?.photos ?? [];
          const current = photos.includes(pick.image) ? pick.image : photos[0];
          return (
            <li key={pick.id} className="rounded-xl border border-line p-3">
              <div className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-sm font-bold text-ink-3">{i + 1}.</span>
                <p className="min-w-0 flex-1 truncate font-semibold">{p?.name ?? "Product no longer in the shop"}</p>
                <button type="button" className="btn px-2.5 py-1 text-sm" aria-label={`Move ${p?.name ?? "product"} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" className="btn px-2.5 py-1 text-sm" aria-label={`Move ${p?.name ?? "product"} down`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="px-1 text-sm text-bad" onClick={() => onChange(value.filter((_, k) => k !== i))}>Remove</button>
              </div>
              {photos.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2 pl-8" role="radiogroup" aria-label={`Photo for ${p?.name}`}>
                  {photos.map((url, k) => (
                    <button key={url} type="button" role="radio" aria-checked={url === current} aria-label={`Photo ${k + 1}`}
                      onClick={() => onChange(value.map((v, j) => (j === i ? { ...v, image: url } : v)))}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${url === current ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1 pl-8 text-xs text-ink-3">Hidden or without a photo, so it is skipped on the banner.</p>
              )}
            </li>
          );
        })}
      </ol>
      {value.length < MAX_BANNER_PRODUCTS ? (
        addable.length > 0 && (
          <select className="input" aria-label="Add a product to the banner" value=""
            onChange={(e) => e.target.value && onChange([...value, { id: e.target.value, image: "" }])}>
            <option value="">+ Add a product…</option>
            {addable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )
      ) : (
        <p className="text-xs text-ink-3">The banner shows at most {MAX_BANNER_PRODUCTS} products.</p>
      )}
      {!withPhoto.length && <p className="text-xs text-ink-3">Products appear here once they have a photo.</p>}
      {value.length > 0 && <button type="button" className="text-sm text-ink-2 underline" onClick={() => onChange([])}>Go back to automatic (first 6 with a photo)</button>}
    </section>
  );
}

export default function BannerForm({ initial, products, uploads }: { initial: BannerSettings; products: Choice[]; uploads: boolean }) {
  const [b, setB] = useState(initial);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const { all, slides: own, page: _page, products: _picks, ...base } = b; // eslint-disable-line @typescript-eslint/no-unused-vars
  const media = (p: Choice) => p.photos.map((url) => ({ type: "image" as const, url }));
  const slides = [
    { key: "main", label: "First slide (logo and welcome text)", photo: undefined as string | undefined },
    ...bannerSlides(products.map((p) => ({ ...p, media: media(p) })), b.products).map(({ product, image }) => ({ key: product.id, label: product.name, photo: image })),
  ];

  function save() {
    setError(""); setMsg("");
    start(async () => {
      const r = await saveBannerAction(b);
      if (r.error) setError(r.error);
      else setMsg("Saved. The home page shows it now.");
    });
  }

  return (
    <div className="space-y-4">
      <BackgroundEditor title="Default picture (all product slides)" value={base} uploads={uploads} studio
        preview={base.image ? base : undefined} onChange={(v) => setB({ ...b, ...v })}
        note={
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={all} onChange={(e) => setB({ ...b, all: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
            Also use it behind the first slide
          </label>
        } />

      <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-semibold">Behind the whole page</h2>
        <p className="text-sm text-ink-2">Shows the default picture above very faintly behind every page of the shop. Keep it low so text stays easy to read; 0 turns it off.</p>
        <div className="field">
          <label htmlFor="page-strength">Strength: <b>{b.page}%</b></label>
          <input id="page-strength" type="range" min={0} max={30} step={1} value={b.page} disabled={!base.image}
            onChange={(e) => setB({ ...b, page: Number(e.target.value) })} className="w-full accent-[var(--accent)] disabled:opacity-40" />
          <span className="flex justify-between text-xs text-ink-3"><span>off</span><span>30%</span></span>
        </div>
      </section>

      <ProductPicker value={b.products} products={products} onChange={(v) => setB({ ...b, products: v })} />

      <h2 className="pt-2 text-lg font-bold">Background of each slide</h2>
      <p className="text-sm text-ink-2">Upload a picture for a slide to replace the default on that slide only. Remove it to go back to the default.</p>
      {slides.map((s) => (
        <BackgroundEditor key={s.key} title={s.label} photo={s.photo} uploads={uploads}
          value={own[s.key] ?? { ...EMPTY, opacity: base.opacity }}
          preview={slideBackground(b, s.key)}
          onChange={(v) => {
            const next = { ...own };
            if (v.image) next[s.key] = v; else delete next[s.key];
            setB({ ...b, slides: next });
          }} />
      ))}
      

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <button type="button" className="btn btn-primary" onClick={save} disabled={pending}>{pending ? "Saving..." : "Save banner"}</button>
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        {msg && <p className="text-sm text-ink-2" aria-live="polite">{msg}</p>}
      </div>
    </div>
  );
}
