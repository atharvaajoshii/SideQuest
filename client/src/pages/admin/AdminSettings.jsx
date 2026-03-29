import React from 'react';
import { Settings, Save, Globe, Lock } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <Settings className="text-primary" /> Platform Settings
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
          
          {/* General Settings */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe size={20} /> General Configurations
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Allow New Signups</h4>
                  <p className="text-sm text-slate-500">Let new students register on the platform.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Maintenance Mode</h4>
                  <p className="text-sm text-slate-500">Temporarily disable the website for updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security & Financials */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock size={20} /> Security & Financials
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Platform Fee Deduction (%)</label>
                <input type="number" defaultValue="5" className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-primary transition flex items-center gap-2">
              <Save size={18} /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}