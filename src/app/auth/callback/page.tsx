'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import AuthShell from '@/components/AuthShell';

/**
 * Cognito Hosted UI redirects here with `?code=...` after a successful
 * federated sign-in. Amplify v6 picks up the code automatically once
 * Amplify.configure has run with the OAuth block (see auth-context.tsx).
 *
 * We just wait for the auth context to flip to authenticated, then bounce
 * to the home page (or whatever `next` was tucked into the original URL).
 */
export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error_description') || params.get('error');
    if (errParam) setError(decodeURIComponent(errParam));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLoading) return;
    if (!isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    const target = next && next.startsWith('/') ? next : '/';
    window.location.replace(target);
  }, [isAuthenticated, isLoading]);

  if (error) {
    return (
      <AuthShell title="Sign-in error" subtitle="Cognito returned an error.">
        <div role="alert" className="text-sm text-coral-300 bg-coral-500/10 border border-coral-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
        <a
          href="/auth/sign-in"
          className="mt-4 inline-block text-coral-400 hover:text-coral-300 text-sm font-semibold"
        >
          Back to sign in
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in…" subtitle="Stand by, chef.">
      <div className="flex items-center justify-center py-6 text-coral-400 text-3xl animate-pulse" aria-live="polite">
        🔥
      </div>
    </AuthShell>
  );
}
