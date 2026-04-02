import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Search, Filter, CheckCircle, Archive, Trash2, Eye, Reply, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function AdminContactMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? `${API}/api/contact`
        : `${API}/api/contact?status=${filter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/contact/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/api/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchMessages();
        fetchStats();
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? ({ ...prev, status: newStatus }) : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedMessage || !adminNotes.trim()) return;

    try {
      const res = await fetch(`${API}/api/contact/${selectedMessage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ admin_notes: adminNotes })
      });

      if (res.ok) {
        setSelectedMessage(prev => prev ? ({ ...prev, admin_notes: adminNotes }) : null);
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`${API}/api/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchMessages();
        fetchStats();
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      general: '📋',
      support: '🔧',
      billing: '💰',
      report: '⚠️',
      feedback: '💡',
      partnership: '🤝'
    };
    return icons[subject] || '📧';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Mail size={28} className="text-primary" />
          Contact Messages
        </h1>
        <p className="text-slate-600 mt-1">View and manage messages from users</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-500">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl shadow border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl shadow border border-blue-200">
            <div className="text-2xl font-bold text-blue-800">{stats.read}</div>
            <div className="text-sm text-blue-600">Read</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow border border-green-200">
            <div className="text-2xl font-bold text-green-800">{stats.replied}</div>
            <div className="text-sm text-green-600">Replied</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl shadow border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Filter by Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'read', 'replied', 'archived'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No messages found</div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition hover:bg-slate-50 ${
                    selectedMessage?.id === msg.id ? 'bg-indigo-50' : ''
                  } ${msg.status === 'pending' ? 'bg-yellow-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSubjectIcon(msg.subject)}</span>
                      <span className="font-medium text-slate-900 text-sm">{msg.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(msg.status)}`}>
                      {msg.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{msg.email}</div>
                  <div className="text-xs text-slate-600 line-clamp-2">{msg.message}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <Clock size={12} />
                    {new Date(msg.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getSubjectIcon(selectedMessage.subject)}</span>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedMessage.subject.charAt(0).toUpperCase() + selectedMessage.subject.slice(1)}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>From: <span className="font-medium">{selectedMessage.name}</span></span>
                      <span>&lt;{selectedMessage.email}&gt;</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'read')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  >
                    <CheckCircle size={16} />
                    Mark as Read
                  </button>
                  <button
                    onClick={() => {
                      setAdminNotes(selectedMessage.admin_notes || '');
                      setShowReplyModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                  >
                    <Reply size={16} />
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'archived')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Archive size={16} />
                    Archive
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6 flex-grow overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Message</h3>
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <p className="text-slate-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this message..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
                  />
                  <button
                    onClick={saveAdminNotes}
                    className="mt-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Received: {new Date(selectedMessage.created_at).toLocaleString('en-IN')}</span>
                  {selectedMessage.updated_at && (
                    <span>Updated: {new Date(selectedMessage.updated_at).toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Mail size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Mark as Replied</h3>
            <p className="text-sm text-slate-600 mb-4">
              This will mark the message as replied. Make sure you've responded via email or your preferred channel.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStatus(selectedMessage.id, 'replied');
                  setShowReplyModal(false);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
