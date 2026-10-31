import React from 'react';
import { FoodListing } from '../types';
import {
  Clock,
  MapPin,
  Utensils,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface ListingCardProps {
  listing: FoodListing;
  onSelect: (listing: FoodListing) => void;
  onRequest?: (listing: FoodListing) => void;
  isOwner?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onRequest,
  isOwner,
}) => {
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'cooked_meals':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cooked Meals', icon: '🍲' };
      case 'bakery_pastries':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Bakery & Pastries', icon: '🥖' };
      case 'fresh_produce':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Fresh Produce', icon: '🍎' };
      case 'dairy_chilled':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Dairy & Chilled', icon: '🥛' };
      case 'packaged_pantry':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Pantry Staples', icon: '🥫' };
      case 'beverages':
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Beverages', icon: '🧃' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Other Surplus', icon: '🥗' };
    }
  };

  const getStorageBadge = (storage: string) => {
    switch (storage) {
      case 'refrigerated':
        return { label: 'Refrigerated (< 41°F)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'hot_holding':
        return { label: 'Hot-Holding (> 140°F)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'frozen':
        return { label: 'Frozen (< 0°F)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      default:
        return { label: 'Ambient / Room Temp', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  // Check if expiring within 3 hours
  const now = new Date().getTime();
  const endTime = new Date(listing.pickup_end).getTime();
  const diffHours = (endTime - now) / (1000 * 60 * 60);
  const isUrgent = diffHours > 0 && diffHours <= 3.5;

  const catTheme = getCategoryTheme(listing.category);
  const storageBadge = getStorageBadge(listing.storage_requirement);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Header with Badges */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${catTheme.bg}`}
            >
              <span>{catTheme.icon}</span>
              {catTheme.label}
            </span>

            {isUrgent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Expiring in {Math.max(1, Math.round(diffHours))}h
              </span>
            )}

            {listing.status !== 'available' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {listing.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(listing)}
            className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition cursor-pointer line-clamp-1"
          >
            {listing.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Quantity & Meals highlight bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 border-y border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium">Quantity: </span>
            <span className="font-bold text-slate-900">
              {listing.quantity} {listing.unit}
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
            <Utensils className="w-3.5 h-3.5" />
            <span>~{listing.estimated_meals} meals</span>
          </div>
        </div>

        {/* Detailed specifications */}
        <div className="p-4 sm:p-5 pt-3 space-y-2 text-xs text-slate-600">
          {/* Storage Requirement */}
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${storageBadge.color}`}>
              {storageBadge.label}
            </span>
          </div>

          {/* Pickup Window */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Pickup today:{' '}
              <strong className="text-slate-800">
                {new Date(listing.pickup_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(listing.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </span>
          </div>

          {/* Location & Donor */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {listing.donor?.org_name || 'Donor'} • {listing.pickup_city}
            </span>
          </div>

          {/* Dietary Tags if present */}
          {listing.dietary_tags && (
            <div className="flex flex-wrap gap-1 pt-1">
              {listing.dietary_tags.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-50 mt-2">
        <div className="flex items-center justify-between gap-2 pt-3">
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium" title="Donor certified compliance with food safety regulations">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safety Certified</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(listing)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Details
            </button>
            {onRequest && listing.status === 'available' && !isOwner && (
              <button
                onClick={() => onRequest(listing)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                Claim Food
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
