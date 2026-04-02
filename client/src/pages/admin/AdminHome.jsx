import React, { useState, useEffect } from 'react';
import { Users, Briefcase, AlertTriangle, TrendingUp, Loader2, ShoppingBag, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHome() {
  const { token, API } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalTasks: 0, totalOrders: 0, totalVolume: 0 });
  const [pendingReports, setPendingReports] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'admin') {
    return <p>Access denied</p>;
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/reports?status=pending`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/users?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setPendingReports(Array.isArray(data) ? data.length : data.count || 0);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setRecentUsers(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers?.toLocaleString() ?? '0', bg: 'bg-indigo-100', color: 'text-primary' },
    { icon: Briefcase, label: 'Total Tasks', value: stats.totalTasks?.toLocaleString() ?? '0', bg: 'bg-green-100', color: 'text-secondary' },
    { icon: AlertTriangle, label: 'Pending Reports', value: pendingReports, bg: 'bg-red-100', color: 'text-red-600' },
    { icon: IndianRupee, label: 'Total Volume', value: `₹${((stats.totalVolume || 0) / 1000).toFixed(1)}K`, bg: 'bg-blue-100', color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Platform Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 ${bg} ${color} rounded-xl`}><Icon size={24} /></div>
                <h3 className="font-bold text-slate-700">{label}</h3>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Orders and Volume row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><ShoppingBag size={24} /></div>
              <h3 className="font-bold text-slate-700">Total Orders</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalOrders?.toLocaleString() ?? '0'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><TrendingUp size={24} /></div>
              <h3 className="font-bold text-slate-700">Avg. Order Value</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              ₹{stats.totalOrders > 0 ? ((stats.totalVolume || 0) / stats.totalOrders).toFixed(0) : '0'}
            </p>
          </div>
        </div>

        {/* Recent Users */}
        {recentUsers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Recent Sign-ups</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-primary flex items-center justify-center font-bold text-sm">
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.is_suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.is_suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}