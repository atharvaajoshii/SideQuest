import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminAnnouncements() {
  const { token, API } = useAuth();
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  if (user?.role !== 'admin') {
    return <p>Access denied</p>;
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!announcement.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: announcement.trim() })
      });
      if (res.ok) {
        setAnnouncement('');
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`${API}/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <Megaphone className="text-primary" /> Global Announcements
        </h1>

        {/* Post New */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Post a New Announcement</h2>
          <textarea
            rows="3"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary transition mb-4 resize-none outline-none"
            placeholder="Type a message that all users will see on their homepage..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={saving || !announcement.trim()}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-primary transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={18} /> {saving ? 'Publishing...' : 'Publish to Platform'}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Announcement History</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={40} className="animate-spin mx-auto text-primary mb-2" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No announcements yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((item) => (
                <div key={item.id} className="p-6 flex justify-between items-start hover:bg-slate-50 transition">
                  <div>
                    <p className="text-slate-800 font-medium mb-1">{item.text}</p>
                    <p className="text-sm text-slate-500">{formatDate(item.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 transition ml-4 flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}