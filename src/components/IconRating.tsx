'use client';
import type { CSSProperties } from 'react';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  /** Icon to render — emoji string or character. */
  icon: string;
  /** Optional fallback for the unfilled state (defaults to a faded copy of `icon`). */
  emptyIcon?: string;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  label?: string;
}

const SIZE = {
  sm: { icon: 'text-base', cell: 'h-7 w-7' },
  md: { icon: 'text-xl', cell: 'h-9 w-9' },
  lg: { icon: 'text-2xl', cell: 'h-12 w-12' },
};

const FADED: CSSProperties = {
  filter: 'grayscale(1) opacity(0.32)',
};

/**
 * Generic 5-icon rating row. Same UX as a star rating, but the icon is
 * configurable so we can use different glyphs per axis (star for overall,
 * pepper for spiciness, honey pot for sweetness, etc).
 *
 * Filled icons render at full color/opacity; unfilled get a grayscale +
 * low-opacity treatment that works for any emoji without per-axis art.
 */
export function IconRating({
  value,
  onChange,
  icon,
  emptyIcon,
  size = 'md',
  readOnly,
  label,
}: Props) {
  const interactive = !readOnly && !!onChange;
  const { icon: iconCls, cell } = SIZE[size];

  return (
    <div
      role={interactive ? 'radiogroup' : undefined}
      aria-label={label ?? 'Rating'}
      className="inline-flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const glyph = active ? icon : emptyIcon ?? icon;
        const style = active ? undefined : FADED;
        const inner = (
          <span
            aria-hidden="true"
            className={`grid place-items-center rounded-md transition ${cell} ${iconCls}`}
            style={style}
          >
            {glyph}
          </span>
        );
        if (!interactive) {
          return <span key={n}>{inner}</span>;
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5`}
            onClick={() => onChange?.(n)}
            className="grid place-items-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-coral-400/50"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Per-axis presets ----------

export type RatingAxisKey = 'overall' | 'spiciness' | 'sweetness' | 'saltiness' | 'richness';

export interface RatingAxisConfig {
  key: RatingAxisKey;
  /** Camel-case body key the API expects. */
  bodyKey: string;
  /** Recipe-row aggregate keys. */
  avgKey: string;
  countKey: string;
  /** Display label. */
  label: string;
  /** Glyph rendered by IconRating. */
  icon: string;
}

export const RATING_AXES: RatingAxisConfig[] = [
  { key: 'overall',   bodyKey: 'rating',    avgKey: 'avgRating',    countKey: 'ratingCount',    label: 'Overall',   icon: '⭐' },
  { key: 'spiciness', bodyKey: 'spiciness', avgKey: 'spicinessAvg', countKey: 'spicinessCount', label: 'Spice',     icon: '🌶️' },
  { key: 'sweetness', bodyKey: 'sweetness', avgKey: 'sweetnessAvg', countKey: 'sweetnessCount', label: 'Sweetness', icon: '🍯' },
  { key: 'saltiness', bodyKey: 'saltiness', avgKey: 'saltinessAvg', countKey: 'saltinessCount', label: 'Saltiness', icon: '🧂' },
  { key: 'richness',  bodyKey: 'richness',  avgKey: 'richnessAvg',  countKey: 'richnessCount',  label: 'Richness',  icon: '🧈' },
];
