'use client';
import { Recipe, Cook, Macros, MacrosScope, Ingredient, PROTEIN_LABELS } from '@/types';

/** Relative time, e.g. "3h ago". Mirrors the helper used in the comment threads. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

/** Author avatar + name. Clickable to the profile; stops propagation so it
 *  works inside a card that is itself a Link. */
export function AuthorRow({
  handle,
  name,
  avatarUrl,
  subtitle,
  right,
}: {
  handle: string | null;
  name: string | null;
  avatarUrl: string | null;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const label = name || (handle ? `@${handle}` : 'Someone');
  const initial = (name || handle || '?').charAt(0).toUpperCase();

  const avatar = (
    <span className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 grid place-items-center shrink-0 ring-1 ring-zinc-700/60">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="h-full w-full grid place-items-center bg-gradient-to-br from-coral-500 to-flame-500 text-sm font-black text-white">
          {initial}
        </span>
      )}
    </span>
  );

  const goProfile = (e: React.MouseEvent) => {
    if (!handle) return;
    e.preventDefault();
    e.stopPropagation();
    window.location.assign(`/u/view?handle=${encodeURIComponent(handle)}`);
  };

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={goProfile} className="shrink-0" aria-label={`View ${label}`}>
        {avatar}
      </button>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={goProfile}
          className="block text-sm font-semibold text-zinc-100 leading-tight truncate text-left hover:text-coral-300 transition"
          title={label}
        >
          {label}
        </button>
        {subtitle && (
          <div className="text-xs text-zinc-500 leading-tight mt-0.5 truncate">{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

const hasMacros = (m?: Macros | null) =>
  !!m && (m.calories > 0 || m.protein > 0 || m.carbs > 0 || m.fat > 0);

/** Nutrition panel — the "data" hero. Four big stats with a per-serving note. */
export function MacroPanel({ macros, scope }: { macros: Macros; scope: MacrosScope }) {
  if (!hasMacros(macros)) return null;
  const cells: [string, string, string][] = [
    ['kcal', String(Math.round(macros.calories)), 'text-coral-300'],
    ['protein', `${Math.round(macros.protein)}g`, 'text-emerald-300'],
    ['carbs', `${Math.round(macros.carbs)}g`, 'text-sky-300'],
    ['fat', `${Math.round(macros.fat)}g`, 'text-amber-300'],
  ];
  return (
    <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-3">
      <div className="grid grid-cols-4 divide-x divide-zinc-800">
        {cells.map(([label, value, color]) => (
          <div key={label} className="px-1 text-center">
            <div className={`font-display text-lg font-black leading-none ${color}`}>{value}</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-zinc-600 text-center mt-2">
        {scope === 'per-serving' ? 'per serving' : 'per recipe'}
      </div>
    </div>
  );
}

type Axis = { key: string; label: string; avg: number | null; count: number; color: string };

/** Flavor-profile bars (spicy/sweet/salty/rich) — only axes with ratings. */
export function FlavorProfile({ recipe }: { recipe: Recipe }) {
  const axes: Axis[] = [
    { key: 'spicy', label: 'Spicy', avg: recipe.spicinessAvg, count: recipe.spicinessCount, color: 'bg-flame-500' },
    { key: 'sweet', label: 'Sweet', avg: recipe.sweetnessAvg, count: recipe.sweetnessCount, color: 'bg-pink-400' },
    { key: 'salty', label: 'Salty', avg: recipe.saltinessAvg, count: recipe.saltinessCount, color: 'bg-sky-400' },
    { key: 'rich', label: 'Rich', avg: recipe.richnessAvg, count: recipe.richnessCount, color: 'bg-amber-400' },
  ].filter((a) => a.count > 0 && a.avg != null) as Axis[];
  if (axes.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {axes.map((a) => (
        <div key={a.key} className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 w-9 shrink-0">{a.label}</span>
          <span className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
            <span
              className={`block h-full rounded-full ${a.color}`}
              style={{ width: `${((a.avg as number) / 5) * 100}%` }}
            />
          </span>
          <span className="text-[11px] text-zinc-400 font-semibold w-6 text-right shrink-0">
            {(a.avg as number).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** "12 ingredients · chicken breast, broccoli, bell pepper +9" */
export function ingredientSummary(recipe: Recipe): { count: number; preview: string } | null {
  const items = recipe.ingredients ?? [];
  if (items.length === 0) return null;
  const names = items
    .map((i: string | Ingredient) => (typeof i === 'string' ? i : i?.name))
    .filter((n): n is string => !!n && n.trim().length > 0);
  if (names.length === 0) return null;
  const shown = names.slice(0, 3).join(', ');
  const extra = names.length - 3;
  return { count: names.length, preview: extra > 0 ? `${shown} +${extra}` : shown };
}

export function proteinLabels(recipe: Recipe): string[] {
  return (recipe.proteinTypes ?? [])
    .filter((p) => p !== 'none' && p !== 'other')
    .map((p) => PROTEIN_LABELS[p] ?? p);
}

/** Cook hero photo or, when absent, the recipe's macro panel as a stat header. */
export function macrosForCookRecipe(recipe: Recipe): { macros: Macros; scope: MacrosScope } {
  return { macros: recipe.macros, scope: recipe.macrosScope };
}

export { hasMacros };
export type { Cook };
