'use client';
import { FormEvent, useEffect, useState } from 'react';
import { recipesApi, RecipeDraft } from '@/lib/api';

type Mode = 'url' | 'text';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called once the draft is ready. Caller decides where to use it. */
  onImported: (draft: RecipeDraft, source: 'json-ld' | 'claude') => void;
}

/**
 * Lightweight import sheet. Two modes:
 *   - URL: paste a recipe URL → backend tries JSON-LD first, falls back to Claude
 *   - Text: paste a caption / blog excerpt / OCR'd screenshot → Claude extracts
 *
 * On success the parent receives the draft and is responsible for prefilling
 * its form. We don't auto-create — the user gets to review and tweak.
 */
export default function ImportRecipeModal({ open, onClose, onImported }: Props) {
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === 'url'
          ? await recipesApi.importUrl(url.trim())
          : await recipesApi.importText(text.trim());
      onImported(result.draft, result.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import recipe"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 -z-10"
        disabled={busy}
      />
      <div className="bg-zinc-950 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-wide">
              Import recipe
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Paste a URL or social post — we'll prefill the form for you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="h-9 w-9 grid place-items-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.4 4.99 12 10.6l5.6-5.61 1.41 1.41L13.41 12l5.6 5.6-1.41 1.41L12 13.41l-5.6 5.6-1.41-1.41L10.59 12l-5.6-5.6L6.4 4.99z"
              />
            </svg>
          </button>
        </header>

        <div className="px-4 pt-3">
          <div role="tablist" className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-sm font-semibold">
            {(['url', 'text'] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded-md transition ${
                  mode === m
                    ? 'bg-zinc-800 text-coral-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m === 'url' ? 'From URL' : 'Paste text'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {mode === 'url' ? (
            <div>
              <label
                htmlFor="import-url"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Recipe URL
              </label>
              <input
                id="import-url"
                type="url"
                inputMode="url"
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.allrecipes.com/recipe/..."
                disabled={busy}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent disabled:opacity-50"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Works best with HelloFresh, AllRecipes, NYT Cooking, Bon Appétit, Serious Eats and most blogs.
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="import-text"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Recipe text
              </label>
              <textarea
                id="import-text"
                rows={8}
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste an Instagram caption, TikTok description, or any plain-text recipe…"
                disabled={busy}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent resize-y disabled:opacity-50"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Best for content without a clean URL — Instagram / TikTok captions, OCR'd screenshots, notes.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="text-xs text-coral-300 bg-coral-900/30 border border-coral-800 rounded-md px-3 py-2"
            >
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || (mode === 'url' ? !url.trim() : text.trim().length < 30)}
              className="flex-1 bg-gradient-to-r from-coral-500 to-coral-400 hover:from-coral-400 hover:to-coral-300 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition shadow-lg shadow-coral-500/20 focus:outline-none focus:ring-2 focus:ring-coral-400/50"
            >
              {busy ? 'Importing…' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
