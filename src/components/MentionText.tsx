'use client';
import Link from 'next/link';

const MENTION_RE = /(@[a-z0-9_]{3,20})\b/gi;

interface Props {
  text: string;
  className?: string;
}

/**
 * Renders comment text with `@handle` mentions linkified to /u/view.
 * Pure regex on the client — handles are 3-20 lowercase alphanum +
 * underscore (matches the backend's HANDLE_REGEX). Doesn't try to
 * verify the handle exists; if it doesn't, the link 404s on /u/view's
 * profile-not-found state.
 */
export default function MentionText({ text, className }: Props) {
  const parts: (string | { handle: string })[] = [];
  let last = 0;
  for (const m of text.matchAll(MENTION_RE)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    parts.push({ handle: m[0].slice(1).toLowerCase() });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return (
    <span className={className}>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : (
          <Link
            key={i}
            href={`/u/view?handle=${encodeURIComponent(p.handle)}`}
            className="text-coral-300 hover:text-coral-200 font-medium"
          >
            @{p.handle}
          </Link>
        ),
      )}
    </span>
  );
}
