import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Briefcase, ShoppingBag, IndianRupee, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminStats() {
  const { token, API } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
    setLoading(false);
  };

  const statCards = stats ? [
    {
      icon: Users,
      label: 'Total Registered Users',
      value: stats.totalUsers?.toLocaleString() ?? '0',
      color: 'text-primary',
      bg: 'bg-indigo-100',
    },
    {
      icon: Briefcase,
      label: 'Total Tasks Posted',
      value: stats.totalTasks?.toLocaleString() ?? '0',
      color: 'text-secondary',
      bg: 'bg-green-100',
    },
    {
      icon: ShoppingBag,
      label: 'Orders Completed',
      value: stats.totalOrders?.toLocaleString() ?? '0',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      icon: IndianRupee,
      label: 'Total Platform Volume',
      value: `₹${((stats.totalVolume || 0) / 1000).toFixed(1)}K`,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <TrendingUp className="text-primary" /> Platform Statistics
          </h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : !stats ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200">
            Failed to load statistics. Please try again.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {statCards.map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 ${bg} ${color} rounded-xl`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-slate-700">{label}</h3>
                  </div>
                  <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Derived metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-sm text-slate-500 mb-2">Avg. Task Price</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  ₹{stats.totalTasks > 0 ? ((stats.totalVolume || 0) / stats.totalTasks).toFixed(0) : '—'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-sm text-slate-500 mb-2">Task Completion Rate</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  {stats.totalTasks > 0
                    ? `${((stats.totalOrders / stats.totalTasks) * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-sm text-slate-500 mb-2">Revenue per User</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  ₹{stats.totalUsers > 0 ? ((stats.totalVolume || 0) / stats.totalUsers).toFixed(0) : '—'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Detailed Analytics</h2>
              <p className="text-slate-500 text-sm">
                Connect a charting library (Recharts, Chart.js) here to visualize trends over time.
              </p>
              {lastUpdated && (
                <p className="text-xs text-slate-400 mt-4">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}