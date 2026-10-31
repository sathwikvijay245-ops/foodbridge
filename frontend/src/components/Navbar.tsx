import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
import { NotificationDropdown } from './NotificationDropdown';
import {
  UtensilsCrossed,
  PlusCircle,
  BarChart3,
  Search,
  Shield,
  LogOut,
  Menu,
  X,
  Package,
  HeartHandshake
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  FoodBridge
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                  HACK-P197
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
                Surplus Food Redistribution
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/browse"
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Find Surplus Food
          </Link>

          <Link
            to="/impact"
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            Impact Metrics
          </Link>

          {/* Role specific quick links */}
          {user?.role === 'donor' && (
            <Link
              to="/donor/dashboard"
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-amber-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              Donor Dashboard
            </Link>
          )}

          {user?.role === 'recipient' && (
            <Link
              to="/recipient/dashboard"
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <HeartHandshake className="w-4 h-4" />
              Recipient Hub
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-purple-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Admin Center
            </Link>
          )}
        </nav>

        {/* Right side controls: Role Switcher, Notification, Action CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Persona Switcher */}
          <DemoRoleSwitcher />

          {/* Notification Popover if logged in */}
          {user && <NotificationDropdown />}

          {/* Primary Action Button */}
          {user?.role === 'donor' ? (
            <Link
              to="/donor/dashboard?create=true"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md hover:from-emerald-500 hover:to-teal-500 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              List Food
            </Link>
          ) : user?.role === 'recipient' ? (
            <Link
              to="/browse"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md hover:from-emerald-500 hover:to-teal-500 transition"
            >
              <Search className="w-3.5 h-3.5" />
              Rescue Food
            </Link>
          ) : null}

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 rounded-xl hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition shadow-xs"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Find Surplus Food
          </Link>
          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Impact Dashboard
          </Link>
          {user?.role === 'donor' && (
            <Link
              to="/donor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-amber-700 rounded-lg hover:bg-amber-50"
            >
              Donor Dashboard
            </Link>
          )}
          {user?.role === 'recipient' && (
            <Link
              to="/recipient/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-emerald-700 rounded-lg hover:bg-emerald-50"
            >
              Recipient Dashboard & Claims
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-purple-700 rounded-lg hover:bg-purple-50"
            >
              Admin Moderation Center
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
