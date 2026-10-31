import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  UtensilsCrossed,
  Utensils,
  HeartHandshake,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<UserRole>(
    searchParams.get('role') === 'donor' ? 'donor' : 'recipient'
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    org_name: '',
    org_type: role === 'donor' ? 'Restaurant' : 'Food Bank / Pantry',
    phone: '',
    address: '',
    city: 'Metropolis',
    charity_reg_number: '',
    refrigerated_transport: false,
    volunteer_capacity: '',
    mission_statement: '',
    food_safety_cert_id: '',
    terms_agreed: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms_agreed) {
      setError('You must agree to the platform terms and food safety policy.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        ...formData,
        role,
      });
      navigate(role === 'donor' ? '/donor/dashboard' : '/recipient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Register for FoodBridge
          </h2>
          <p className="text-xs text-slate-500">
            Join the network rescuing surplus food and supporting community nourishment
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setRole('recipient');
              setFormData((prev) => ({ ...prev, org_type: 'Food Bank / Pantry' }));
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'recipient'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Charity / Recipient</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('donor');
              setFormData((prev) => ({ ...prev, org_type: 'Restaurant' }));
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'donor'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>Food Business / Donor</span>
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Org Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {role === 'donor' ? 'Business / Kitchen Name *' : 'Organization / Charity Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                  placeholder={role === 'donor' ? 'The Artisan Bakehouse' : 'City Hope Shelter'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization Category *</label>
                <select
                  value={formData.org_type}
                  onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {role === 'donor' ? (
                    <>
                      <option value="Restaurant">Restaurant / Bistro</option>
                      <option value="Bakery">Bakery & Pastry Shop</option>
                      <option value="Caterer / Banquet">Caterer / Banquet Facility</option>
                      <option value="Supermarket / Grocery">Supermarket / Grocery Store</option>
                      <option value="Community Kitchen">Community Kitchen / Commissary</option>
                    </>
                  ) : (
                    <>
                      <option value="Homeless Shelter">Emergency Homeless Shelter</option>
                      <option value="Food Bank / Pantry">Food Bank & Community Pantry</option>
                      <option value="Youth & Family Haven">Youth & Family Center</option>
                      <option value="Soup Kitchen">Soup Kitchen</option>
                      <option value="Faith-Based Charity">Faith-Based Charity</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Contact Person & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@org.org"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password (min 6 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Metropolis"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Role-Specific fields */}
            {role === 'donor' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Safety / Commercial Kitchen Permit ID</label>
                <input
                  type="text"
                  value={formData.food_safety_cert_id}
                  onChange={(e) => setFormData({ ...formData, food_safety_cert_id: e.target.value })}
                  placeholder="e.g. FSS-NY-89124"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Charity / 501(c)(3) Reg Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.charity_reg_number}
                      onChange={(e) => setFormData({ ...formData, charity_reg_number: e.target.value })}
                      placeholder="e.g. CH-501C3-882341"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="refrig_vehicle"
                      checked={formData.refrigerated_transport}
                      onChange={(e) => setFormData({ ...formData, refrigerated_transport: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="refrig_vehicle" className="font-medium text-slate-700">
                      Equipped with Refrigerated Transport
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mission Statement / Service Overview</label>
                  <textarea
                    rows={2}
                    value={formData.mission_statement}
                    onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                    placeholder="Briefly state who your organization serves and daily meal distribution..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Mandatory Terms Checkbox */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="terms_agree"
                required
                checked={formData.terms_agreed}
                onChange={(e) => setFormData({ ...formData, terms_agreed: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="terms_agree" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                I agree to the FoodBridge platform terms. I acknowledge that FoodBridge coordinates food surplus redistribution and <strong>does not inspect, endorse, or certify food safety</strong>. All parties agree to adhere to Good Samaritan food safety protocols.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
