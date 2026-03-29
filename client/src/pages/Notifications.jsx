import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, CheckCheck, AlertCircle, MessageCircle, DollarSign, FileText } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function Notifications() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'order':
        return <DollarSign size={20} className="text-green-500" />;
      case 'task':
        return <FileText size={20} className="text-purple-500" />;
      case 'system':
        return <AlertCircle size={20} className="text-orange-500" />;
      default:
        return <Bell size={20} className="text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              Stay updated with your orders, messages, and tasks
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No notifications
              </h3>
              <p className="text-slate-500 text-sm">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.link && navigate(notif.link)}
                  className={`p-4 flex gap-4 transition ${
                    !notif.is_read ? 'bg-blue-50' : 'hover:bg-slate-50'
                  } ${notif.link ? 'cursor-pointer' : ''}`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{notif.message}</p>
                  </div>

                  {/* Actions */}
                  {!notif.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      className="flex-shrink-0 p-2 hover:bg-slate-200 rounded-lg transition"
                      title="Mark as read"
                    >
                      <Check size={16} className="text-slate-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
