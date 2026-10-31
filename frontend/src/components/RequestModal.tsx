import React, { useState } from 'react';
import { FoodListing } from '../types';
import { api } from '../services/api';
import { X, Truck, Clock, Phone, AlertCircle, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface RequestModalProps {
  listing: FoodListing | null;
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

export const RequestModal: React.FC<RequestModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultETA = listing
    ? toLocalISOString(new Date(new Date(listing.pickup_start).getTime() + 15 * 60 * 1000))
    : toLocalISOString(new Date(Date.now() + 30 * 60 * 1000));

  const [formData, setFormData] = useState({
    requested_quantity: 'All available',
    transport_type: 'Refrigerated Van',
    estimated_pickup_time: defaultETA,
    contact_phone: '+1 (555) 678-9012',
    recipient_notes: 'Our volunteer pickup team will arrive with clean insulated carriers to distribute this evening.',
    safety_acknowledged: false,
  });

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.safety_acknowledged) {
      setError('You must acknowledge the recipient on-site food safety inspection protocol.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createRequest({
        listing_id: listing.id,
        requested_quantity: formData.requested_quantity || `${listing.quantity} ${listing.unit}`,
        transport_type: formData.transport_type,
        estimated_pickup_time: new Date(formData.estimated_pickup_time || defaultETA).toISOString(),
        contact_phone: formData.contact_phone,
        recipient_notes: formData.recipient_notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
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
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request Food Donation</h3>
              <p className="text-xs text-slate-500">Coordinate pickup with {listing.donor?.org_name || 'Donor'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview banner */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
          <p className="font-bold text-slate-900">{listing.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
            <span>
              Available: <strong>{listing.quantity} {listing.unit}</strong> (~{listing.estimated_meals} meals)
            </span>
            <span>
              Pickup: <strong>{new Date(listing.pickup_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(listing.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Requested Quantity</label>
            <input
              type="text"
              value={formData.requested_quantity}
              onChange={(e) => setFormData({ ...formData, requested_quantity: e.target.value })}
              placeholder="e.g. All available, or 20 kg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Transport Vehicle *
              </label>
              <select
                value={formData.transport_type}
                onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Refrigerated Van">Refrigerated Cargo Van</option>
                <option value="Insulated Cambros / Thermal Bags">Thermal Insulated Food Bags</option>
                <option value="Standard Vehicle / Car">Standard Passenger Vehicle</option>
                <option value="Cargo Bicycle / Walking Cart">Cargo Bike / Hand Cart</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Estimated Arrival Time (ETA) *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.estimated_pickup_time || defaultETA}
                onChange={(e) => setFormData({ ...formData, estimated_pickup_time: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              On-Site Driver / Volunteer Phone *
            </label>
            <input
              type="text"
              required
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes to Donor</label>
            <textarea
              rows={2}
              value={formData.recipient_notes}
              onChange={(e) => setFormData({ ...formData, recipient_notes: e.target.value })}
              placeholder="Provide volunteer names or arrival details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Safety Verification Agreement */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="safety_check_recipient"
              required
              checked={formData.safety_acknowledged}
              onChange={(e) => setFormData({ ...formData, safety_acknowledged: e.target.checked })}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="safety_check_recipient" className="text-[11px] text-emerald-950 leading-relaxed cursor-pointer">
              <strong>Inspection Acknowledgment:</strong> Our charitable team will inspect food temperature, packaging integrity, and quality upon physical pickup. We verify our transport vehicle is equipped with necessary cold/hot holding equipment.
            </label>
          </div>

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
              disabled={loading || !formData.safety_acknowledged}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Claim Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
