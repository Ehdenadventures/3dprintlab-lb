/** 3D PrintLab LB logo: two-tone layer mark + wordmark + LB tag. */
export function LayerMark({ className = "h-7 w-7" }: { className?: string }) {
  const bars = [6, 18, 30, 42, 54, 66, 78, 90, 102];
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {bars.map((y, i) => (
        <rect key={y} x="6" y={y} width="108" height="8" rx="4" fill={i < 4 ? "#5B2EFF" : "#FF3D7F"} />
      ))}
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-2">
      <LayerMark className={big ? "h-10 w-10" : "h-7 w-7"} />
      <span className={`wordmark font-extrabold tracking-tight ${big ? "text-3xl" : "text-xl"}`}>3D PrintLab</span>
      <span className={`rounded-md bg-pink font-extrabold leading-none text-white ${big ? "px-1.5 py-1 text-sm" : "px-1 py-0.5 text-[10px]"}`}>LB</span>
    </span>
  );
}
