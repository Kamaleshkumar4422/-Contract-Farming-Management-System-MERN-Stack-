import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  Users,
  FileSpreadsheet,
  CreditCard,
  AlertCircle,
  PieChart,
  ShieldCheck,
  CheckCircle,
  Ban,
  Trash2,
  Search,
  MessageSquare,
  Building2,
  Sprout,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminPortal({ activeSection, setActiveSection }) {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Selected
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, contractsRes, paymentsRes, complaintsRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/contracts'),
        api.get('/payments'),
        api.get('/complaints'),
        api.get('/admin/analytics'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (contractsRes.data.success) setContracts(contractsRes.data.contracts);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.payments);
      if (complaintsRes.data.success) setComplaints(complaintsRes.data.complaints);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUserStatus = async (userId, newStatus, isVerified) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`, {
        status: newStatus,
        isVerified,
      });
      if (res.data.success) {
        showToast(`User status updated to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('User record purged from registry');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Deletion failed', 'error');
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await api.put(`/complaints/${selectedComplaint._id}/respond`, {
        adminResponse: adminResponseText,
        status: 'resolved',
      });
      if (res.data.success) {
        showToast('Dispute determination recorded and parties notified! ⚖️');
        setSelectedComplaint(null);
        setAdminResponseText('');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve dispute', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
    const matchesSearch = userSearch
      ? u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      : true;
    return matchesRole && matchesSearch;
  });

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW / COMMAND CENTER */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Executive Governance Console • System Administration
              </span>
              <h2 className="text-2xl font-black mt-1">Platform Command Center 🛡️</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Supervise cross-platform forward contract obligations, participant KYC compliance, dispute conciliations, and financial liquidity settlements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Registered Farmers"
              value={stats?.totalFarmers || 0}
              subtitle={`${stats?.totalAcreage || 0} Verified Acres`}
              icon={Sprout}
              color="emerald"
            />
            <MetricCard
              title="Corporate Buyers"
              value={stats?.totalBuyers || 0}
              subtitle="Exporters & Processors"
              icon={Building2}
              color="blue"
            />
            <MetricCard
              title="Gross Contract GMV"
              value={`₹${((stats?.totalVolume || 0) / 100000).toFixed(1)} Lakhs`}
              subtitle="Escrow Secured"
              icon={CreditCard}
              color="amber"
            />
            <MetricCard
              title="Open Arbitrations"
              value={stats?.openComplaints || 0}
              subtitle="Dispute Conciliation"
              icon={AlertCircle}
              color="purple"
            />
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveSection('users')}
              className="cursor-pointer bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Manage Participant Directory</span>
              </div>
              <p className="text-xs text-slate-500">
                Review farmer land titles, verify corporate buyer GST numbers, and inspect officer credentials.
              </p>
            </div>

            <div
              onClick={() => setActiveSection('contracts')}
              className="cursor-pointer bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Contract Governance</span>
              </div>
              <p className="text-xs text-slate-500">
                Audit {contracts.length} digital forward contracts across all agricultural districts.
              </p>
            </div>

            <div
              onClick={() => setActiveSection('complaints')}
              className="cursor-pointer bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Arbitration & Disputes ({complaints.filter(c => c.status !== 'resolved').length})</span>
              </div>
              <p className="text-xs text-slate-500">
                Resolve farmer-buyer disputes regarding harvest schedules, quality scores, and escrow payouts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. USER DIRECTORY & KYC */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900">User Registry & Role Governance</h3>
              <p className="text-xs text-slate-500">
                Manage KYC verifications, account privileges, and suspension controls.
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="buyer">Buyers</option>
                <option value="officer">Field Officers</option>
                <option value="admin">Administrators</option>
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Participant Name</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">State / District</th>
                  <th className="px-5 py-3">KYC Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{u.phone || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.address?.district || u.address?.state || 'Verified'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {u.status === 'blocked' ? (
                        <button
                          onClick={() => handleUpdateUserStatus(u._id, 'active', true)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(u._id, 'blocked', u.isVerified)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200"
                        >
                          Suspend
                        </button>
                      )}
                      {u.email !== 'admin@agriflow.com' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 inline" />
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

      {/* 3. CONTRACT GOVERNANCE */}
      {activeSection === 'contracts' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">Platform Contract Governance & Auditing</h3>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Title / Crop</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Assigned Farmer</th>
                  <th className="px-5 py-3">Gross Value</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{c.contractCode}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-400">{c.cropName} ({c.variety})</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{c.buyer?.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{c.assignedFarmer?.name || 'Unassigned'}</td>
                    <td className="px-5 py-3.5 font-black text-emerald-800">
                      ₹{(c.totalEstimatedValue || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PLATFORM ESCROW & GMV */}
      {activeSection === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Platform Financial Settlement Ledger</h3>
              <p className="text-xs text-slate-500">
                Supervise all contract milestone payouts, bank transactions, and active escrow reserves.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Txn ID</th>
                  <th className="px-5 py-3">Contract</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Farmer</th>
                  <th className="px-5 py-3">Disbursed Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{p.transactionId}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{p.contract?.contractCode || 'Contract'}</td>
                    <td className="px-5 py-3.5 text-slate-700">{p.buyer?.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{p.farmer?.name}</td>
                    <td className="px-5 py-3.5 font-black text-emerald-700">₹{p.netAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DISPUTE REDRESSAL */}
      {activeSection === 'complaints' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Platform Grievance & Arbitration Board</h3>
            <p className="text-xs text-slate-500">
              Arbitrate complaints lodged between Farmers and Buyers under standard contract terms.
            </p>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{c.complaintNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                        {c.category}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">{c.subject}</h4>
                    <p className="text-xs text-slate-500">
                      Lodged by: <strong className="text-slate-800">{c.raisedBy?.name}</strong> ({c.raisedBy?.role})
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl">
                  {c.description}
                </p>

                {c.adminResponse ? (
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 border border-emerald-100">
                    <strong className="block text-emerald-800 mb-0.5">Admin Determination Posted:</strong>
                    {c.adminResponse}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setAdminResponseText('');
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Post Administrative Arbitration
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PLATFORM INTELLIGENCE */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">Platform Agronomic Analytics Studio</h3>
          {analytics?.monthlyTrends && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Monthly Contract Volume Growth (₹ in Lakhs)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrends}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="volumeLakhs" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Post Complaint Response */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="⚖️ Issue Administrative Arbitration Determination"
      >
        {selectedComplaint && (
          <form onSubmit={handleResolveComplaint} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block">{selectedComplaint.subject}</span>
              <p className="text-slate-600 mt-1">{selectedComplaint.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Ruling / Action Taken</label>
              <textarea
                rows={3}
                placeholder="Explain the conciliation resolution, compensation adjustment, or contractual clarification..."
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md"
            >
              Issue Final Ruling & Mark Resolved
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
