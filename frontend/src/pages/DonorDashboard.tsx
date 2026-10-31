import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FoodListing, DonationRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreateListingModal } from '../components/CreateListingModal';
import { PickupChecklistModal } from '../components/PickupChecklistModal';
import {
  PlusCircle,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  KeyRound,
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>(
    searchParams.get('tab') === 'requests' ? 'requests' : 'listings'
  );
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('create') === 'true');
  const [selectedReqForPickup, setSelectedReqForPickup] = useState<DonationRequest | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [listingsData, requestsData] = await Promise.all([
        api.getListings({ donor_id: user.id, include_all_statuses: true }),
        api.getRequests(),
      ]);
      setListings(listingsData);
      setRequests(requestsData);
    } catch (err: any) {
      console.error('Error fetching donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAcceptRequest = async (reqId: number) => {
    setActionError(null);
    try {
      await api.handleRequestAction(reqId, 'accept', { notes: 'Accepted! Our staff will assist loading.' });
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (reqId: number) => {
    const reason = window.prompt('Reason for declining this request:', 'Capacity limit reached');
    if (reason === null) return;
    setActionError(null);
    try {
      await api.handleRequestAction(reqId, 'reject', { notes: reason });
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject request');
    }
  };

  const handleCancelListing = async (listingId: number) => {
    const confirm = window.confirm('Are you sure you want to cancel this food listing? Any pending or accepted requests will be cancelled.');
    if (!confirm) return;
    try {
      await api.cancelListing(listingId, 'Cancelled by donor');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel listing');
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Donor Management Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Commercial Donor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user?.org_name} • Manage surplus food listings and incoming charity requests
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          List Surplus Food
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          My Food Listings ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition relative ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          Incoming Requests ({requests.length})
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
              {pendingRequestsCount} new
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ) : listings.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No food donations listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Turn your kitchen surplus into community meals. List food now with safe temperature guidance.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                + List First Donation
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Food Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Quantity & Meals</th>
                      <th className="py-3 px-4">Pickup Window</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Pickup PIN</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                          {l.title}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Storage: {l.storage_requirement.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 uppercase text-[10px] font-semibold text-slate-500">
                          {l.category.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">
                            {l.quantity} {l.unit}
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-medium">
                            ~{l.estimated_meals} meals
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(l.pickup_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(l.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="block text-[10px] text-slate-400">
                            {new Date(l.pickup_end).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              l.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : l.status === 'reserved'
                                ? 'bg-amber-100 text-amber-800'
                                : l.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                          {l.pickup_code || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          {l.status === 'available' && (
                            <button
                              onClick={() => handleCancelListing(l.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Cancel Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <Truck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No incoming pickup requests</h3>
              <p className="text-xs text-slate-500">
                Requests from verified charities for your listings will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Donation Item
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {r.listing?.title || `Listing #${r.listing_id}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
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
                        Request: {r.status}
                      </span>
                    </div>
                  </div>

                  {/* Recipient Charity Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Charitable Organization:</span>
                      <p className="font-semibold text-slate-900">
                        {r.recipient?.org_name || 'Verified Non-Profit'}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Reg: {r.recipient?.charity_reg_number || 'Verified Charity'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Transport Vehicle & ETA:</span>
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {r.transport_type}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        ETA: {new Date(r.estimated_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Driver Contact:</span>
                      <p className="font-semibold text-slate-900">{r.contact_phone}</p>
                    </div>
                  </div>

                  {r.recipient_notes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px]">
                      <strong>Notes from charity:</strong> "{r.recipient_notes}"
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    {r.status === 'accepted' && r.listing?.pickup_code && (
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        <span>Pickup PIN: <strong className="font-mono text-sm">{r.listing.pickup_code}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRejectRequest(r.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(r.id)}
                            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept Request
                          </button>
                        </>
                      )}

                      {r.status === 'accepted' && (
                        <button
                          onClick={() => setSelectedReqForPickup(r)}
                          className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Verify & Complete Handover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* Pickup Verification & Completion Modal */}
      <PickupChecklistModal
        request={selectedReqForPickup}
        isOpen={!!selectedReqForPickup}
        onClose={() => setSelectedReqForPickup(null)}
        onSuccess={() => {
          fetchData();
        }}
        isDonor={true}
      />
    </div>
  );
};
