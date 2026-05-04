'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/use-profile';

interface Props {
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Header({ title = 'Xom Appétit', subtitle, actions }: Props) {
  return (
    <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-coral-400/50 rounded">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight brand-bar">
              <span className="chef-stamp">{title}</span>
            </h1>
          </Link>
          {subtitle && <div className="text-zinc-400 text-sm mt-2">{subtitle}</div>}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <NavLinks />
          {actions}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  return (
    <nav className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
      <Link
        href="/"
        className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-coral-400/50"
      >
        Recipes
      </Link>
      <Link
        href="/cooks"
        className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-coral-400/50"
      >
        Cooks
      </Link>
    </nav>
  );
}

function UserMenu() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { profile } = useProfile();
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

  const handle = profile?.preferredUsername ?? user.preferredUsername;
  const label = profile?.displayName?.trim() || handle;
  const avatarUrl = profile?.avatarUrl ?? null;
  const initial = (label || handle).charAt(0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${label}`}
        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-coral-500/50 text-zinc-100 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-coral-400/40"
      >
        <span className="h-7 w-7 rounded-full overflow-hidden bg-zinc-800 grid place-items-center shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="h-full w-full grid place-items-center bg-gradient-to-br from-coral-500 to-flame-500 text-white text-xs font-black uppercase">
              {initial}
            </span>
          )}
        </span>
        <span className="max-w-[8rem] truncate">{label}</span>
        <span className="text-zinc-500" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/40 overflow-hidden z-40"
        >
          <div className="px-3 py-2 border-b border-zinc-800">
            <div className="text-sm font-semibold text-zinc-100 truncate">{label}</div>
            <div className="text-xs text-zinc-500 truncate">@{handle}</div>
          </div>
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
