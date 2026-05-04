'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';
import AuthShell, {
  authInputClass,
  authPrimaryBtnClass,
  authSecondaryBtnClass,
} from '@/components/AuthShell';

type Step = 'request' | 'confirm';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await resetPassword({ username: email.trim() });
      setInfo('Code sent. Check your inbox.');
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start password reset.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: code.trim(),
        newPassword,
      });
      window.location.assign('/auth/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={step === 'request' ? 'Reset your password' : 'Set a new password'}
      subtitle={
        step === 'request'
          ? 'Enter your email and we will send a confirmation code.'
          : 'Enter the code from your inbox and choose a new password.'
      }
      footer={
        <>
          <Link className="text-coral-400 hover:text-coral-300 font-semibold" href="/auth/sign-in">
            Back to sign in
          </Link>
        </>
      }
    >
      {step === 'request' ? (
        <form onSubmit={onRequest} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="you@example.com"
              disabled={submitting}
            />
          </div>

          {error && (
            <div role="alert" className="text-sm text-coral-300 bg-coral-500/10 border border-coral-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" className={authPrimaryBtnClass} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form onSubmit={onConfirm} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={authInputClass}
              placeholder="123456"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={authInputClass}
              placeholder="At least 8 characters"
              disabled={submitting}
            />
          </div>

          {error && (
            <div role="alert" className="text-sm text-coral-300 bg-coral-500/10 border border-coral-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div role="status" className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              {info}
            </div>
          )}

          <button type="submit" className={authPrimaryBtnClass} disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('request');
              setError(null);
              setInfo(null);
            }}
            className={authSecondaryBtnClass}
            disabled={submitting}
          >
            Send a different code
          </button>
        </form>
      )}
    </AuthShell>
  );
}
