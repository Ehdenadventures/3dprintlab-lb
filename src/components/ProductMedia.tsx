"use client";
import { useState } from "react";
import type { Media } from "@/lib/types";
import { CubeIcon } from "./Icons";

export default function ProductMedia({ media, name }: { media: Media[]; name: string }) {
  const [i, setI] = useState(0);
  const m = media[i];
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
        {!m ? (
          <div className="layers flex h-full w-full items-center justify-center text-ink-3"><CubeIcon className="h-16 w-16" /></div>
        ) : m.type === "video" ? (
          <video key={m.url} src={m.url} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.url} alt={name} className="h-full w-full object-cover" />
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((x, j) => (
            <button key={x.url} onClick={() => setI(j)} aria-label={`Show ${x.type} ${j + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${j === i ? "border-accent" : "border-line"}`}>
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
        </div>
      )}
    </div>
  );
}
