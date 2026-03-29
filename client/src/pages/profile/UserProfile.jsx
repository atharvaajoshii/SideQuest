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
        updateUser({ name: data.name });
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      style={{ background: '#F7F6F2' }}>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6"
          style={{ background: '#fff', border: '1px solid #E8E6E0' }}>

          {/* Avatar */}
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-extrabold"
            style={{
              background: '#FFD93D',
              color: '#1A1A2E',
              fontFamily: "'Syne', sans-serif"
            }}
          >
            {initials}
          </div>

          <div className="grow text-center md:text-left">

            {/* Editable name */}
            {editing ? (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="text-xl font-bold rounded-lg px-3 py-1"
                  style={{
                    border: '1px solid #E8E6E0',
                    outline: 'none'
                  }}
                />
                <button onClick={saveName} disabled={saving}
                  className="p-1.5 rounded-lg"
                  style={{ background: '#00C897', color: '#fff' }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
                <button onClick={() => { setEditing(false); setNewName(user?.name); }}
                  className="p-1.5 rounded-lg"
                  style={{ background: '#F0EEE8' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <h1
                  className="text-3xl font-extrabold"
                  style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}
                >
                  {user?.name}
                </h1>
                <button onClick={() => setEditing(true)}
                  style={{ color: '#6B6B85' }}>
                  <Edit3 size={18} />
                </button>
              </div>
            )}

            {success && <p style={{ color: '#00C897' }} className="text-sm mb-1">{success}</p>}
            {error && <p style={{ color: '#FF6B35' }} className="text-sm mb-1">{error}</p>}

            <p className="flex items-center justify-center md:justify-start gap-2"
              style={{ color: '#6B6B85' }}>
              <Mail size={16} /> {user?.email}
            </p>

            <div className="flex gap-2 mt-3 justify-center md:justify-start flex-wrap">
              <span
                className="px-3 py-1 text-xs font-bold rounded-full"
                style={{
                  background: 'rgba(0,200,151,0.12)',
                  color: '#008a66'
                }}
              >
                Verified Student ✓
              </span>

              {user?.role === 'admin' && (
                <span
                  className="px-3 py-1 text-xs font-bold rounded-full"
                  style={{
                    background: 'rgba(108,92,231,0.12)',
                    color: '#5a4bc4'
                  }}
                >
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div
            className="text-center px-6 py-4 rounded-2xl"
            style={{
              background: '#1A1A2E',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Wallet Balance
            </p>
            <p
              className="text-2xl font-extrabold"
              style={{ color: '#FFD93D', fontFamily: "'Syne', sans-serif" }}
            >
              ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Account Info */}
          <div
            className="p-6 rounded-2xl"
            style={{ background: '#fff', border: '1px solid #E8E6E0' }}
          >
            <h3 style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}
              className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award /> Account Info
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2" style={{ borderColor: '#F0EEE8' }}>
                <span style={{ color: '#6B6B85' }}>Name</span>
                <span style={{ color: '#1A1A2E', fontWeight: 700 }}>{user?.name}</span>
              </div>

              <div className="flex justify-between border-b pb-2" style={{ borderColor: '#F0EEE8' }}>
                <span style={{ color: '#6B6B85' }}>Email</span>
                <span style={{ color: '#1A1A2E', fontWeight: 700 }}>{user?.email}</span>
              </div>

              <div className="flex justify-between pb-2">
                <span style={{ color: '#6B6B85' }}>Role</span>
                <span style={{ color: '#1A1A2E', fontWeight: 700 }}>{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div
            className="p-6 rounded-2xl"
            style={{ background: '#fff', border: '1px solid #E8E6E0' }}
          >
            <h3 style={{ color: '#1A1A2E', fontFamily: "'Syne', sans-serif" }}
              className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield /> Security
            </h3>

            <div className="space-y-4">
              <button
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: '#F7F6F2',
                  border: '1px solid #E8E6E0',
                  color: '#1A1A2E'
                }}
              >
                Change Password
              </button>

              <button
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(255,107,53,0.08)',
                  border: '1px solid rgba(255,107,53,0.2)',
                  color: '#FF6B35'
                }}
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}