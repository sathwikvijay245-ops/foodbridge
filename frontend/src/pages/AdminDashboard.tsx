import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, FoodListing, ReportItem, AuditLogItem, VerificationStatus, ReportStatus } from '../types';
import {
  Shield,
  Users,
  Package,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Building2,
  FileCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'listings' | 'reports' | 'logs'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, listingsData, reportsData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getListings({ include_all_statuses: true }),
        api.getAdminReports(),
        api.getAdminAuditLogs(50),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setListings(listingsData);
      setReports(reportsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateVerification = async (userId: number, status: VerificationStatus) => {
    const notes = prompt(`Notes for verification update (${status}):`, 'Verified 501(c)(3) documentation');
    if (notes === null) return;
    try {
      await api.updateUserVerification(userId, status, notes);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await api.toggleUserActive(userId);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  const handleResolveReport = async (reportId: number, status: ReportStatus) => {
    const notes = prompt(`Admin moderation resolution notes:`, 'Reviewed with donor. Resolved.');
    if (notes === null) return;
    try {
      await api.resolveAdminReport(reportId, status, notes);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  const handleForceCancelListing = async (listingId: number) => {
    const reason = prompt('Reason for admin removal:', 'Policy or food safety compliance issue');
    if (!reason) return;
    try {
      await api.cancelListing(listingId, `Admin moderation: ${reason}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove listing');
    }
  };

  const pendingVerifications = users.filter(
    (u) => u.role === 'recipient' && u.verification_status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Administration & Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            HACK-P197 Food Redistribution Safety, Non-Profit Verification & Content Governance
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Total Users</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.total_users}</p>
            <p className="text-[11px] text-slate-500">
              {stats.donors_count} Donors • {stats.recipients_count} Charities
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Pending Verification</span>
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{stats.pending_verifications}</p>
            <p className="text-[11px] text-slate-500">Charities awaiting review</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Active Listings</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">{stats.active_listings}</p>
            <p className="text-[11px] text-slate-500">
              {stats.completed_listings} completed all-time
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Flagged Reports</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-extrabold text-rose-600">{stats.open_reports}</p>
            <p className="text-[11px] text-slate-500">Open safety or quality flags</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Registry ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition relative ${
            activeTab === 'verifications' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Charity Verifications ({pendingVerifications.length})
          {pendingVerifications.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px]">
              {pendingVerifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'listings' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Listings Moderation ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition relative ${
            activeTab === 'reports' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Reported Content ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'logs' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          System Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: User Registry */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User / Organization</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{u.org_name || u.full_name}</p>
                      <p className="text-[10px] text-slate-400">{u.full_name} • {u.city}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold uppercase text-[10px] text-slate-500">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.verification_status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
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

      {/* Tab 2: Charity Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">All charity applications processed!</h3>
              <p className="text-xs text-slate-500">
                No organizations are currently awaiting verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingVerifications.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{u.org_name}</h4>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{u.org_type || 'Charitable Organization'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateVerification(u.id, 'rejected')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateVerification(u.id, 'verified')}
                        className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verify Organization
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Charity Reg / 501(c)(3) Number:</span>
                      <p className="font-mono font-bold text-slate-900">{u.charity_reg_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Primary Contact Person:</span>
                      <p className="font-semibold text-slate-900">{u.full_name} ({u.phone || 'No phone'})</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Refrigerated Transport Capability:</span>
                      <p className="font-semibold text-slate-900">
                        {u.refrigerated_transport ? 'Yes (Refrigerated fleet)' : 'No (Thermal bags)'}
                      </p>
                    </div>
                  </div>

                  {u.mission_statement && (
                    <div className="text-[11px] text-slate-600 italic">
                      <strong>Mission Statement:</strong> "{u.mission_statement}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Listings Moderation */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Title & Donor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <p className="font-semibold text-slate-900 truncate">{l.title}</p>
                      <p className="text-[10px] text-slate-400">{l.donor?.org_name}</p>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] font-semibold text-slate-500">
                      {l.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {l.quantity} {l.unit}
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
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(l.pickup_end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {l.status !== 'cancelled' && l.status !== 'completed' && (
                        <button
                          onClick={() => handleForceCancelListing(l.id)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition"
                        >
                          Remove
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

      {/* Tab 4: Reported Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No reported violations</h3>
              <p className="text-xs text-slate-500">All listings comply with platform standards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900">{rep.reason}</h4>
                        <p className="text-[10px] text-slate-400">
                          Filed {new Date(rep.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rep.status === 'open'
                          ? 'bg-rose-100 text-rose-800'
                          : rep.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <strong>Report Details:</strong> {rep.details}
                  </p>

                  {rep.admin_notes && (
                    <p className="text-slate-500 text-[11px] italic">
                      Admin Notes: {rep.admin_notes}
                    </p>
                  )}

                  {rep.status === 'open' && (
                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: System Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-600" />
              Immutable System Activity & State Machine Audit Log
            </h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50/70 transition text-xs flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Entity: {log.entity_type} #{log.entity_id || 'system'}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
