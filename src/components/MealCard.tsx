'use client';
import { Meal } from '@/types';

interface Props {
  meal: Meal;
  onToggleCooked: (id: string) => void;
  onRate: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

function diffColor(d: string) {
  return d === 'Easy' ? 'text-green-400' : d === 'Medium' ? 'text-yellow-400' : 'text-red-400';
}

function avgRating(meal: Meal) {
  if (!meal.rating) return null;
  const { taste, ease, speed, healthiness } = meal.rating;
  return ((taste + ease + speed + healthiness) / 4).toFixed(1);
}

export default function MealCard({ meal, onToggleCooked, onRate, onDelete }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">{meal.name}</h3>
          <span className={`text-xs ${diffColor(meal.difficulty)}`}>{meal.difficulty}</span>
          <span className="text-xs text-gray-400 ml-2">{meal.timeMinutes}min</span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={meal.cooked} onChange={() => onToggleCooked(meal.id)}
            className="accent-green-500 w-4 h-4" />
          <span className="text-xs text-gray-400">Cooked</span>
        </label>
      </div>
      {meal.proteinSource && (
        <span className="inline-block bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">
          {meal.proteinSource}
        </span>
      )}
      <div className="text-xs text-gray-400 grid grid-cols-4 gap-1">
        <span>{meal.macros.calories} cal</span>
        <span>{meal.macros.protein}g P</span>
        <span>{meal.macros.carbs}g C</span>
        <span>{meal.macros.fat}g F</span>
      </div>
      {meal.rating && (
        <div className="text-xs text-gray-300">
          ⭐ {avgRating(meal)} avg
          {meal.rating.notes && <span className="text-gray-500 ml-2">"{meal.rating.notes}"</span>}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onRate(meal)} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg transition">
          {meal.rating ? 'Re-rate' : 'Rate'}
        </button>
        <button onClick={() => onDelete(meal.id)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1 rounded-lg transition">
          Delete
        </button>
      </div>
    </div>
  );
}
