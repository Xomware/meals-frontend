'use client';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  label?: string;
}

const SIZE = {
  sm: 'text-base h-7 w-7',
  md: 'text-xl h-9 w-9',
  lg: 'text-2xl h-12 w-12',
};

export function RatingStars({ value, onChange, size = 'md', readOnly, label }: Props) {
  const interactive = !readOnly && !!onChange;
  const cls = SIZE[size];

  return (
    <div
      role={interactive ? 'radiogroup' : undefined}
      aria-label={label ?? 'Rating'}
      className="inline-flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const Star = (
          <span
            aria-hidden="true"
            className={`grid place-items-center rounded-md transition ${cls} ${
              active
                ? 'text-coral-300'
                : 'text-zinc-700'
            }`}
          >
            ★
          </span>
        );
        if (!interactive) {
          return <span key={n}>{Star}</span>;
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5`}
            onClick={() => onChange?.(n)}
            className={`grid place-items-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-coral-400/50 ${cls} ${
              active
                ? 'text-coral-300 hover:text-coral-200'
                : 'text-zinc-700 hover:text-zinc-500'
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
