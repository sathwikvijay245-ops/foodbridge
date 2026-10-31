import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ImpactMetrics } from '../types';
import {
  Utensils,
  Leaf,
  Droplets,
  Award,
  TrendingUp,
  Download,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Printer,
  Sparkles
} from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getImpact()
      .then((data) => setImpact(data))
      .catch((err) => console.error('Failed to load impact metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrintCertificate = () => {
    window.print();
  };

  if (loading || !impact) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Calculate max kg for category progress bars
  const maxCategoryKg = Math.max(...impact.category_breakdown.map((c) => c.quantity_kg), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Food Rescue & Environmental Impact
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking verified surplus food redistribution, hunger relief, and carbon diversion across Metropolis
          </p>
        </div>

        <button
          onClick={handlePrintCertificate}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Impact Summary
        </button>
      </div>

      {/* Top 4 Core Impact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-2xl text-white shadow-md shadow-emerald-600/15 space-y-2">
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-xs font-semibold">Meals Provided</span>
            <Utensils className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {impact.total_meals_provided.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-100 font-medium">
            Calculated via UN FAO standards (~0.42 kg/meal)
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Food Rescued</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {impact.total_kg_redistributed.toLocaleString()} <span className="text-base text-slate-400 font-normal">kg</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Over {impact.total_donations_completed} completed rescues
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">CO₂e Avoided</span>
            <Leaf className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {impact.co2e_avoided_kg.toLocaleString()} <span className="text-base text-slate-400 font-normal">kg</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Equivalent to ~{Math.round(impact.co2e_avoided_kg * 2.4)} vehicle miles avoided
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Water Conserved</span>
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {(impact.water_saved_liters / 1000).toFixed(1)}k <span className="text-base text-slate-400 font-normal">liters</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Agricultural water footprint saved
          </p>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Top Donors Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              Redistributed Food by Category
            </h3>
            <span className="text-xs text-slate-400">Total Volume</span>
          </div>

          <div className="space-y-3 pt-2">
            {impact.category_breakdown.map((cat, idx) => {
              const pct = Math.round((cat.quantity_kg / maxCategoryKg) * 100);
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 capitalize">{cat.label}</span>
                    <span className="font-bold text-slate-900">{cat.quantity_kg} kg</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Donors Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Donor Hero Leaderboard
            </h3>
            <span className="text-xs text-slate-400">Total Rescued</span>
          </div>

          <div className="divide-y divide-slate-100">
            {impact.top_donors.map((d, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{d.name}</p>
                    <p className="text-[10px] text-slate-400">{d.donations} donations completed</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900">{d.kg} kg</span>
                  <span className="block text-[10px] text-emerald-700 font-semibold">
                    ~{d.meals} meals
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Recipient Non-Profits & Recent Completed Rescues Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Non-Profit Distributers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              Top Charitable Distribution Hubs
            </h3>
            <span className="text-xs text-slate-400">Nonprofit Impact</span>
          </div>

          <div className="divide-y divide-slate-100">
            {impact.top_recipients.map((r, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <p className="text-[10px] text-slate-400">{r.received_count} completed pickups</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900">{r.kg} kg received</span>
                  <span className="block text-[10px] text-emerald-700 font-semibold">
                    ~{r.meals} meals served
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Handover Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recent Verified Handover Feed
            </h3>
            <span className="text-xs text-slate-400">Live Activity</span>
          </div>

          <div className="space-y-2.5">
            {impact.recent_completions.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.donor_org} • {item.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-700">+{item.meals} meals</span>
                  <span className="block text-[10px] text-slate-500 font-medium">{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
