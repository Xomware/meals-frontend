'use client';
import { Meal } from '@/types';

interface Props {
  meals: Meal[];
  onToggleCooked: (id: string) => void;
  onRate: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

function diffColor(d: string) {
  return d === 'Easy' ? 'text-green-400' : d === 'Medium' ? 'text-yellow-400' : 'text-red-400';
}

export default function MealTable({ meals, onToggleCooked, onRate, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 text-left">
            <th className="py-3 px-3">Cooked</th>
            <th className="py-3 px-3">Name</th>
            <th className="py-3 px-3">Protein</th>
            <th className="py-3 px-3">Difficulty</th>
            <th className="py-3 px-3">Time</th>
            <th className="py-3 px-3">Calories</th>
            <th className="py-3 px-3">Rating</th>
            <th className="py-3 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {meals.map(meal => (
            <tr key={meal.id} className="border-b border-gray-800 hover:bg-gray-900/50">
              <td className="py-3 px-3">
                <input type="checkbox" checked={meal.cooked} onChange={() => onToggleCooked(meal.id)}
                  className="accent-green-500 w-4 h-4 cursor-pointer" />
              </td>
              <td className="py-3 px-3 font-medium">{meal.name}</td>
              <td className="py-3 px-3 text-gray-400">{meal.proteinSource || '—'}</td>
              <td className={`py-3 px-3 ${diffColor(meal.difficulty)}`}>{meal.difficulty}</td>
              <td className="py-3 px-3 text-gray-400">{meal.timeMinutes}m</td>
              <td className="py-3 px-3 text-gray-400">{meal.macros.calories}</td>
              <td className="py-3 px-3">
                {meal.rating
                  ? <span className="text-yellow-400">⭐ {((meal.rating.taste + meal.rating.ease + meal.rating.speed + meal.rating.healthiness) / 4).toFixed(1)}</span>
                  : <span className="text-gray-600">—</span>}
              </td>
              <td className="py-3 px-3">
                <div className="flex gap-2">
                  <button onClick={() => onRate(meal)} className="text-blue-400 hover:text-blue-300 text-xs">
                    {meal.rating ? 'Re-rate' : 'Rate'}
                  </button>
                  <button onClick={() => onDelete(meal.id)} className="text-red-400 hover:text-red-300 text-xs">
                    Del
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {meals.length === 0 && (
        <div className="text-center text-gray-500 py-12">No meals found. Add one to get started!</div>
      )}
    </div>
  );
}
