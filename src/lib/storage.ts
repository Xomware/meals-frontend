import { Meal, MealRating } from '@/types';

const STORAGE_KEY = 'xom-meals';

function getMeals(): Meal[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMeals(meals: Meal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

export const mealsApi = {
  getAll: async (): Promise<Meal[]> => getMeals(),

  add: async (meal: Omit<Meal, 'id' | 'createdAt' | 'cooked'>): Promise<Meal> => {
    const meals = getMeals();
    const newMeal: Meal = {
      ...meal,
      id: crypto.randomUUID(),
      cooked: false,
      createdAt: new Date().toISOString(),
    };
    meals.push(newMeal);
    saveMeals(meals);
    return newMeal;
  },

  toggleCooked: async (id: string): Promise<Meal> => {
    const meals = getMeals();
    const idx = meals.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Meal not found');
    meals[idx].cooked = !meals[idx].cooked;
    saveMeals(meals);
    return meals[idx];
  },

  rate: async (id: string, rating: MealRating): Promise<Meal> => {
    const meals = getMeals();
    const idx = meals.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Meal not found');
    meals[idx].rating = rating;
    saveMeals(meals);
    return meals[idx];
  },

  delete: async (id: string): Promise<void> => {
    const meals = getMeals();
    saveMeals(meals.filter(m => m.id !== id));
  },
};
