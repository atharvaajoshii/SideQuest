import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Briefcase, IndianRupee, ShoppingBag } from 'lucide-react';

// ✅ FIX: was exported as AdminAnnouncements (wrong copy-paste), now correctly AdminStats
export default function AdminStats() {
  // In production: fetch these from /api/admin/stats
  const stats = [
    { icon: Users, label: 'Total Registered Users', value: '1,248', color: 'text-primary', bg: 'bg-indigo-100' },
    { icon: Briefcase, label: 'Total Tasks Posted', value: '342', color: 'text-secondary', bg: 'bg-green-100' },
    { icon: ShoppingBag, label: 'Orders Completed', value: '198', color: 'text-amber-600', bg: 'bg-amber-100' },
    { icon: TrendingUp, label: 'Total Platform Volume', value: '₹45,200', color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <TrendingUp className="text-primary" /> Platform Statistics
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-2">More detailed analytics</h2>
          <p className="text-slate-500 text-sm">Connect a charting library (Recharts, Chart.js) here to visualize trends over time.</p>
        </div>
      </div>
    </div>
  );
}