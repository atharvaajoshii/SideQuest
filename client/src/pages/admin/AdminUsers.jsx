import React, { useState, useEffect } from 'react';
// FIX: removed unused `Link` import — user names now use useNavigate instead
import { Shield, Ban, Search, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const { token, API } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // FIX: single search state — fetch fires on explicit submit only, clear refetches all
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await fetch(`${API}/api/admin/users${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setLoading(false);
  };

  const handleSearch = () => setSearchTerm(search);

  // FIX: clearing the search box and submitting now resets to all users
  const handleClear = () => {
    setSearch('');
    setSearchTerm('');
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_suspended: !currentStatus })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Manage Users</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-primary transition"
            >
              Search
            </button>
            {searchTerm && (
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition"
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={40} className="animate-spin mx-auto text-primary mb-2" />
              <p className="text-slate-500">Loading users...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600">Name</th>
                  <th className="p-4 font-bold text-slate-600">Email</th>
                  <th className="p-4 font-bold text-slate-600">Role</th>
                  <th className="p-4 font-bold text-slate-600">Status</th>
                  <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        {/* FIX: was using <Link> inside a table cell with flex — use a button/span instead */}
                        <button
                          onClick={() => navigate(`/freelancer/${user.id}`)}
                          className="font-bold text-slate-900 hover:text-primary transition text-left"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="p-4 text-slate-600">{user.email}</td>
                      <td className="p-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-primary font-bold text-xs bg-indigo-50 px-2 py-1 rounded-full">
                            <Shield size={14} /> Admin
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">User</span>
                        )}
                      </td>
                      <td className="p-4">
                        {/* FIX: was using flex on a <td> — use inline-flex on the inner span instead */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${user.is_suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {user.is_suspended ? <Ban size={12} /> : <CheckCircle size={12} />}
                          {user.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {/* FIX: was using flex on a <td> — use inline-flex wrapper */}
                        <div className="inline-flex gap-3">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.is_suspended)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-sm transition inline-flex items-center gap-1 ${user.is_suspended ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                          >
                            <Ban size={14} /> {user.is_suspended ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}