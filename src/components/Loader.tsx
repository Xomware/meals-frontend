'use client';

interface Props {
  /** Visual size in pixels. Icon is square. */
  size?: number;
  /** Optional caption rendered under the icon. */
  caption?: string;
  /** True for a full-viewport centered layout; false for inline use. */
  fullscreen?: boolean;
}

/**
 * Pulsing-icon loader. Uses the brand icon (the X-on-utensils mark).
 * Fades + scales gently between two states so the page never feels stuck.
 */
export default function Loader({
  size = 56,
  caption = 'heating up the kitchen…',
  fullscreen = false,
}: Props) {
  const wrapper = fullscreen
    ? 'min-h-screen flex items-center justify-center'
    : 'text-center py-16';
  return (
    <div className={wrapper}>
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt=""
          width={size}
          height={size}
          aria-hidden="true"
          draggable={false}
          className="inline-block animate-brand-pulse"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
        {caption && (
          <div className="text-zinc-500 text-sm mt-3 italic">{caption}</div>
        )}
      </div>
    </div>
  );
}
