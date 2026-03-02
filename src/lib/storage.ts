import { Meal, MealRating } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.xomware.com';
const AUTH_HASH = process.env.NEXT_PUBLIC_AUTH_HASH || '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/meals${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Hash': AUTH_HASH,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body}`);
  }
  // DELETE may return 204
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const mealsApi = {
  getAll: async (): Promise<Meal[]> => apiFetch<Meal[]>(''),

  add: async (meal: Omit<Meal, 'id' | 'createdAt' | 'cooked'>): Promise<Meal> =>
    apiFetch<Meal>('', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),

  toggleCooked: async (id: string): Promise<Meal> =>
    apiFetch<Meal>(`/${id}/toggle-cooked`, {
      method: 'PATCH',
    }),

  rate: async (id: string, rating: MealRating): Promise<Meal> =>
    apiFetch<Meal>(`/${id}/rate`, {
      method: 'PATCH',
      body: JSON.stringify(rating),
    }),

  delete: async (id: string): Promise<void> =>
    apiFetch<void>(`/${id}`, {
      method: 'DELETE',
    }),
};
