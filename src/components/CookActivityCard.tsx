'use client';
import Link from 'next/link';
import { Cook, Recipe } from '@/types';
import { PublicUserProfile } from '@/lib/users';

interface Props {
  cook: Cook;
  recipe: Recipe;
  /** Profile of the cook's chef (the person who logged the cook). */
  chef?: PublicUserProfile | null;
}

/**
 * Social-feed post for "X cooked Recipe Y": author header, the recipe being
 * made, an optional hero photo, notes, and a stats row. Visually distinct
 * from RecipeCard so the feed reads as activity, not catalog.
 *
 * Tap goes to the cook detail (`/cooks/view`).
 */
export function CookActivityCard({ cook, recipe, chef }: Props) {
  const date = new Date(cook.cookedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const chefHandle = chef?.preferredUsername || recipe.authorHandle;
  const chefName = chef?.displayName;
  const chefAvatar = chef?.avatarUrl;
  const chefInitial = (chefName || chefHandle || '?').charAt(0).toUpperCase();
  const chefLabel = chefName || (chefHandle ? `@${chefHandle}` : 'Someone');

  return (
    <Link
      href={`/cooks/view?id=${encodeURIComponent(cook.cookId)}`}
      className="group block bg-zinc-900/60 border border-zinc-800 hover:border-coral-500/50 rounded-2xl overflow-hidden transition hover:shadow-lg hover:shadow-coral-500/10 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <div className="h-9 w-9 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 grid place-items-center text-white shrink-0">
          {chefAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chefAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="h-full w-full grid place-items-center bg-gradient-to-br from-coral-500 to-flame-500 text-sm font-black">
              {chefInitial}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight truncate">
            <span className="font-semibold text-coral-400">{chefLabel}</span>
            <span className="text-zinc-400"> cooked this</span>
          </p>
          <p className="text-xs text-zinc-500 leading-tight mt-0.5">{date}</p>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold shrink-0">
          Cook
        </span>
      </div>

      {/* Recipe being cooked */}
      <div className="px-5 pb-3">
        <h3 className="font-display text-lg font-black tracking-wide text-zinc-100 group-hover:text-coral-300 transition">
          {recipe.name}
        </h3>
      </div>

      {/* Hero photo (full-bleed) */}
      {cook.photoUrl && (
        <div className="border-y border-zinc-800 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cook.photoUrl}
            alt={`${chefLabel}'s cook of ${recipe.name}`}
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
      )}

      {/* Body */}
      <div className={`px-5 pb-5 ${cook.photoUrl ? 'pt-4' : 'pt-0'}`}>
        {cook.notes && (
          <p className="text-sm text-zinc-300 line-clamp-3">{cook.notes}</p>
        )}
        <div className="text-xs text-zinc-500 flex items-center gap-4 mt-3">
          {cook.rating != null && (
            <span className="flex items-center gap-1">
              <span className="text-coral-300">★</span>
              <span className="text-zinc-300 font-semibold">{cook.rating}/5</span>
            </span>
          )}
          {cook.diners.length > 0 && (
            <span>
              <span className="text-zinc-300 font-semibold">{cook.diners.length}</span>{' '}
              {cook.diners.length === 1 ? 'diner' : 'diners'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
