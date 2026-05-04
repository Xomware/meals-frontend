'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ViewMode } from '@/types';
import { useAuth } from '@/lib/auth-context';

interface Props {
  mealCount: number;
  cookedCount: number;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onAdd: () => void;
}

export default function Header({ mealCount, cookedCount, view, onViewChange, onAdd }: Props) {
  return (
    <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight brand-bar">
            <span className="chef-stamp">Xom Appétit</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            <span className="text-coral-400 font-semibold">{mealCount}</span> meals logged
            {mealCount > 0 && (
              <>
                <span className="mx-1.5 text-zinc-600">·</span>
                <span className="text-emerald-400 font-semibold">{cookedCount}</span> cooked
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => onViewChange('table')}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                view === 'table'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => onViewChange('card')}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                view === 'card'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              Cards
            </button>
          </div>
          <button
            onClick={onAdd}
            className="bg-gradient-to-r from-coral-500 to-coral-400 hover:from-coral-400 hover:to-coral-300 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition shadow-lg shadow-coral-500/20"
          >
            + Log a meal
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/auth/sign-in"
        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-coral-500/50 text-zinc-100 px-3 py-2 rounded-lg text-sm font-semibold transition"
      >
        Sign in
      </Link>
    );
  }

  const handle = user.preferredUsername;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-coral-500/50 text-zinc-100 px-3 py-2 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral-400/40"
      >
        <span className="h-6 w-6 rounded-full grid place-items-center bg-gradient-to-br from-coral-500 to-flame-500 text-white text-xs font-black uppercase">
          {handle.charAt(0)}
        </span>
        <span className="max-w-[8rem] truncate">@{handle}</span>
        <span className="text-zinc-500">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40 overflow-hidden z-40"
        >
          <Link
            role="menuitem"
            href="/profile"
            className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-coral-300 transition"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              if (typeof window !== 'undefined') {
                window.location.assign('/auth/sign-in');
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-coral-300 transition border-t border-zinc-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
