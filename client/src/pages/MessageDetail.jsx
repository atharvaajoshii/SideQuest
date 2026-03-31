import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Trash2, Reply, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function MessageDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
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
      if (!res.ok) return;
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
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

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
          content: newMessage,
          reply_to: replyingTo?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return;

    try {
      const res = await fetch(`${API}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setShowDeleteMenu(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const deleteConversation = async () => {
    if (!confirm(`Delete entire conversation with ${otherUser?.name}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API}/api/messages/conversation/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Conversation deleted');
        navigate('/messages');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

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

  const getReplyMessage = (msg) => {
    if (!msg.reply_to) return null;
    // Check if we have the reply in our messages array
    const reply = messages.find(m => m.id === msg.reply_to);
    if (reply) return reply;
    // Otherwise use the reply data from the backend
    return {
      id: msg.reply_to,
      content: msg.reply_content,
      sender_id: msg.reply_sender_id
    };
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
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/freelancer/${userId}`)}
              className="px-4 py-2 text-sm font-medium text-primary bg-yellow-100 rounded-lg hover:bg-yellow-200 transition"
            >
              View Profile
            </button>
            <button
              onClick={deleteConversation}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Delete conversation"
            >
              <Trash2 size={18} />
            </button>
          </div>
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
              const replyMsg = getReplyMessage(msg);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} group`}
                >
                  {!isOwn && (
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-yellow-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(msg.sender_name)}
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        isOwn
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Reply Preview */}
                      {replyMsg && (
                        <div className={`mb-2 p-2 rounded text-xs border-l-2 ${
                          isOwn
                            ? 'bg-white/10 border-primary text-slate-200'
                            : 'bg-slate-100 border-slate-400 text-slate-600'
                        }`}>
                          <span className="font-semibold">
                            {replyMsg.sender_id === user?.id ? 'You' : msg.sender_name}:
                          </span>
                          <span className="ml-1 line-clamp-1">{replyMsg.content}</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>

                    {/* Delete Button (shown on hover) */}
                    {isOwn && (
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id)}
                          className="p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyingTo && (
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply size={16} className="text-primary" />
              <span className="text-sm text-slate-600">
                Replying to: <span className="font-medium">{replyingTo.content.substring(0, 50)}...</span>
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-slate-200 rounded transition"
            >
              <X size={16} className="text-slate-500" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          >
            <button
              type="button"
              onClick={() => {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage) setReplyingTo(lastMessage);
              }}
              className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition"
              title="Reply to last message"
            >
              <Reply size={20} />
            </button>
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
