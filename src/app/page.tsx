'use client';
import { useState, useMemo } from 'react';
import { useMeals } from '@/lib/hooks';
import { Filters, Meal, ViewMode } from '@/types';
import FilterBar from '@/components/FilterBar';
import MealTable from '@/components/MealTable';
import MealCard from '@/components/MealCard';
import AddMealModal from '@/components/AddMealModal';
import RateMealModal from '@/components/RateMealModal';

const defaultFilters: Filters = { proteinSource: '', difficulty: '', cookedStatus: 'all', timeMin: 0, timeMax: 999 };

export default function Home() {
  const { meals, isLoading, addMeal, toggleCooked, rateMeal, deleteMeal } = useMeals();
  const [view, setView] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [addOpen, setAddOpen] = useState(false);
  const [ratingMeal, setRatingMeal] = useState<Meal | null>(null);

  const filtered = useMemo(() => {
    return meals.filter(m => {
      if (filters.proteinSource && m.proteinSource !== filters.proteinSource) return false;
      if (filters.difficulty && m.difficulty !== filters.difficulty) return false;
      if (filters.cookedStatus === 'cooked' && !m.cooked) return false;
      if (filters.cookedStatus === 'uncooked' && m.cooked) return false;
      if (m.timeMinutes < filters.timeMin) return false;
      if (filters.timeMax > 0 && m.timeMinutes > filters.timeMax) return false;
      return true;
    });
  }, [meals, filters]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">🍽️ Meals</h1>
          <p className="text-gray-400 text-sm">{meals.length} meals tracked</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-md text-sm transition ${view === 'table' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >Table</button>
            <button
              onClick={() => setView('card')}
              className={`px-3 py-1.5 rounded-md text-sm transition ${view === 'card' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >Cards</button>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >+ Add Meal</button>
        </div>
      </header>

      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} meals={meals} />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : view === 'table' ? (
        <MealTable meals={filtered} onToggleCooked={toggleCooked} onRate={setRatingMeal} onDelete={deleteMeal} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(meal => (
            <MealCard key={meal.id} meal={meal} onToggleCooked={toggleCooked} onRate={setRatingMeal} onDelete={deleteMeal} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">No meals found. Add one to get started!</div>
          )}
        </div>
      )}

      <AddMealModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addMeal} />
      <RateMealModal open={!!ratingMeal} meal={ratingMeal} onClose={() => setRatingMeal(null)} onRate={rateMeal} />
    </div>
  );
}
