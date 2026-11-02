/* eslint-disable @next/next/no-img-element */
/** The 3D PrintLab logo (navy "3D", orange "PRINTLAB"). `onDark` swaps navy for white. */
export default function Logo({ height = 26, onDark = false }: { height?: number; onDark?: boolean }) {
  const w = Math.round((height * 1408) / 256);
  if (onDark) return <img src="/logo-3dprintlab-dark.png" alt="3D PrintLab" width={w} height={height} />;
  return (
    <picture>
      <source srcSet="/logo-3dprintlab-dark.png" media="(prefers-color-scheme: dark)" />
      <img src="/logo-3dprintlab.png" alt="3D PrintLab" width={w} height={height} />
    </picture>
  );
}
