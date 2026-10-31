import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DonationRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PickupChecklistModal } from '../components/PickupChecklistModal';
import {
  HeartHandshake,
  Clock,
  MapPin,
  Truck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Building2,
  ShieldCheck,
  XCircle
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReqForPickup, setSelectedReqForPickup] = useState<DonationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching recipient requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleCancelRequest = async (requestId: number) => {
    const confirm = window.confirm('Cancel this donation claim? If this was accepted, the food will be released back to other charities.');
    if (!confirm) return;
    try {
      await api.handleRequestAction(requestId, 'cancel', { notes: 'Cancelled by charity team' });
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'active') {
      return r.status === 'pending' || r.status === 'accepted';
    }
    if (statusFilter === 'completed') {
      return r.status === 'completed';
    }
    return true;
  });

  const isVerified = user?.verification_status === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Charitable Recipient Hub
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                isVerified
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isVerified ? 'Verified Non-Profit' : 'Pending Verification'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user?.org_name} • Manage claimed food donations, pickup schedules & verification
          </p>
        </div>

        <Link
          to="/browse"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Find More Food
        </Link>
      </div>

      {/* Verification Warning if not yet verified */}
      {!isVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Organization Profile Under Review</p>
            <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
              Your charity documentation (Reg: {user?.charity_reg_number || 'Pending'}) is being reviewed by FoodBridge compliance admins. Once approved, your team can claim surplus food immediately.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'active'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Pickups ({requests.filter((r) => r.status === 'pending' || r.status === 'accepted').length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'completed'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed Rescues ({requests.filter((r) => r.status === 'completed').length})
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Requests ({requests.length})
        </button>
      </div>

      {/* Request Cards Grid */}
      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      ) : filteredRequests.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No {statusFilter} food donation requests</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore live surplus food listings in your area to coordinate pickup for your shelter or pantry.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            <Search className="w-4 h-4" />
            Discover Surplus Food
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((r) => {
            const listing = r.listing;
            const isAccepted = r.status === 'accepted';
            const isCompleted = r.status === 'completed';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 text-xs"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {listing?.category.replace('_', ' ') || 'Food Item'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Status: {r.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {listing?.title || `Listing #${r.listing_id}`}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {listing ? `${listing.quantity} ${listing.unit}` : r.requested_quantity}
                    </span>
                    {listing && (
                      <span className="block text-[11px] text-emerald-700 font-semibold">
                        ~{listing.estimated_meals} meals provided
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
                  {/* Donor & Address */}
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Donor Provider</span>
                    <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {listing?.donor?.org_name || 'Commercial Donor'}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{listing?.pickup_address || 'Address provided upon acceptance'}</span>
                    </p>
                  </div>

                  {/* Pickup Window */}
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Pickup Window Today</span>
                    <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {listing ? (
                        <>
                          {new Date(listing.pickup_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(listing.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : (
                        'Standard Hours'
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Your Driver ETA: {new Date(r.estimated_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Transport & Instructions */}
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Assigned Transport</span>
                    <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      {r.transport_type}
                    </p>
                    {listing?.pickup_instructions && (
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        Dock: {listing.pickup_instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Accepted Details & Pickup Code Box */}
                {isAccepted && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Donation Request Accepted by Donor!
                      </p>
                      <p className="text-xs text-emerald-800">
                        Please arrive with clean insulated containers. Have your driver perform the 3 safety checks upon arrival.
                      </p>
                    </div>

                    {listing?.pickup_code && (
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-center shrink-0">
                        <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
                          Pickup Security Code
                        </span>
                        <span className="font-mono text-xl font-extrabold text-emerald-950 tracking-widest">
                          {listing.pickup_code}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection / Cancellation Notes */}
                {(r.donor_response_notes || r.cancellation_reason) && (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px]">
                    <strong>Update Note:</strong> {r.donor_response_notes || r.cancellation_reason}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    Requested on {new Date(r.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(r.id)}
                        className="px-3.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition"
                      >
                        Cancel Request
                      </button>
                    )}

                    {isAccepted && (
                      <>
                        <button
                          onClick={() => handleCancelRequest(r.id)}
                          className="px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition"
                        >
                          Unable to Pick Up
                        </button>
                        <button
                          onClick={() => setSelectedReqForPickup(r)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          On-Site Inspection & Complete Pickup
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Rescued & Distributed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pickup Verification Modal */}
      <PickupChecklistModal
        request={selectedReqForPickup}
        isOpen={!!selectedReqForPickup}
        onClose={() => setSelectedReqForPickup(null)}
        onSuccess={() => {
          fetchRequests();
        }}
        isDonor={false}
      />
    </div>
  );
};
