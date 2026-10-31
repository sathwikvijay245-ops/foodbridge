import React, { useState } from 'react';
import { FoodCategory, StorageRequirement } from '../types';
import { api } from '../services/api';
import { X, ShieldCheck, Utensils, AlertCircle } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const toLocalISOString = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state initialized with user's LOCAL timezone
  const now = new Date();
  const defaultPrep = toLocalISOString(new Date(now.getTime() - 2 * 60 * 60 * 1000));
  const defaultPickupStart = toLocalISOString(new Date(now.getTime() + 15 * 60 * 1000));
  const defaultPickupEnd = toLocalISOString(new Date(now.getTime() + 5 * 60 * 60 * 1000));
  const defaultUseBy = toLocalISOString(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cooked_meals' as FoodCategory,
    quantity: 20,
    unit: 'kg',
    storage_requirement: 'hot_holding' as StorageRequirement,
    packaging_info: 'Food-grade sealed containers',
    dietary_tags: 'Vegetarian, Nut-Free',
    allergen_info: 'None declared',
    preparation_time: defaultPrep,
    use_by_time: defaultUseBy,
    pickup_start: defaultPickupStart,
    pickup_end: defaultPickupEnd,
    pickup_address: '442 Baker Street (Loading Dock)',
    pickup_city: 'Metropolis',
    pickup_zip: '10001',
    latitude: 40.7180,
    longitude: -73.9920,
    pickup_instructions: 'Ring service bell at rear alley entrance.',
    food_safety_certified: false,
    food_safety_notes: 'Kept continuously held above 145°F in insulated warming unit.',
  });

  if (!isOpen) return null;

  // Calculate live estimated meals
  const estimatedMeals = Math.max(
    1,
    formData.unit === 'portions' || formData.unit === 'meals' || formData.unit === 'servings'
      ? Math.round(formData.quantity)
      : Math.round(formData.quantity * 2.38)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food_safety_certified) {
      setError('You must certify compliance with food safety regulations to create a listing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createListing({
        ...formData,
        quantity: Number(formData.quantity),
        preparation_time: new Date(formData.preparation_time).toISOString(),
        use_by_time: new Date(formData.use_by_time).toISOString(),
        pickup_start: new Date(formData.pickup_start).toISOString(),
        pickup_end: new Date(formData.pickup_end).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">List Surplus Food for Donation</h3>
            <p className="text-xs text-slate-500">Provide accurate handling instructions for verified charities</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Listing Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Unserved Roasted Chicken & Rice Pilaf"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Food Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodCategory })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="cooked_meals">🍲 Cooked Meals</option>
                <option value="bakery_pastries">🥖 Bakery & Pastries</option>
                <option value="fresh_produce">🍎 Fresh Produce</option>
                <option value="dairy_chilled">🥛 Dairy & Chilled</option>
                <option value="packaged_pantry">🥫 Pantry Staples</option>
                <option value="beverages">🧃 Beverages</option>
                <option value="other">🥗 Other Surplus</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Ingredients *</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe dishes, ingredients, freshness, and how it was kept..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Row 2: Quantity, Unit, Storage & Live Meals Calc */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="servings">Servings / Portions</option>
                <option value="boxes">Boxes / Cartons</option>
                <option value="trays">Hotel Trays / Pans</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storage Condition *</label>
              <select
                value={formData.storage_requirement}
                onChange={(e) => setFormData({ ...formData, storage_requirement: e.target.value as StorageRequirement })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="hot_holding">Hot-Holding (&gt; 140°F)</option>
                <option value="refrigerated">Refrigerated (&lt; 41°F)</option>
                <option value="room_temp">Ambient / Room Temp</option>
                <option value="frozen">Frozen (&lt; 0°F)</option>
              </select>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-center">
              <span className="text-[10px] text-emerald-700 font-medium block">Impact Equivalent</span>
              <span className="font-extrabold text-sm text-emerald-800 flex items-center justify-center gap-1">
                <Utensils className="w-3.5 h-3.5" /> ~{estimatedMeals} meals
              </span>
            </div>
          </div>

          {/* Row 3: Timings (Preparation, Expiration, Pickup Start/End) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preparation Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.preparation_time}
                onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Use-By Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.use_by_time}
                onChange={(e) => setFormData({ ...formData, use_by_time: e.target.value })}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pickup Window Start *</label>
              <input
                type="datetime-local"
                required
                value={formData.pickup_start}
                onChange={(e) => setFormData({ ...formData, pickup_start: e.target.value })}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pickup Window End *</label>
              <input
                type="datetime-local"
                required
                value={formData.pickup_end}
                onChange={(e) => setFormData({ ...formData, pickup_end: e.target.value })}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
              />
            </div>
          </div>

          {/* Row 4: Allergens & Dietary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.dietary_tags}
                onChange={(e) => setFormData({ ...formData, dietary_tags: e.target.value })}
                placeholder="Vegetarian, Halal, Gluten-Free..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Allergen Declarations *</label>
              <input
                type="text"
                required
                value={formData.allergen_info}
                onChange={(e) => setFormData({ ...formData, allergen_info: e.target.value })}
                placeholder="e.g. Contains Wheat, Dairy; Nut-Free"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Row 5: Pickup Location & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pickup Address *</label>
              <input
                type="text"
                required
                value={formData.pickup_address}
                onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                placeholder="Street address and dock number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pickup Loading Instructions</label>
              <input
                type="text"
                value={formData.pickup_instructions}
                onChange={(e) => setFormData({ ...formData, pickup_instructions: e.target.value })}
                placeholder="e.g. Ring service bell at rear alley entrance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Mandatory Food-Safety Notice & Certification Checkbox */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="safety_check"
                required
                checked={formData.food_safety_certified}
                onChange={(e) => setFormData({ ...formData, food_safety_certified: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-amber-300 focus:ring-emerald-500 shrink-0 cursor-pointer"
              />
              <label htmlFor="safety_check" className="text-[11px] text-amber-950 leading-relaxed cursor-pointer">
                <strong>Mandatory Food-Safety Certification:</strong> I certify that this food was prepared, cooled, and packaged in compliance with applicable local food-safety regulations and sanitation standards. I provide accurate handling instructions and acknowledge that FoodBridge is a redistribution communication platform and does not certify, test, or guarantee food safety.
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.food_safety_certified}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Creating Listing...' : 'Publish Food Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
