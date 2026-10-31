import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FoodListing } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RequestModal } from '../components/RequestModal';
import { ReportModal } from '../components/ReportModal';
import {
  ArrowLeft,
  Utensils,
  Clock,
  MapPin,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Box,
  KeyRound,
  FileText
} from 'lucide-react';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchListing = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getListing(parseInt(id, 10));
      setListing(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This food listing may have expired or been removed.'}</p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.donor_id;
  const isAvailable = listing.status === 'available';

  const getStorageBadge = (storage: string) => {
    switch (storage) {
      case 'refrigerated':
        return { label: 'Refrigerated (< 41°F / 5°C)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'hot_holding':
        return { label: 'Hot-Holding (> 140°F / 60°C)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'frozen':
        return { label: 'Frozen (< 0°F / -18°C)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      default:
        return { label: 'Ambient / Room Temperature', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  const storageBadge = getStorageBadge(listing.storage_requirement);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all food listings
        </Link>

        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Report concern
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Food Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header info */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {listing.category.replace('_', ' ')}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${storageBadge.color}`}>
                  {storageBadge.label}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    listing.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Status: {listing.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {listing.donor?.org_name || 'Commercial Donor'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {listing.pickup_city}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Description & Handling Notes
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Nutritional & Allergen Disclosures */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                Allergens & Dietary Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block mb-0.5">Declared Allergens:</span>
                  <span className="font-semibold text-slate-800">
                    {listing.allergen_info || 'None declared by donor'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Dietary Compatibility:</span>
                  <span className="font-semibold text-slate-800">
                    {listing.dietary_tags || 'Standard commercial preparation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timings breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Preparation Time
                </span>
                <p className="font-bold text-slate-800 text-xs">
                  {new Date(listing.preparation_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Use-By Deadline
                </span>
                <p className="font-bold text-slate-800 text-xs">
                  {new Date(listing.use_by_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <span className="text-[11px] text-emerald-700 font-medium block flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> Pickup Window Today
                </span>
                <p className="font-bold text-emerald-900 text-xs">
                  {new Date(listing.pickup_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(listing.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Packaging & Safety attestation */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Donor Certified Food Safety Standards</span>
              </div>
              <p className="text-emerald-900 text-xs leading-relaxed">
                The donor has certified that this donation complies with local food handling codes and temperature requirements. Packaging:{' '}
                <strong>{listing.packaging_info || 'Food-grade sealed containers'}</strong>.
              </p>
              {listing.food_safety_notes && (
                <p className="text-[11px] text-emerald-700 italic">
                  Note from donor: "{listing.food_safety_notes}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Claim / Pickup Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 sticky top-20">
            <div>
              <p className="text-xs text-slate-400 font-medium">Available Quantity</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {listing.quantity} {listing.unit}
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <Utensils className="w-3.5 h-3.5" />
                Feeds approximately ~{listing.estimated_meals} individuals
              </p>
            </div>

            {/* Pickup Address & Instructions */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Pickup Location
              </p>
              <p className="text-slate-700 font-medium">{listing.pickup_address}</p>
              <p className="text-slate-500 text-[11px]">
                {listing.pickup_city}, {listing.pickup_zip}
              </p>
              {listing.pickup_instructions && (
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <strong>Instructions:</strong> {listing.pickup_instructions}
                </div>
              )}
            </div>

            {/* Pickup Security Code (if donor or accepted) */}
            {isOwner && listing.pickup_code && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Your Pickup Security Code
                </p>
                <p className="font-mono text-xl font-bold text-amber-900 tracking-wider">
                  {listing.pickup_code}
                </p>
                <p className="text-[10px] text-amber-700">
                  Share this code with the arriving charity driver to authenticate handover.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {isAvailable ? (
                isOwner ? (
                  <button
                    onClick={() => navigate('/donor/dashboard')}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Manage in Donor Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Claim Food for Charity Pickup
                  </button>
                )
              ) : (
                <div className="w-full py-3 bg-slate-100 text-slate-500 text-center rounded-xl text-xs font-bold">
                  Listing Status: {listing.status.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <RequestModal
        listing={listing}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSuccess={() => {
          fetchListing();
          navigate('/recipient/dashboard');
        }}
      />

      {/* Report Modal */}
      <ReportModal
        listingId={listing.id}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};
