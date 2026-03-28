import React from 'react';
import { User, Mail, Shield, Settings, Award } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 bg-indigo-100 text-primary rounded-full flex items-center justify-center text-4xl font-bold">
            JD
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900">John Doe</h1>
            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mt-1">
              <Mail size={16} /> student@college.edu
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-secondary text-xs font-bold rounded-full border border-green-200">
              Verified Student ✓
            </span>
          </div>
          <button className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition flex items-center gap-2">
            <Settings size={18} /> Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-primary" /> Buyer Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Quests Posted</span>
                <span className="font-bold text-slate-900">8</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Spent</span>
                <span className="font-bold text-slate-900">₹3,400</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="text-secondary" /> Account Security
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition text-sm font-medium text-slate-700">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition text-sm font-medium text-red-600">
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}