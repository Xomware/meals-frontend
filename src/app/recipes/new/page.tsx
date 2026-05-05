'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/auth-context';
import { useRecipes } from '@/lib/hooks';
import { RecipeForm, RecipeFormValues } from '@/components/RecipeForm';
import ImportRecipeModal from '@/components/ImportRecipeModal';
import { RecipeDraft } from '@/lib/api';
import Loader from '@/components/Loader';
import { Recipe } from '@/types';

export default function NewRecipePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { createRecipe } = useRecipes();
  const [importOpen, setImportOpen] = useState(false);
  const [initial, setInitial] = useState<Partial<Recipe> | undefined>(undefined);
  const [importBanner, setImportBanner] = useState<string | null>(null);
  // Bumping this remounts RecipeForm so the new initial values actually
  // populate (the form seeds state in useState which only runs on mount).
  const [formKey, setFormKey] = useState(0);

  if (isLoading || !isAuthenticated) {
    return <Loader fullscreen />;
  }

  const handleSubmit = async (values: RecipeFormValues) => {
    const created = await createRecipe(values);
    router.push(`/recipes/view?id=${encodeURIComponent(created.recipeId)}`);
  };

  const handleImported = (draft: RecipeDraft, source: 'json-ld' | 'claude') => {
    setInitial(draft as Partial<Recipe>);
    setFormKey((k) => k + 1);
    setImportOpen(false);
    setImportBanner(
      source === 'json-ld'
        ? 'Imported from the page metadata. Review and tweak before saving.'
        : 'Imported via Claude. Numbers and tags are best-guess — give them a once-over.',
    );
  };

  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black uppercase tracking-wide">
            New recipe
          </h2>
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-coral-300 transition uppercase tracking-wider font-semibold"
          >
            ← Back
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="w-full flex items-center justify-between gap-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-coral-500/50 rounded-xl p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-coral-400/40"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="h-9 w-9 grid place-items-center rounded-md bg-coral-500/15 text-coral-300 shrink-0">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M12 4v9m0 0-4-4m4 4 4-4M5 20h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-sm">Import from URL or text</span>
              <span className="block text-[11px] text-zinc-500">
                HelloFresh, AllRecipes, blogs, Instagram captions… we'll prefill the form.
              </span>
            </span>
          </span>
          <span className="text-coral-300 text-lg shrink-0" aria-hidden="true">›</span>
        </button>

        {importBanner && (
          <div className="bg-coral-500/10 border border-coral-500/30 text-coral-200 text-xs rounded-lg px-3 py-2 flex items-start gap-2">
            <span aria-hidden="true">✨</span>
            <p className="flex-1">{importBanner}</p>
            <button
              type="button"
              onClick={() => setImportBanner(null)}
              aria-label="Dismiss"
              className="text-coral-300/70 hover:text-coral-200 transition"
            >
              ×
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 brand-stamp">
          <RecipeForm
            key={formKey}
            initial={initial}
            submitLabel="Create recipe"
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      <ImportRecipeModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImported}
      />
    </div>
  );
}
