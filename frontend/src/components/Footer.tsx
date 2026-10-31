import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Scale, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight">FoodBridge</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded">
                HACK-P197
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowering food businesses and verified charitable nonprofits to safely rescue and redistribute surplus food, eliminate hunger, and cut carbon emissions.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white text-xs uppercase tracking-wider">Navigation</h5>
            <ul className="space-y-1.5">
              <li><Link to="/browse" className="hover:text-emerald-400 transition">Discover Surplus Food</Link></li>
              <li><Link to="/impact" className="hover:text-emerald-400 transition">Community Impact Metrics</Link></li>
              <li><Link to="/donor/dashboard" className="hover:text-emerald-400 transition">Commercial Donor Portal</Link></li>
              <li><Link to="/recipient/dashboard" className="hover:text-emerald-400 transition">Verified Charities Hub</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white text-xs uppercase tracking-wider">Safety & Legal Notice</h5>
            <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-400">
              <p className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Protected under Good Samaritan Food Donation Laws.
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                FoodBridge facilitates logistics; platform does not certify or inspect food safety.
              </p>
            </div>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white text-xs uppercase tracking-wider">Hackathon Project</h5>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] space-y-1">
              <p className="text-white font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Student Hackathon Entry
              </p>
              <p className="text-slate-400">Code: <span className="font-mono text-emerald-400">HACK-P197</span></p>
              <p className="text-slate-400">Full stack: React, TypeScript, Tailwind, FastAPI, PostgreSQL / SQLite.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 FoodBridge Redistribution Platform. Built for HACK-P197.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with care to end food waste and fight hunger</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
