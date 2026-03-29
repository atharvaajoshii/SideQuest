import React from 'react';
import { Users, Briefcase, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminHome() {
  return (
    <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Platform Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 text-primary rounded-xl"><Users size={24} /></div>
              <h3 className="font-bold text-slate-700">Total Users</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">1,248</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 text-secondary rounded-xl"><Briefcase size={24} /></div>
              <h3 className="font-bold text-slate-700">Active Quests</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">342</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
              <h3 className="font-bold text-slate-700">Pending Reports</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">12</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><TrendingUp size={24} /></div>
              <h3 className="font-bold text-slate-700">Total Volume</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">₹45.2K</p>
          </div>
        </div>
    </div>
  );
}