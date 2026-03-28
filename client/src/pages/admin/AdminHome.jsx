import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar (Simple version for now) */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-extrabold mb-8 text-primary">Admin Panel</h2>
        <nav className="space-y-4">
          <Link to="/admin" className="block text-white font-bold bg-slate-800 px-4 py-2 rounded-lg">Dashboard</Link>
          <Link to="/admin/users" className="block text-slate-400 hover:text-white transition px-4 py-2">Manage Users</Link>
          <Link to="/admin/tasks" className="block text-slate-400 hover:text-white transition px-4 py-2">Manage Tasks</Link>
          <Link to="/admin/reports" className="block text-slate-400 hover:text-white transition px-4 py-2">Review Reports</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8">
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
    </div>
  );
}