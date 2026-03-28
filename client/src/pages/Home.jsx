import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CheckCircle, Clock, PlusCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Student! 👋</h1>
          <p className="text-slate-500 mt-1">Ready to complete some SideQuests today?</p>
        </div>
        <Link to="/tasks/post" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition">
          <PlusCircle size={20} /> Post a Quest
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-secondary rounded-xl"><Wallet size={28} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Available Balance</p>
            <h3 className="text-2xl font-bold text-slate-900">₹1,250</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><CheckCircle size={28} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Quests Completed</p>
            <h3 className="text-2xl font-bold text-slate-900">14</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-500 rounded-xl"><Clock size={28} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">2</h3>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Link to="/search" className="p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-indigo-50 transition font-medium text-slate-700">🔍 Find Quests</Link>
          <Link to="/tasks/mine" className="p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-indigo-50 transition font-medium text-slate-700">📋 My Posted Tasks</Link>
          <Link to="/orders" className="p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-indigo-50 transition font-medium text-slate-700">📦 Manage Orders</Link>
          <Link to="/wallet" className="p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-indigo-50 transition font-medium text-slate-700">💳 Withdraw Funds</Link>
        </div>
      </div>
    </div>
  );
}