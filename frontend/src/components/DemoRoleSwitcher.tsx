import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ChevronDown, Check, UserCheck, Shield, Utensils, HeartHandshake } from 'lucide-react';

export const DemoRoleSwitcher: React.FC = () => {
  const { user, demoUsers, demoLogin, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'donor':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'recipient':
        return <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />;
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <UserCheck className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'donor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'recipient':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/5 hover:bg-slate-900/10 border border-slate-300/60 rounded-xl text-xs font-medium text-slate-700 transition"
        title="Switch demo persona for quick evaluation"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline text-slate-500">Test Role:</span>
        <span className="font-semibold text-slate-900 flex items-center gap-1">
          {user ? (
            <>
              {getRoleIcon(user.role)}
              <span className="truncate max-w-[140px]">{user.org_name || user.full_name}</span>
            </>
          ) : (
            'Select Demo Account'
          )}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-scale-up">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hackathon Demo Switcher
              </p>
              <p className="text-[11px] text-slate-500">One-click test sign-in for all three platform roles:</p>
            </div>

            <div className="py-1 max-h-80 overflow-y-auto space-y-1">
              {/* Admins */}
              <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
                Administrator
              </div>
              {demoUsers
                .filter((u) => u.role === 'admin')
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={async () => {
                      await demoLogin(u.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                      user?.id === u.id
                        ? 'bg-purple-50 text-purple-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <p className="truncate font-medium">{u.org_name}</p>
                        <p className="text-[10px] text-slate-400">{u.full_name}</p>
                      </div>
                    </div>
                    {user?.id === u.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                ))}

              {/* Recipients */}
              <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Charitable Organizations (Recipients)
              </div>
              {demoUsers
                .filter((u) => u.role === 'recipient')
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={async () => {
                      await demoLogin(u.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                      user?.id === u.id
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="truncate font-medium">{u.org_name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{u.org_type || 'Charity'}</span>
                          {u.verification_status === 'pending' && (
                            <span className="text-amber-600 font-medium">Pending Verif.</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {user?.id === u.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}

              {/* Donors */}
              <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                Food Businesses (Donors)
              </div>
              {demoUsers
                .filter((u) => u.role === 'donor')
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={async () => {
                      await demoLogin(u.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                      user?.id === u.id
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="truncate font-medium">{u.org_name}</p>
                        <p className="text-[10px] text-slate-400">{u.org_type}</p>
                      </div>
                    </div>
                    {user?.id === u.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
