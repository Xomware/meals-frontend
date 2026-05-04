import useSWR from 'swr';
import { useCallback } from 'react';
import { useAuth } from './auth-context';
import {
  EditProfileFields,
  ProfileNotReadyError,
  UserProfile,
  usersApi,
} from './users';

const PROFILE_KEY = 'users:me';

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<UserProfile | undefined>;
  edit: (fields: EditProfileFields) => Promise<UserProfile>;
  uploadAvatar: (file: File) => Promise<UserProfile>;
}

/**
 * Fetch /users/me with one automatic retry on ProfileNotReadyError.
 *
 * Cognito's PostConfirmation trigger writes the user row asynchronously, so the
 * very first call right after sign-up can race and 404. One retry with a brief
 * delay covers that gap without hiding real errors.
 */
async function fetchProfileWithRetry(): Promise<UserProfile> {
  try {
    return await usersApi.me();
  } catch (err) {
    if (err instanceof ProfileNotReadyError) {
      await new Promise((r) => setTimeout(r, 750));
      return await usersApi.me();
    }
    throw err;
  }
}

export function useProfile(): UseProfileResult {
  const { isAuthenticated } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<UserProfile, Error>(
    isAuthenticated ? PROFILE_KEY : null,
    fetchProfileWithRetry,
    {
      // We already have application-level retry for the PostConfirmation race;
      // SWR's default exponential retry only adds noise on real errors.
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  const edit = useCallback(
    async (fields: EditProfileFields) => {
      const updated = await usersApi.edit(fields);
      await mutate(updated, { revalidate: false });
      return updated;
    },
    [mutate],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const finalUrl = await usersApi.uploadAvatar(file);
      const updated = await usersApi.edit({ avatarUrl: finalUrl });
      await mutate(updated, { revalidate: false });
      return updated;
    },
    [mutate],
  );

  return {
    profile: data ?? null,
    isLoading: isAuthenticated ? isLoading : false,
    error: error ?? null,
    refresh,
    edit,
    uploadAvatar,
  };
}
