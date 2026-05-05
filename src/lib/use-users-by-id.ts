'use client';
import { useMemo } from 'react';
import useSWR from 'swr';
import { usersApi, PublicUserProfile } from './users';
import { useAuth } from './auth-context';
import { useProfile } from './use-profile';

/**
 * Resolve a list of Cognito subs to public profile slices, with SWR
 * caching keyed by the sorted, joined id list. Components pass in
 * whatever userIds they have on the screen (feed authors, friend
 * row userIds, etc.) and get back a Map<userId, profile> they can
 * pluck from at render time.
 *
 * The caller's own profile is overlaid from useProfile() so we never
 * fall back to a stub for self — earlier this caused the feed cards
 * to render "?" + "Someone cooked X" for the signed-in user's own
 * cooks, which was disorienting.
 */
export function useUsersById(userIds: (string | null | undefined)[]) {
  const { isAuthenticated, user } = useAuth();
  const { profile: self } = useProfile();
  const callerSub = user?.sub ?? null;

  const ids = useMemo(
    () => [...new Set(userIds.filter((id): id is string => !!id))].sort(),
    [userIds],
  );
  // Don't bother batch-getting the caller — we already have a richer
  // profile via /users/me.
  const idsToFetch = useMemo(
    () => (callerSub ? ids.filter((id) => id !== callerSub) : ids),
    [ids, callerSub],
  );

  const key =
    isAuthenticated && idsToFetch.length > 0
      ? ['users:batch-get', idsToFetch.join(',')]
      : null;
  const { data, error, isLoading } = useSWR(
    key,
    () => usersApi.batchGet(idsToFetch),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const map = new Map<string, PublicUserProfile>();
  for (const u of data ?? []) map.set(u.userId, u);
  // Overlay the caller's own profile so anything that asks "who is this
  // user?" gets a real name + avatar instead of falling back to a
  // truncated UUID.
  if (callerSub && self && ids.includes(callerSub)) {
    map.set(callerSub, {
      userId: callerSub,
      preferredUsername: self.preferredUsername,
      displayName: self.displayName,
      avatarUrl: self.avatarUrl,
      avatarStockColor: self.avatarStockColor,
      profileVisibility: self.profileVisibility,
    });
  }

  return { map, isLoading: isAuthenticated ? isLoading : false, error };
}

/**
 * Compose a display label from a public profile, falling back through
 * displayName -> @handle -> generic "a chef".
 */
export function userLabel(p: PublicUserProfile | undefined | null): string {
  if (!p) return 'someone';
  if (p.displayName?.trim()) return p.displayName.trim();
  if (p.preferredUsername) return `@${p.preferredUsername}`;
  return 'a chef';
}
