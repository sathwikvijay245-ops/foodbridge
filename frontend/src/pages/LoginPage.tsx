import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed, Sparkles, AlertCircle,
  Utensils, HeartHandshake, Shield,
  Eye, EyeOff, Loader2, Wifi, WifiOff
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, demoUsers, backendReady } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (loading) t = setTimeout(() => setSlowWarning(true), 6000);
    else setSlowWarning(false);
    return () => clearTimeout(t);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(userId);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-5">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to FoodBridge</h2>
          <p className="text-xs text-slate-500">Redistribute surplus food safely to verified charitable organizations</p>
        </div>

        {/* Server status banner */}
        {!backendReady ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-500" />
            <div>
              <span className="font-bold">Connecting to server...</span>
              <span className="text-amber-700"> The server is waking up (free plan). Please wait 20–40 seconds.</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <Wifi className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">Server is ready</span>
            <span className="text-emerald-600">— you can sign in now!</span>
          </div>
        )}

        {/* Slow login warning */}
        {slowWarning && (
          <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl flex items-start gap-2">
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Still connecting... please hold on for a few more seconds.</span>
          </div>
        )}

        {/* 1-Click Demo Box */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4" />
              1-Click Demo Logins:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">HACK-P197</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {demoUsers.length === 0 && !backendReady && (
              <div className="text-center text-xs text-slate-400 py-2 animate-pulse">
                Loading demo accounts...
              </div>
            )}
            {demoUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                onClick={() => handleDemoSignIn(u.id)}
                disabled={loading || !backendReady}
                className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs transition flex items-center justify-between cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 truncate">
                  {u.role === 'donor' ? (
                    <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : u.role === 'recipient' ? (
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-semibold block truncate">{u.org_name}</span>
                    <span className="text-[10px] text-slate-400">Role: {u.role.toUpperCase()}</span>
                  </div>
                </div>
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">Sign in →</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !backendReady}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : !backendReady ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for server...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Create an organization account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
