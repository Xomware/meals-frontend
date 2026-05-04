'use client';
import { useState } from 'react';
import { RatingStars } from './RatingStars';

const inputCls =
  'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent';
const labelCls =
  'block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5';

export interface CookFormValues {
  cookedAt: string;
  notes: string;
  photoUrl: string | null;
  rating: number | null;
}

interface Props {
  initial?: Partial<CookFormValues>;
  submitLabel: string;
  showCookedAt: boolean;
  cookedAtImmutable?: boolean;
  onSubmit: (values: CookFormValues) => Promise<void>;
}

function nowLocalIso(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function CookForm({
  initial,
  submitLabel,
  showCookedAt,
  cookedAtImmutable,
  onSubmit,
}: Props) {
  const [cookedAt, setCookedAt] = useState(
    initial?.cookedAt ? initial.cookedAt.slice(0, 16) : nowLocalIso(),
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [rating, setRating] = useState<number>(initial?.rating ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        cookedAt: new Date(cookedAt).toISOString(),
        notes: notes.trim(),
        photoUrl: photoUrl.trim() || null,
        rating: rating > 0 ? rating : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {showCookedAt && (
        <div>
          <label className={labelCls}>Cooked at</label>
          <input
            type="datetime-local"
            className={inputCls}
            value={cookedAt}
            onChange={(e) => setCookedAt(e.target.value)}
            disabled={cookedAtImmutable}
          />
          {cookedAtImmutable && (
            <p className="mt-1 text-[11px] text-zinc-500">
              cookedAt is immutable. Delete and re-log to change.
            </p>
          )}
        </div>
      )}

      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          className={inputCls + ' min-h-[80px] resize-y'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What worked? What flopped? Subs you made?"
        />
      </div>

      <div>
        <label className={labelCls}>Photo URL</label>
        <input
          type="url"
          className={inputCls}
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div>
        <span className={labelCls}>Your rating</span>
        <div className="flex items-center gap-3">
          <RatingStars value={rating} onChange={setRating} size="md" label="Recipe rating" />
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="text-xs text-zinc-500 hover:text-coral-300 transition"
            >
              clear
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          Optional. Also gets saved as your recipe rating.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="text-xs text-coral-300 bg-coral-900/30 border border-coral-800 rounded-md px-3 py-2"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-coral-500 to-coral-400 hover:from-coral-400 hover:to-coral-300 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg transition shadow-lg shadow-coral-500/20 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
