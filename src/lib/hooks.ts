import useSWR, { mutate } from 'swr';
import { mealsApi } from './storage';
import { Meal, MealRating } from '@/types';

const MEALS_KEY = 'meals';

export function useMeals() {
  const { data, error, isLoading } = useSWR(MEALS_KEY, mealsApi.getAll);

  return {
    meals: data ?? [],
    isLoading,
    error,
    addMeal: async (meal: Omit<Meal, 'id' | 'createdAt' | 'cooked'>) => {
      await mealsApi.add(meal);
      mutate(MEALS_KEY);
    },
    toggleCooked: async (id: string) => {
      await mealsApi.toggleCooked(id);
      mutate(MEALS_KEY);
    },
    rateMeal: async (id: string, rating: MealRating) => {
      await mealsApi.rate(id, rating);
      mutate(MEALS_KEY);
    },
    deleteMeal: async (id: string) => {
      await mealsApi.delete(id);
      mutate(MEALS_KEY);
    },
  };
}
