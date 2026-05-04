'use client';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/auth-context';
import { useRecipes } from '@/lib/hooks';
import Header from '@/components/Header';
import { RecipeCard } from '@/components/RecipeCard';
import { MASCOTS, mascotFor } from '@/components/Mascot';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { recipes, isLoading } = useRecipes();

  if (authLoading || !isAuthenticated) {
    return <PageLoading />;
  }

  const subtitle = (
    <>
      <span className="text-coral-400 font-semibold">{recipes.length}</span>{' '}
      {recipes.length === 1 ? 'recipe' : 'recipes'}
    </>
  );

  const actions = (
    <Link
      href="/recipes/new"
      className="bg-gradient-to-r from-coral-500 to-coral-400 hover:from-coral-400 hover:to-coral-300 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition shadow-lg shadow-coral-500/20 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
    >
      + New recipe
    </Link>
  );

  return (
    <div>
      <Header subtitle={subtitle} actions={actions} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <PageLoading inline />
        ) : recipes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r) => (
              <RecipeCard key={r.recipeId} recipe={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PageLoading({ inline }: { inline?: boolean }) {
  const wrap = inline
    ? 'text-center py-16'
    : 'min-h-screen flex items-center justify-center';
  return (
    <div className={wrap}>
      <div className="text-center">
        <div className="text-coral-400 text-3xl animate-pulse" aria-hidden="true">
          🔥
        </div>
        <div className="text-zinc-500 text-sm mt-2 italic">heating up the kitchen…</div>
      </div>
    </div>
  );
}

function EmptyState() {
  const mascot = MASCOTS[mascotFor('empty-state')];
  return (
    <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
      <div className="text-5xl mb-3">{mascot.emoji}</div>
      <h2 className="font-display text-2xl font-black uppercase tracking-wide">
        {mascot.caption}
      </h2>
      <p className="text-zinc-400 text-sm mt-2 max-w-sm mx-auto">
        No recipes yet. Add your first one — {mascot.name} will judge you accordingly.
      </p>
      <Link
        href="/recipes/new"
        className="mt-5 inline-block bg-gradient-to-r from-coral-500 to-coral-400 hover:from-coral-400 hover:to-coral-300 text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg transition shadow-lg shadow-coral-500/20 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
      >
        Add your first recipe
      </Link>
    </div>
  );
}
