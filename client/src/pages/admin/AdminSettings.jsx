import React, { useState, useEffect } from 'react';
import { Settings, Save, Globe, Lock, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { token, API } = useAuth();
  const [settings, setSettings] = useState({
    allow_signups: true,
    maintenance_mode: false,
    platform_fee_percent: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Allow New Signups</h4>
                  <p className="text-sm text-slate-500">Let new users register on the platform.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.allow_signups}
                    onChange={e => setSettings(s => ({ ...s, allow_signups: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Maintenance Mode</h4>
                  <p className="text-sm text-slate-500">Temporarily disable the website for updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.maintenance_mode}
                    onChange={e => setSettings(s => ({ ...s, maintenance_mode: e.target.checked }))}
                  />
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Platform Fee Deduction (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platform_fee_percent}
                  onChange={e => setSettings(s => ({ ...s, platform_fee_percent: parseFloat(e.target.value) || 0 }))}
                  className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none"
                />
                <p className="text-sm text-slate-500 mt-1">
                  This percentage is deducted from each completed order.
                </p>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-primary transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check size={18} /> Settings saved!
        </div>
      )}
    </div>
  );
}