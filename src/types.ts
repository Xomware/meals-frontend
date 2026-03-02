export interface Meal {
  id: string;
  name: string;
  timeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  proteinSource: string;
  ingredients: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  cooked: boolean;
  rating?: MealRating;
  createdAt: string;
}

export interface MealRating {
  taste: number;      // 1-10
  ease: number;       // 1-10
  speed: number;      // 1-10
  healthiness: number; // 1-10
  notes: string;
}

export type ViewMode = 'table' | 'card';

export interface Filters {
  proteinSource: string;
  difficulty: string;
  cookedStatus: string; // 'all' | 'cooked' | 'uncooked'
  timeMin: number;
  timeMax: number;
}
