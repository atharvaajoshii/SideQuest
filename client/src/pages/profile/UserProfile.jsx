import React, { useState } from 'react';
import { Mail, Shield, Award, Edit3, Check, X, Loader2, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, token, updateUser, API } = useAuth();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const saveProfile = async () => {
    if (!formData.name.trim()) { setError('Name is required'); return; }
    if (!formData.email.trim() || !formData.email.includes('@')) { setError('Valid email is required'); return; }

    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ name: data.name, email: data.email });
        setEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update');
      }
    } catch (e) { setError('Server error'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required'); return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters'); return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match'); return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch(`${API}/api/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(''); }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (e) { setPasswordError('Server error'); }
    setPasswordSaving(false);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F6F2' }}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6"
          style={{ background: '#fff', border: '1px solid #E8E6E0' }}>
          <div className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-extrabold"
            style={{ background: '#FFD93D', color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}>
            {initials}
          </div>

          <div className="grow text-center md:text-left">
            {editing ? (
              <div className="space-y-3 mb-3">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <User size={18} style={{ color: '#6B6B85' }} />
                  <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your Name" className="text-lg font-bold rounded-lg px-3 py-1.5 flex-grow max-w-xs"
                    style={{ border: '1px solid #E8E6E0', outline: 'none' }} />
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail size={18} style={{ color: '#6B6B85' }} />
                  <input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email" type="email" className="text-base rounded-lg px-3 py-1.5 flex-grow max-w-xs"
                    style={{ border: '1px solid #E8E6E0', outline: 'none', color: '#6B6B85' }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-extrabold" style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}>
                  {user?.name}
                </h1>
                <button onClick={() => { setEditing(true); setFormData({ name: user?.name || '', email: user?.email || '' }); }}
                  style={{ color: '#6B6B85' }}><Edit3 size={18} /></button>
              </div>
            )}

            {success && <p style={{ color: '#00C897' }} className="text-sm mb-1">{success}</p>}
            {error && <p style={{ color: '#FF6B35' }} className="text-sm mb-1">{error}</p>}

            {!editing && (
              <p className="flex items-center justify-center md:justify-start gap-2" style={{ color: '#6B6B85' }}>
                <Mail size={16} /> {user?.email}
              </p>
            )}

            {editing && (
              <div className="flex items-center gap-2 justify-center md:justify-start mt-3">
                <button onClick={saveProfile} disabled={saving}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
                  style={{ background: '#00C897', color: '#fff' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Changes
                </button>
                <button onClick={() => { setEditing(false); setFormData({ name: user?.name || '', email: user?.email || '' }); }}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
                  style={{ background: '#F0EEE8', color: '#6B6B85' }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            )}

            <div className="flex gap-2 mt-3 justify-center md:justify-start flex-wrap">
              <span className="px-3 py-1 text-xs font-bold rounded-full"
                style={{ background: 'rgba(0,200,151,0.12)', color: '#008a66' }}>Verified Student ✓</span>
              {user?.role === 'admin' && (
                <span className="px-3 py-1 text-xs font-bold rounded-full"
                  style={{ background: 'rgba(108,92,231,0.12)', color: '#5a4bc4' }}>Admin</span>
              )}
            </div>
          </div>

          <div className="text-center px-6 py-4 rounded-2xl"
            style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Wallet Balance</p>
            <p className="text-2xl font-extrabold" style={{ color: '#FFD93D', fontFamily: "'Syne', sans-serif" }}>
              ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Account Info */}
          <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #E8E6E0' }}>
            <h3 style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}
              className="text-lg font-bold mb-4 flex items-center gap-2"><Award /> Account Info</h3>
            <div className="space-y-3 text-sm">
              {[['Name', user?.name], ['Email', user?.email], ['Role', user?.role],
                ['Wallet Balance', `₹${parseFloat(user?.wallet_balance || 0).toFixed(2)}`]].map(([label, val], i, arr) => (
                <div key={label} className={`flex justify-between ${i < arr.length - 1 ? 'border-b pb-2' : 'pb-2'}`}
                  style={{ borderColor: '#F0EEE8' }}>
                  <span style={{ color: '#6B6B85' }}>{label}</span>
                  <span style={{ color: '#1A1A2E', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #E8E6E0' }}>
            <h3 style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}
              className="text-lg font-bold mb-4 flex items-center gap-2"><Shield /> Security</h3>
            <div className="space-y-4">
              <button onClick={() => { setShowPasswordModal(true); setPasswordError(''); setPasswordSuccess(''); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition hover:opacity-80"
                style={{ background: '#F7F6F2', border: '1px solid #E8E6E0', color: '#1A1A2E' }}>
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', color: '#FF6B35' }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}>
          <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
            style={{ background: '#fff', border: '1px solid #E8E6E0' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold" style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}>
                Change Password
              </h2>
              <button onClick={() => setShowPasswordModal(false)} style={{ color: '#6B6B85' }}>
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(255,107,53,0.08)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.2)' }}>
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(0,200,151,0.08)', color: '#008a66', border: '1px solid rgba(0,200,151,0.2)' }}>
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: 'Current Password', key: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                { label: 'New Password', key: 'newPassword', show: showNew, toggle: () => setShowNew(p => !p) },
                { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label className="block text-sm font-bold mb-1" style={{ color: '#1A1A2E' }}>{label}</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={passwordData[key]}
                      onChange={e => setPasswordData(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm pr-10"
                      style={{ border: '1px solid #E8E6E0', outline: 'none', background: '#F7F6F2' }}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#6B6B85' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleChangePassword} disabled={passwordSaving}
                className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: '#1A1A2E', color: '#fff' }}>
                {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {passwordSaving ? 'Saving...' : 'Update Password'}
              </button>
              <button onClick={() => setShowPasswordModal(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#F0EEE8', color: '#6B6B85' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}