import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FoodListing } from '../types';
import { api } from '../services/api';
import { ListingCard } from '../components/ListingCard';
import { ListingFilters } from '../components/ListingFilters';
import { InteractiveMap } from '../components/InteractiveMap';
import { RequestModal } from '../components/RequestModal';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, Map, Utensils } from 'lucide-react';

export const BrowsePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [claimingListing, setClaimingListing] = useState<FoodListing | null>(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('cat') || '',
    dietary: '',
    storage: '',
    urgent_only: searchParams.get('urgent') === 'true',
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings({
        category: filters.category || undefined,
        dietary: filters.dietary || undefined,
        storage: filters.storage || undefined,
        search: filters.search || undefined,
        urgent_only: filters.urgent_only || undefined,
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleClaim = (listing: FoodListing) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'recipient' && user.role !== 'admin') {
      alert('Only verified recipient organizations can claim donations. Switch roles in the top demo switcher to test claiming!');
      return;
    }
    setClaimingListing(listing);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Available Food Donations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely claim surplus food from local restaurants, caterers, bakeries, and grocers
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Interactive Map
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ListingFilters
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: '',
            category: '',
            dietary: '',
            storage: '',
            urgent_only: false,
          })
        }
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{listings.length}</strong> available food donation{listings.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No food donations match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search terms or expanding your filter categories.
          </p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <InteractiveMap
            listings={listings}
            selectedListing={selectedListing}
            onSelectListing={(l) => setSelectedListing(l)}
          />
          {selectedListing && (
            <div className="max-w-md mx-auto">
              <ListingCard
                listing={selectedListing}
                onSelect={(l) => navigate(`/listings/${l.id}`)}
                onRequest={handleClaim}
                isOwner={user?.id === selectedListing.donor_id}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={(l) => navigate(`/listings/${l.id}`)}
              onRequest={handleClaim}
              isOwner={user?.id === listing.donor_id}
            />
          ))}
        </div>
      )}

      {/* Claim Request Modal */}
      <RequestModal
        listing={claimingListing}
        isOpen={!!claimingListing}
        onClose={() => setClaimingListing(null)}
        onSuccess={() => {
          fetchListings();
          navigate('/recipient/dashboard');
        }}
      />
    </div>
  );
};
