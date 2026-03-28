import React, { useState } from 'react';
import { Mail, Shield, Award, Edit3, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, token, updateUser, API } = useAuth();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get initials from name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const saveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
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
        updateUser({ name: data.name }); // updates context instantly
        setEditing(false);
        setSuccess('Name updated!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update');
      }
    } catch (e) {
      setError('Server error');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with initials */}
          <div className="h-24 w-24 bg-indigo-100 text-primary rounded-full flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-grow text-center md:text-left">
            {/* Editable name */}
            {editing ? (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="text-xl font-bold border border-slate-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <button onClick={saveName} disabled={saving}
                  className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
                <button onClick={() => { setEditing(false); setNewName(user?.name); }}
                  className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{user?.name}</h1>
                <button onClick={() => setEditing(true)}
                  className="text-slate-400 hover:text-primary transition"
                  title="Edit name">
                  <Edit3 size={18} />
                </button>
              </div>
            )}

            {success && <p className="text-green-600 text-sm mb-1">{success}</p>}
            {error && <p className="text-red-500 text-sm mb-1">{error}</p>}

            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {user?.email}
            </p>

            <div className="flex items-center gap-2 mt-3 justify-center md:justify-start flex-wrap">
              <span className="px-3 py-1 bg-green-100 text-secondary text-xs font-bold rounded-full border border-green-200">
                Verified Student ✓
              </span>
              {user?.role === 'admin' && (
                <span className="px-3 py-1 bg-indigo-100 text-primary text-xs font-bold rounded-full border border-indigo-200 flex items-center gap-1">
                  <Shield size={12} /> Admin
                </span>
              )}
            </div>
          </div>

          {/* Wallet balance */}
          <div className="text-center bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Wallet Balance</p>
            <p className="text-2xl font-extrabold text-secondary">
              ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Stats + Security */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-primary" /> Account Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Name</span>
                <span className="font-bold text-slate-900">{user?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Email</span>
                <span className="font-bold text-slate-900 text-sm">{user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Role</span>
                <span className="font-bold text-slate-900 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Member Since</span>
                <span className="font-bold text-slate-900">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : '—'}
                </span>
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