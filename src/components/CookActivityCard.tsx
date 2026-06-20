'use client';
import Link from 'next/link';
import { Cook, Recipe } from '@/types';
import { PublicUserProfile } from '@/lib/users';
import { AuthorRow, MacroPanel, timeAgo } from './FeedBits';

interface Props {
  cook: Cook;
  recipe: Recipe;
  /** Profile of the cook's chef (the person who logged the cook). */
  chef?: PublicUserProfile | null;
}

/**
 * Social-feed post for "X cooked Recipe Y": author header, the dish, an
 * optional hero photo, the cook's flavor ratings, notes, and the recipe's
 * nutrition. Visually distinct from a recipe post so the feed reads as
 * activity, not catalog. Tap → cook detail (`/cooks/view`).
 */
export function CookActivityCard({ cook, recipe, chef }: Props) {
  const handle = chef?.preferredUsername || recipe.authorHandle || null;
  const name = chef?.displayName || null;
  const avatarUrl = chef?.avatarUrl || null;

  const ratingChips = [
    { label: '★ Overall', value: cook.rating, cls: 'text-coral-300' },
    { label: '🌶 Spicy', value: cook.spiciness, cls: 'text-flame-400' },
    { label: '🍬 Sweet', value: cook.sweetness, cls: 'text-pink-300' },
    { label: '🧂 Salty', value: cook.saltiness, cls: 'text-sky-300' },
    { label: '🧈 Rich', value: cook.richness, cls: 'text-amber-300' },
  ].filter((c) => c.value != null);

  return (
    <Link
      href={`/cooks/view?id=${encodeURIComponent(cook.cookId)}`}
      className="group block bg-zinc-900/60 border border-zinc-800 hover:border-coral-500/50 rounded-2xl overflow-hidden transition hover:shadow-lg hover:shadow-coral-500/10 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
    >
      {/* Author header */}
      <div className="p-4 pb-3">
        <AuthorRow
          handle={handle}
          name={name}
          avatarUrl={avatarUrl}
          subtitle={
            <span className="flex items-center gap-1.5">
              <span>{timeAgo(cook.cookedAt)}</span>
              <span className="text-zinc-700">·</span>
              <span>logged a cook</span>
            </span>
          }
          right={
            cook.rating != null ? (
              <span className="flex items-center gap-1 bg-zinc-950/60 border border-zinc-800 rounded-full px-2.5 py-1 text-sm shrink-0">
                <span className="text-coral-300" aria-hidden>★</span>
                <span className="text-zinc-100 font-bold">{cook.rating}</span>
                <span className="text-zinc-500 text-xs">/5</span>
              </span>
            ) : undefined
          }
        />
      </div>

      {/* The dish */}
      <div className="px-4 pb-3">
        <p className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">cooked</p>
        <h3 className="font-display text-xl font-black tracking-wide text-zinc-100 group-hover:text-coral-300 transition">
          {recipe.name}
        </h3>
      </div>

      {/* Hero photo (full-bleed) */}
      {cook.photoUrl && (
        <div className="border-y border-zinc-800 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cook.photoUrl}
            alt={`Cook of ${recipe.name}`}
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
      )}

      <div className="p-4 pt-3 space-y-3">
        {/* Notes */}
        {cook.notes && <p className="text-sm text-zinc-300 line-clamp-4">{cook.notes}</p>}

        {/* The cook's flavor ratings */}
        {ratingChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ratingChips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1 bg-zinc-800/60 rounded-md px-2 py-0.5 text-xs"
              >
                <span className={c.cls}>{c.label}</span>
                <span className="text-zinc-200 font-semibold">{c.value}</span>
              </span>
            ))}
          </div>
        )}

        {/* Recipe nutrition — data even when there's no photo */}
        <MacroPanel macros={recipe.macros} scope={recipe.macrosScope} />

        {/* Footer */}
        <div className="flex items-center gap-5 pt-2 border-t border-zinc-800/60 text-sm text-zinc-400">
          {cook.diners.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🍽</span>
              <span className="text-zinc-300 font-semibold">{cook.diners.length}</span>
              <span className="text-zinc-500">{cook.diners.length === 1 ? 'diner' : 'diners'}</span>
            </span>
          )}
          <span className="ml-auto text-coral-400 font-semibold group-hover:text-coral-300">
            View cook →
          </span>
        </div>
      </div>
    </Link>
  );
}
