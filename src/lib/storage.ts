import { Meal, MealRating, MealComment } from '@/types';

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
  if (res.status === 204) return undefined as T;
  return res.json();
}

type EditableMealFields = Partial<
  Pick<
    Meal,
    'name' | 'timeMinutes' | 'difficulty' | 'proteinSource' | 'ingredients' | 'instructions' | 'macros'
  >
>;

export const mealsApi = {
  getAll: async (): Promise<Meal[]> => apiFetch<Meal[]>(''),

  add: async (meal: Omit<Meal, 'id' | 'createdAt' | 'cooked'>): Promise<Meal> =>
    apiFetch<Meal>('', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),

  edit: async (id: string, fields: EditableMealFields): Promise<Meal> =>
    apiFetch<Meal>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
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

export const commentsApi = {
  list: async (mealId: string): Promise<MealComment[]> =>
    apiFetch<MealComment[]>(`/${mealId}/comments`),

  add: async (mealId: string, body: string): Promise<MealComment> =>
    apiFetch<MealComment>(`/${mealId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  delete: async (mealId: string, commentId: string): Promise<void> =>
    apiFetch<void>(`/${mealId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
};
