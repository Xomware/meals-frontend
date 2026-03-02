'use client';
import { useState } from 'react';
import Modal from './Modal';
import { Meal } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (meal: Omit<Meal, 'id' | 'createdAt' | 'cooked'>) => Promise<void>;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export default function AddMealModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [proteinSource, setProteinSource] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName(''); setTimeMinutes(30); setDifficulty('Medium');
    setProteinSource(''); setIngredients('');
    setCalories(0); setProtein(0); setCarbs(0); setFat(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onAdd({
      name,
      timeMinutes,
      difficulty,
      proteinSource,
      ingredients: ingredients.split(',').map(s => s.trim()).filter(Boolean),
      macros: { calories, protein, carbs, fat },
    });
    reset();
    setSubmitting(false);
    onClose();
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <Modal open={open} onClose={onClose} title="Add Meal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Name *</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Time (min)</label>
            <input type="number" className={inputCls} value={timeMinutes} onChange={e => setTimeMinutes(+e.target.value)} min={1} />
          </div>
          <div>
            <label className={labelCls}>Difficulty</label>
            <select className={inputCls} value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Protein Source</label>
          <input className={inputCls} value={proteinSource} onChange={e => setProteinSource(e.target.value)} placeholder="e.g. Chicken, Tofu" />
        </div>
        <div>
          <label className={labelCls}>Ingredients (comma separated)</label>
          <textarea className={inputCls + ' h-20'} value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="chicken, rice, broccoli..." />
        </div>
        <div>
          <label className={labelCls}>Macros</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['Cal', calories, setCalories],
              ['Protein', protein, setProtein],
              ['Carbs', carbs, setCarbs],
              ['Fat', fat, setFat],
            ].map(([label, val, setter]) => (
              <div key={label as string}>
                <span className="text-xs text-gray-400">{label as string}</span>
                <input type="number" className={inputCls} value={val as number} onChange={e => (setter as (v: number) => void)(+e.target.value)} min={0} />
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {submitting ? 'Adding...' : 'Add Meal'}
        </button>
      </form>
    </Modal>
  );
}
