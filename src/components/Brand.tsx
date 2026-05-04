'use client';

interface Props {
  /** Visual height in pixels. Width auto-scales from the 1025x391 banner. */
  height?: number;
  className?: string;
}

/**
 * Xom Appétit wordmark + crossed-utensils X. Single source of truth for
 * the brand image — swap the `src` here and every surface updates.
 *
 * The banner is 1025x391 (~2.62:1). At height=32 the rendered width is
 * ~84px, which fits the compact nav bar; at height=64 it's the size used
 * in AuthShell hero blocks.
 */
export default function Brand({ height = 32, className = '' }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/banner.png"
      alt="Xom Appétit"
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
}
