import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DonationRequest } from '../types';
import { api } from '../services/api';
import {
  X,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface PickupChecklistModalProps {
  request: DonationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDonor?: boolean;
}

export const PickupChecklistModal: React.FC<PickupChecklistModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
  isDonor,
}) => {
  const [tempChecked, setTempChecked] = useState(false);
  const [sealsChecked, setSealsChecked] = useState(false);
  const [visualChecked, setVisualChecked] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const listing = request.listing;
  const isChecklistComplete = tempChecked && sealsChecked && visualChecked;

  const handleComplete = async () => {
    if (!isChecklistComplete) {
      setError('Please complete all 3 food safety on-site inspection checks.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.handleRequestAction(request.id, 'complete', {
        pickup_code: pickupCode,
        notes: 'Handover verified and on-site checklist completed.',
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // ignore
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the 4-digit code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">On-Site Pickup Verification</h3>
              <p className="text-xs text-slate-500">Inspect food and confirm custody handover</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing details preview */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
          <p className="font-bold text-slate-900">{listing?.title}</p>
          <div className="flex items-center justify-between text-slate-600 text-[11px]">
            <span>
              Rescued: <strong>{listing?.quantity} {listing?.unit}</strong> (~{listing?.estimated_meals} meals)
            </span>
            <span className="font-medium text-emerald-700">
              Storage: {listing?.storage_requirement.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inspection Protocol Checklist */}
        <div className="mt-4 space-y-3">
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Mandatory Safety Handover Checklist:
          </p>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition cursor-pointer">
            <input
              type="checkbox"
              checked={tempChecked}
              onChange={(e) => setTempChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-xs">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                1. Safe Temperature Verification
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Food is verified below 41°F (chilled/cold items) or above 140°F (hot-holding meals).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition cursor-pointer">
            <input
              type="checkbox"
              checked={sealsChecked}
              onChange={(e) => setSealsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-xs">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                2. Sealed Packaging & Sanitation Check
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All food containers are clean, securely sealed, and free of physical contamination or damage.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition cursor-pointer">
            <input
              type="checkbox"
              checked={visualChecked}
              onChange={(e) => setVisualChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-xs">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                3. Visual & Sensory Inspection
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Food has normal color and fresh aroma. Allergen disclosures match labels.
              </p>
            </div>
          </label>
        </div>

        {/* 4-Digit Pickup PIN Verification Section */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Pickup Verification PIN
            </label>
            {isDonor && listing?.pickup_code && (
              <span className="text-[11px] text-slate-500">
                Your Listing Code: <strong className="font-mono text-emerald-700 font-bold">{listing.pickup_code}</strong>
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            {isDonor
              ? "Share your 4-digit listing PIN with the recipient driver or enter it below to confirm handoff."
              : "Ask the donor for their 4-digit pickup security PIN to authenticate transfer:"}
          </p>

          <input
            type="text"
            maxLength={6}
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value)}
            placeholder={listing?.pickup_code ? `e.g. ${listing.pickup_code}` : 'Enter 4-digit PIN'}
            className="w-full text-center text-lg font-mono font-bold tracking-widest py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading || !isChecklistComplete}
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Verifying...' : 'Complete Donation Handover'}
          </button>
        </div>
      </div>
    </div>
  );
};
