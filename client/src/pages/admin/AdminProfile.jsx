import React, { useState, useEffect } from 'react';
import { Mail, Shield, Award, Edit3, Check, X, Loader2, Key, Bell, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminProfile() {
  const { user, token, updateUser, API } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  // FIX: split into two separate saving states so they don't interfere
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  // FIX: fetch real admin activity stats instead of hardcoding
  const [adminStats, setAdminStats] = useState(null);


  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAdminStats(data); })
      .catch(() => {});
  }, [token]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const showSuccess = (msg) => {
    setError('');
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg) => {
    setSuccess('');
    setError(msg);
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    // FIX: clear both toasts before a new action
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ name: data.name });
        setEditing(false);
        showSuccess('Name updated!');
      } else {
        showError(data.message || 'Failed to update');
      }
    } catch (e) {
      showError('Server error');
    }
    setSavingName(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.new || !passwordData.current) {
      showError('Please fill in all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      showError('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    // FIX: clear both toasts before a new action
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Password changed successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        showError(data.message || 'Failed to change password');
      }
    } catch (e) {
      showError('Server error');
    }
    setSavingPassword(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Admin Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
              <div
                className="h-32 w-32 rounded-full flex items-center justify-center text-4xl font-extrabold mx-auto mb-4 border-4 border-slate-100 shadow-md"
                style={{ background: '#6C5CE7', color: '#fff' }}
              >
                {initials}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">{user?.name}</h2>
              <p className="text-slate-500 mb-4 flex items-center justify-center gap-1">
                <Mail size={16} /> {user?.email}
              </p>

              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg mb-4">
                <Shield size={20} /> Admin Privileges
              </div>

              <div className="mb-4">
                <span
                  className="px-4 py-2 text-sm font-bold rounded-full"
                  style={{ background: 'rgba(108,92,231,0.12)', color: '#6C5CE7' }}
                >
                  Platform Administrator
                </span>
              </div>

              {/* FIX: was a dead button — now navigates to wallet */}
              <button
                onClick={() => navigate('/wallet')}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition"
              >
                View Full Wallet
              </button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Wallet Balance Card */}
            <div
              className="p-6 rounded-2xl flex items-center justify-between"
              style={{ background: '#1A1A2E' }}
            >
              <div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} className="mb-1">
                  Wallet Balance
                </p>
                <p className="text-4xl font-extrabold" style={{ color: '#FFD93D' }}>
                  ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => navigate('/wallet')}
                className="px-6 py-3 rounded-xl font-bold transition"
                style={{
                  background: 'rgba(255,217,61,0.15)',
                  color: '#FFD93D',
                  border: '1px solid rgba(255,217,61,0.3)'
                }}
              >
                Withdraw →
              </button>
            </div>

            {/* Account Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="text-primary" /> Account Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Full Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold">{user?.name}</span>
                    <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-primary transition">
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>

                {editing && (
                  <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary"
                      placeholder="Enter your name"
                    />
                    <button onClick={saveName} disabled={savingName}
                      className="p-2 rounded-lg bg-primary text-white">
                      {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                    <button onClick={() => { setEditing(false); setNewName(user?.name); }}
                      className="p-2 rounded-lg bg-slate-200 text-slate-600">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Email Address</span>
                  <span className="text-slate-900 font-bold">{user?.email}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Role</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                    {user?.role}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Account Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Member Since</span>
                  <span className="text-slate-900 font-bold">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="text-primary" /> Security Settings
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Key size={18} className="text-slate-500" /> Change Password
                  </h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                        placeholder="Current password"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <input
                      type="password"
                      value={passwordData.new}
                      onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                      placeholder="New password"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {/* FIX: uses savingPassword not shared saving state */}
                      {savingPassword ? 'Changing...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Bell size={18} className="text-slate-500" /> Notification Preferences
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                      <span className="text-slate-600">Email notifications for reports</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                      <span className="text-slate-600">Email notifications for new users</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                      <span className="text-slate-600">Daily digest of platform activity</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Stats — FIX: fetched from API, not hardcoded */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-primary" /> Platform Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-3xl font-extrabold text-primary">
                    {adminStats?.totalUsers?.toLocaleString() ?? '—'}
                  </p>
                  <p className="text-slate-500 text-sm">Total Users</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-3xl font-extrabold text-primary">
                    {adminStats?.totalTasks?.toLocaleString() ?? '—'}
                  </p>
                  <p className="text-slate-500 text-sm">Total Tasks</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-3xl font-extrabold text-primary">
                    {adminStats?.totalOrders?.toLocaleString() ?? '—'}
                  </p>
                  <p className="text-slate-500 text-sm">Orders Completed</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-3xl font-extrabold text-primary">
                    {adminStats?.totalVolume != null ? `₹${(adminStats.totalVolume / 1000).toFixed(1)}K` : '—'}
                  </p>
                  <p className="text-slate-500 text-sm">Platform Volume</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200">
              <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <Shield className="text-red-600" /> Danger Zone
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Irreversible and destructive actions. Be careful!
              </p>
              <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition text-sm">
                Transfer Admin Rights
              </button>
            </div>

          </div>
        </div>

        {/* FIX: toasts are mutually exclusive — success clears error and vice versa */}
        {success && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check size={18} /> {success}
          </div>
        )}
        {error && (
          <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <X size={18} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}