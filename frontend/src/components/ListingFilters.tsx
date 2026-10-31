import React from 'react';
import { Search, Filter, AlertTriangle, RotateCcw } from 'lucide-react';

interface FiltersState {
  search: string;
  category: string;
  dietary: string;
  storage: string;
  urgent_only: boolean;
}

interface ListingFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const categories = [
    { id: '', label: 'All Foods' },
    { id: 'cooked_meals', label: '🍲 Cooked Meals' },
    { id: 'bakery_pastries', label: '🥖 Bakery' },
    { id: 'fresh_produce', label: '🍎 Fresh Produce' },
    { id: 'dairy_chilled', label: '🥛 Dairy' },
    { id: 'packaged_pantry', label: '🥫 Pantry Staples' },
    { id: 'beverages', label: '🧃 Beverages' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      {/* Top Search bar & Quick Toggles */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search surplus food, dish name, bakery, produce..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
          />
        </div>

        {/* Urgent toggle */}
        <button
          onClick={() => onChange({ ...filters, urgent_only: !filters.urgent_only })}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
            filters.urgent_only
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Urgent: Expiring &lt; 3h
        </button>

        {/* Reset button */}
        {(filters.search || filters.category || filters.dietary || filters.storage || filters.urgent_only) && (
          <button
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange({ ...filters, category: cat.id })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filters.category === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secondary Dropdowns: Dietary & Storage */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filters:
        </span>

        {/* Dietary */}
        <select
          value={filters.dietary}
          onChange={(e) => onChange({ ...filters, dietary: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Dietary: All</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="halal">Halal</option>
          <option value="kosher">Kosher</option>
          <option value="gluten-free">Gluten-Free</option>
          <option value="nut-free">Nut-Free</option>
          <option value="dairy-free">Dairy-Free</option>
        </select>

        {/* Storage */}
        <select
          value={filters.storage}
          onChange={(e) => onChange({ ...filters, storage: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Storage: All</option>
          <option value="hot_holding">Hot-Holding (&gt; 140°F)</option>
          <option value="refrigerated">Refrigerated (&lt; 41°F)</option>
          <option value="room_temp">Ambient / Room Temp</option>
          <option value="frozen">Frozen (&lt; 0°F)</option>
        </select>
      </div>
    </div>
  );
};
