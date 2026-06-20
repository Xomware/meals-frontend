'use client';
import Link from 'next/link';
import { Recipe, TAG_LABELS } from '@/types';
import { PublicUserProfile } from '@/lib/users';
import { PrivacyBadge } from './PrivacyBadge';
import LikeButton from './LikeButton';

interface Props {
  recipe: Recipe;
  /** Public profile of the recipe author, when resolved. */
  author?: PublicUserProfile | null;
  /**
   * 'grid' (default) — compact card for the discover/search/profile grids.
   * 'feed' — full-width social-style post for the home feed.
   */
  variant?: 'grid' | 'feed';
}

export function RecipeCard({ recipe, author, variant = 'grid' }: Props) {
  const handle = author?.preferredUsername ?? recipe.authorHandle ?? null;
  const name = author?.displayName ?? null;
  const avatarUrl = author?.avatarUrl ?? null;
  const initial = (name || handle || '?').charAt(0).toUpperCase();
  // Difficulty is 1..5 going forward, but back-compat for any unmigrated rows.
  const diff = typeof recipe.difficulty === 'number' ? recipe.difficulty : 3;
  const tags = recipe.tags ?? [];

  const meta = (
    <div className="text-xs flex items-center gap-1.5 text-zinc-400">
      <DifficultyDots value={diff} />
      {recipe.timeMinutes > 0 && (
        <>
          <span className="text-zinc-700">·</span>
          <span>{recipe.timeMinutes}m</span>
        </>
      )}
      {recipe.servings > 0 && (
        <>
          <span className="text-zinc-700">·</span>
          <span>{recipe.servings} {recipe.servings === 1 ? 'serv' : 'servs'}</span>
        </>
      )}
    </div>
  );

  const stats = (
    <div className="text-xs text-zinc-500 flex items-center gap-3 min-w-0">
      <LikeButton
        recipeId={recipe.recipeId}
        initialCount={recipe.likeCount ?? 0}
        initialLiked={recipe.likedByMe ?? false}
        compact
      />
      <span className="truncate">
        <span className="text-zinc-300 font-semibold">{recipe.cookCount}</span>{' '}
        {recipe.cookCount === 1 ? 'cook' : 'cooks'}
      </span>
      {recipe.ratingCount > 0 && recipe.avgRating != null && (
        <span className="flex items-center gap-1 shrink-0">
          <span className="text-coral-300">★</span>
          <span className="text-zinc-300 font-semibold">{recipe.avgRating.toFixed(1)}</span>
        </span>
      )}
    </div>
  );

  // ---- Feed variant: full-width social post -------------------------------
  if (variant === 'feed') {
    return (
      <Link
        href={`/recipes/view?id=${encodeURIComponent(recipe.recipeId)}`}
        className="group block bg-zinc-900/60 border border-zinc-800 hover:border-coral-500/50 rounded-2xl p-5 transition hover:shadow-lg hover:shadow-coral-500/10 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
      >
        {/* Author header */}
        <div className="flex items-center gap-3 mb-3">
          <AuthorChip handle={handle} name={name} avatarUrl={avatarUrl} initial={initial} />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">
              Recipe
            </span>
            <PrivacyBadge privacy={recipe.privacy} />
          </div>
        </div>

        <h3 className="font-display text-xl font-black tracking-wide text-zinc-100 group-hover:text-coral-300 transition">
          {recipe.name}
        </h3>
        <div className="mt-1.5">{meta}</div>

        {recipe.description && (
          <p className="text-sm text-zinc-400 line-clamp-3 mt-2">{recipe.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="inline-block bg-zinc-800/80 text-zinc-300 text-[11px] px-2 py-0.5 rounded-full"
              >
                {TAG_LABELS[t] ?? t}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="inline-block text-[11px] text-zinc-500 px-1 py-0.5">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center pt-3 mt-3 border-t border-zinc-800/60">{stats}</div>
      </Link>
    );
  }

  // ---- Grid variant (default): compact catalog card -----------------------
  return (
    <Link
      href={`/recipes/view?id=${encodeURIComponent(recipe.recipeId)}`}
      className="group bg-zinc-900/60 border border-zinc-800 hover:border-coral-500/50 rounded-xl p-4 space-y-3 transition hover:shadow-lg hover:shadow-coral-500/10 focus:outline-none focus:ring-2 focus:ring-coral-400/50 block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-base truncate group-hover:text-coral-300 transition">
            {recipe.name}
          </h3>
          <div className="mt-0.5">{meta}</div>
        </div>
        <PrivacyBadge privacy={recipe.privacy} />
      </div>

      {recipe.description && (
        <p className="text-xs text-zinc-400 line-clamp-2">{recipe.description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="inline-block bg-zinc-800/80 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full"
            >
              {TAG_LABELS[t] ?? t}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="inline-block text-[10px] text-zinc-500 px-1">
              +{tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 gap-2">
        {stats}
        {handle && (
          <AuthorChip handle={handle} name={name} avatarUrl={avatarUrl} initial={initial} compact />
        )}
      </div>
    </Link>
  );
}

/** Clickable author avatar + name. Stops propagation so it works inside the card Link. */
function AuthorChip({
  handle,
  name,
  avatarUrl,
  initial,
  compact = false,
}: {
  handle: string | null;
  name: string | null;
  avatarUrl: string | null;
  initial: string;
  compact?: boolean;
}) {
  const label = name || (handle ? `@${handle}` : 'Someone');
  const avatarSize = compact ? 'h-5 w-5' : 'h-9 w-9';
  const initialSize = compact ? 'text-[9px]' : 'text-sm';

  const inner = (
    <>
      <span className={`${avatarSize} rounded-full overflow-hidden bg-zinc-800 grid place-items-center shrink-0`}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className={`${initialSize} font-black text-white bg-gradient-to-br from-coral-500 to-flame-500 h-full w-full grid place-items-center`}>
            {initial}
          </span>
        )}
      </span>
      {compact ? (
        <span className="truncate max-w-[6rem] text-xs text-zinc-400">{label}</span>
      ) : (
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-zinc-100 leading-tight truncate">{label}</span>
          {handle && name && (
            <span className="block text-xs text-zinc-500 leading-tight truncate">@{handle}</span>
          )}
        </span>
      )}
    </>
  );

  if (!handle) {
    // Not clickable without a handle to resolve the profile.
    return <span className={`flex items-center gap-2 ${compact ? 'min-w-0' : ''}`}>{inner}</span>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.assign(`/u/view?handle=${encodeURIComponent(handle)}`);
      }}
      className={`flex items-center gap-2 min-w-0 text-left hover:opacity-90 transition ${compact ? 'text-zinc-400 hover:text-coral-300' : ''}`}
      title={label}
    >
      {inner}
    </button>
  );
}

function DifficultyDots({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Difficulty ${v} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${n <= v ? 'bg-coral-400' : 'bg-zinc-700'}`}
        />
      ))}
    </span>
  );
}
