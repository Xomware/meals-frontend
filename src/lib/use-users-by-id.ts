'use client';
import useSWR from 'swr';
import { usersApi, PublicUserProfile } from './users';
import { useAuth } from './auth-context';

/**
 * Resolve a list of Cognito subs to public profile slices, with SWR
 * caching keyed by the sorted, joined id list. Components pass in
 * whatever userIds they have on the screen (feed authors, friend
 * row userIds, etc.) and get back a Map<userId, profile> they can
 * pluck from at render time.
 *
 * Filters falsy/duplicate ids upfront so callers don't have to.
 */
export function useUsersById(userIds: (string | null | undefined)[]) {
  const { isAuthenticated } = useAuth();
  const ids = [...new Set(userIds.filter((id): id is string => !!id))].sort();
  const key = isAuthenticated && ids.length > 0 ? ['users:batch-get', ids.join(',')] : null;
  const { data, error, isLoading } = useSWR(
    key,
    () => usersApi.batchGet(ids),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const map = new Map<string, PublicUserProfile>();
  for (const u of data ?? []) map.set(u.userId, u);

  return { map, isLoading: isAuthenticated ? isLoading : false, error };
}

/**
 * Compose a display label from a public profile, falling back through
 * displayName -> @handle -> email-style userId stub. Mirrors the same
 * order Header's `userLabel` getter uses.
 */
export function userLabel(p: PublicUserProfile | undefined | null): string {
  if (!p) return 'someone';
  if (p.displayName?.trim()) return p.displayName.trim();
  if (p.preferredUsername) return `@${p.preferredUsername}`;
  return 'a chef';
}
