import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function MessageDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchOtherUser();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOtherUser = async () => {
    try {
      const res = await fetch(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return; // FIX 1: don't try to parse HTML 404 pages
      const data = await res.json();
      setOtherUser(data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return; // FIX 1: don't try to parse HTML 404 pages
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIX 2: sendMessage no longer takes an event — the form's onSubmit handles preventDefault
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: userId,
          content: newMessage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // FIX 3: guard against undefined/null name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-slate-200 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getInitials(otherUser?.name)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {otherUser?.name || 'Unknown User'}
                </h3>
                <p className="text-xs text-slate-500">
                  {otherUser?.email || ''}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/freelancer/${userId}`)}
            className="px-4 py-2 text-sm font-medium text-primary bg-yellow-100 rounded-lg hover:bg-yellow-200 transition"
          >
            View Profile
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MessageCircle size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-yellow-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(msg.sender_name)}
                    </div>
                  )}
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwn
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-yellow-100' : 'text-slate-400'
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {/* FIX 4: form onSubmit calls sendMessage directly, no double e.preventDefault */}
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          >
            <input
              type="text"
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type a message... (Press Enter to send)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

function MessageCircle({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}