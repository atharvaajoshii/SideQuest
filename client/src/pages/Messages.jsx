import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Search, Trash2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function Messages() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (otherUserId, userName) => {
    if (!confirm(`Delete conversation with ${userName}? This cannot be undone.`)) return;

    setDeleting(otherUserId);
    try {
      const res = await fetch(`${API}/api/messages/conversation/${otherUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setConversations(conversations.filter(c => c.other_user_id !== otherUserId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Server error');
    } finally {
      setDeleting(null);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your conversations and negotiations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm ? 'No matching conversations' : 'No conversations yet'}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {searchTerm
                  ? 'Try searching with a different name'
                  : 'Start a conversation by negotiating on a task'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/search')}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
                >
                  Browse Tasks
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.other_user_id}
                  onClick={() => navigate(`/messages/${conv.other_user_id}`)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition flex items-center gap-4 group"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(conv.name)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {conv.name}
                      </h3>
                      <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>
                    {/* Task Name - Always visible for negotiation conversations */}
                    {conv.task_title && (
                      <p className="text-xs text-slate-700 font-medium mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        {conv.task_title}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 truncate">
                      {conv.last_message || 'No messages yet'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Unread Badge */}
                    {parseInt(conv.unread_count) > 0 && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-slate-900 text-xs font-bold rounded-full">
                          {conv.unread_count}
                        </span>
                      </div>
                    )}
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.other_user_id, conv.name);
                      }}
                      disabled={deleting === conv.other_user_id}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                      title="Delete conversation"
                    >
                      {deleting === conv.other_user_id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
