'use client';
import { Filters, Meal } from '@/types';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  meals: Meal[];
}

export default function FilterBar({ filters, onChange, meals }: Props) {
  const proteins = [...new Set(meals.map(m => m.proteinSource).filter(Boolean))];
  const cls = 'bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Protein</label>
        <select className={cls} value={filters.proteinSource} onChange={e => onChange({ ...filters, proteinSource: e.target.value })}>
          <option value="">All</option>
          {proteins.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
        <select className={cls} value={filters.difficulty} onChange={e => onChange({ ...filters, difficulty: e.target.value })}>
          <option value="">All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Status</label>
        <select className={cls} value={filters.cookedStatus} onChange={e => onChange({ ...filters, cookedStatus: e.target.value })}>
          <option value="all">All</option>
          <option value="cooked">Cooked</option>
          <option value="uncooked">Not Cooked</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Time (min)</label>
        <div className="flex gap-1 items-center">
          <input type="number" className={cls + ' w-16'} value={filters.timeMin} onChange={e => onChange({ ...filters, timeMin: +e.target.value })} min={0} placeholder="0" />
          <span className="text-gray-500">–</span>
          <input type="number" className={cls + ' w-16'} value={filters.timeMax} onChange={e => onChange({ ...filters, timeMax: +e.target.value })} min={0} placeholder="∞" />
        </div>
      </div>
    </div>
  );
}
