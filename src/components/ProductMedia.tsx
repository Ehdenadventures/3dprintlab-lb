"use client";
import { useEffect, useState } from "react";
import { useColour } from "./ColourContext";
import type { Media } from "@/lib/types";
import { CubeIcon } from "./Icons";
import ModelViewer from "./ModelViewer";

export default function ProductMedia({ media: all, name, colourImages = {}, colourHex = {} }: {
  media: Media[]; name: string; colourImages?: Record<string, string>; colourHex?: Record<string, string>;
}) {
  const media = all.filter((m) => m.type !== "model");
  const model = all.find((m) => m.type === "model")?.url;
  const picked = useColour()?.colour ?? "";
  const start = Math.max(0, media.findIndex((x) => x.url === colourImages[picked]));
  const [i, setI] = useState(start);
  // No photos but a 3D file: open on the 3D view.
  const [show3d, setShow3d] = useState(!media.length && !!model);
  // When the customer picks a colour that has its own photo, show that photo (the 3D view repaints itself instead).
  const target = colourImages[picked];
  useEffect(() => {
    const j = media.findIndex((x) => x.url === target);
    if (j >= 0) setI(j);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  const m = media[i];
  const pick = (j: number) => { setI(j); setShow3d(false); };
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
        {show3d && model ? (
          <ModelViewer url={model} name={name} colour={colourHex[picked]} />
        ) : !m ? (
          <div className="layers flex h-full w-full items-center justify-center text-ink-3"><CubeIcon className="h-16 w-16" /></div>
        ) : m.type === "video" ? (
          <video key={m.url} src={m.url} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.url} alt={i === 0 ? name : `${name}, photo ${i + 1}`} fetchPriority={i === start ? "high" : undefined} className="h-full w-full object-cover" />
        )}
        {model && !show3d && (
          <button type="button" onClick={() => setShow3d(true)}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink shadow-lg transition hover:scale-105">
            <CubeIcon className="h-4 w-4" /> View in 3D
          </button>
        )}
      </div>
      {(media.length > 1 || (model && media.length > 0)) && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((x, j) => (
            <button key={x.url} onClick={() => pick(j)} aria-label={`Show ${x.type} ${j + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${j === i && !show3d ? "border-accent" : "border-line"}`}>
              {x.type === "video" ? (
                <>
                  <video src={x.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">▶</span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
          {model && (
            <button onClick={() => setShow3d(true)} aria-label="Show in 3D"
              className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 bg-accent-soft text-accent ${show3d ? "border-accent" : "border-line"}`}>
              <CubeIcon className="h-6 w-6" />
              <span className="text-xs font-bold">3D</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
