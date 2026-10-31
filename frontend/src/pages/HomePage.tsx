import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FoodListing, ImpactMetrics } from '../types';
import { api } from '../services/api';
import { ListingCard } from '../components/ListingCard';
import { ListingFilters } from '../components/ListingFilters';
import { InteractiveMap } from '../components/InteractiveMap';
import { RequestModal } from '../components/RequestModal';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  Leaf,
  ShieldCheck,
  Building2,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  Map,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [claimingListing, setClaimingListing] = useState<FoodListing | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dietary: '',
    storage: '',
    urgent_only: false,
  });

  const fetchData = async () => {
    try {
      const [listingsData, impactData] = await Promise.all([
        api.getListings({
          category: filters.category || undefined,
          dietary: filters.dietary || undefined,
          storage: filters.storage || undefined,
          search: filters.search || undefined,
          urgent_only: filters.urgent_only || undefined,
        }),
        api.getImpact(),
      ]);
      setListings(listingsData);
      setImpact(impactData);
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleClaim = (listing: FoodListing) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'recipient' && user.role !== 'admin') {
      alert('Only registered charitable organizations (Recipients) can claim food donations. Switch roles via the demo switcher above to test claiming!');
      return;
    }
    setClaimingListing(listing);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 -mt-2">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HACK-P197 • Certified Safe Surplus Food Redistribution Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Connect surplus food with those who need it most.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              FoodBridge bridges the gap between commercial kitchens, bakeries, caterers, and supermarkets with verified local food banks and shelters. Zero waste. Maximum community impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/browse"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Find Available Food</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user?.role === 'donor' ? '/donor/dashboard?create=true' : '/register?role=donor'}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Donate Surplus Food</span>
              </Link>
            </div>
          </div>

          {/* Live Platform Impact Ticker Cards */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Utensils className="w-4 h-4" />
                <span className="text-xs font-semibold">Meals Provided</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {impact ? impact.total_meals_provided.toLocaleString() : '520+'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">High-nutrition meals served</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-teal-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">Food Rescued</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {impact ? `${impact.total_kg_redistributed.toLocaleString()} kg` : '217 kg'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Commercial surplus diverted</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Leaf className="w-4 h-4" />
                <span className="text-xs font-semibold">CO₂e Avoided</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {impact ? `${impact.co2e_avoided_kg.toLocaleString()} kg` : '542 kg'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Greenhouse emissions saved</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <HeartHandshake className="w-4 h-4" />
                <span className="text-xs font-semibold">Verified Charities</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {impact ? impact.verified_recipients_count : '3'} Nonprofits
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Shelters, pantries & kitchens</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Available Food Donations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time surplus food listings ready for pickup across Metropolis
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

        {/* Listings Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No matching food donations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your category, dietary, or search filters to see all available surplus food.
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
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A complete, safe, and transparent workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed to eliminate food waste while maintaining strict temperature and food safety integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Commercial Donors List Food</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Restaurants, caterers, bakeries, and grocers publish surplus food with accurate preparation timestamps, storage temperatures, allergens, and pickup windows.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Mandatory food-safety certification</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verified Charities Claim</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified shelters and food banks filter by location, dietary tags, and volume. They submit vehicle details, driver ETA, and claim the donation with race-condition prevention.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Atomic double-booking prevention</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">On-Site Verification & Handover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drivers verify temperature and packaging integrity on arrival. Custody is authenticated via a unique 4-digit pickup security PIN, instantly updating community impact metrics.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium pt-1">
                <Clock className="w-4 h-4" />
                <span>Real-time audit & impact tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Modal Dialog */}
      <RequestModal
        listing={claimingListing}
        isOpen={!!claimingListing}
        onClose={() => setClaimingListing(null)}
        onSuccess={() => {
          fetchData();
          navigate('/recipient/dashboard');
        }}
      />
    </div>
  );
};
