'use client';
import { useState } from 'react';
import Modal from './Modal';
import { Meal, MealRating } from '@/types';

interface Props {
  open: boolean;
  meal: Meal | null;
  onClose: () => void;
  onRate: (id: string, rating: MealRating) => Promise<void>;
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-blue-400 font-mono">{value}/10</span>
      </div>
      <input
        type="range" min={1} max={10} value={value} onChange={e => onChange(+e.target.value)}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

export default function RateMealModal({ open, meal, onClose, onRate }: Props) {
  const [taste, setTaste] = useState(meal?.rating?.taste ?? 5);
  const [ease, setEase] = useState(meal?.rating?.ease ?? 5);
  const [speed, setSpeed] = useState(meal?.rating?.speed ?? 5);
  const [healthiness, setHealthiness] = useState(meal?.rating?.healthiness ?? 5);
  const [notes, setNotes] = useState(meal?.rating?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal) return;
    setSubmitting(true);
    await onRate(meal.id, { taste, ease, speed, healthiness, notes });
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Rate: ${meal?.name ?? ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Slider label="Taste" value={taste} onChange={setTaste} />
        <Slider label="Ease" value={ease} onChange={setEase} />
        <Slider label="Speed" value={speed} onChange={setSpeed} />
        <Slider label="Healthiness" value={healthiness} onChange={setHealthiness} />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
            value={notes} onChange={e => setNotes(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {submitting ? 'Saving...' : 'Save Rating'}
        </button>
      </form>
    </Modal>
  );
}
