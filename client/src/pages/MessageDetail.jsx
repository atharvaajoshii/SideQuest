import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Trash2, Reply, X, ChevronDown, ChevronUp, CheckCircle, IndianRupee, Loader2 } from 'lucide-react';

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
  const [taskInfo, setTaskInfo] = useState(null);
  const [showTaskInfo, setShowTaskInfo] = useState(true);
  const [negotiation, setNegotiation] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [showNegotiationPanel, setShowNegotiationPanel] = useState(false);
  const [latestOffer, setLatestOffer] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchOtherUser();
    fetchNegotiation();

    const interval = setInterval(() => {
      fetchMessages();
      fetchNegotiation();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch task info from the LATEST message's negotiation_id (most recent negotiation)
  useEffect(() => {
    if (messages.length > 0) {
      // Find the last (most recent) message with a negotiation_id
      const latestMessageWithNegotiation = messages.reduce((latest, m) => {
        if (!m.negotiation_id) return latest;
        if (!latest) return m;
        return new Date(m.created_at) > new Date(latest.created_at) ? m : latest;
      }, null);

      if (latestMessageWithNegotiation) {
        fetchTaskInfo(latestMessageWithNegotiation.negotiation_id);
        // Find latest offer from the other user (freelancer)
        const freelancerOffers = messages.filter(m =>
          m.sender_id === parseInt(userId) && m.offered_price
        );
        if (freelancerOffers.length > 0) {
          const latest = freelancerOffers.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          setLatestOffer(latest);
          setOfferAmount(latest.offered_price);
        }
      }
    }
  }, [messages, userId]);

  const fetchTaskInfo = async (negotiationId) => {
    try {
      // Get task info from negotiations table
      const negRes = await fetch(`${API}/api/negotiations/${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (negRes.ok) {
        const data = await negRes.json();
        if (data.negotiation) {
          const taskRes = await fetch(`${API}/api/tasks/${data.negotiation.task_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (taskRes.ok) {
            const taskData = await taskRes.json();
            setTaskInfo({
              id: taskData.id,
              title: taskData.title,
              price: taskData.price,
              poster_id: taskData.poster_id
            });
            setNegotiation(data.negotiation);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch task info:', err);
    }
  };

  const fetchNegotiation = async () => {
    try {
      const res = await fetch(`${API}/api/negotiations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) {
          setNegotiation(data.negotiation);
        }
      }
    } catch (err) {
      // Silent fail - negotiation may not exist yet
    }
  };

  const handleAcceptOffer = async () => {
    if (!latestOffer || !taskInfo) return;

    setAccepting(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          freelancer_id: parseInt(userId),
          task_id: taskInfo.id,
          agreed_price: parseFloat(latestOffer.offered_price)
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Offer accepted! Order created at ₹${latestOffer.offered_price}`);
        navigate(`/orders/${data.order.id}`);
      } else {
        alert(data.message || 'Failed to accept offer');
      }
    } catch (err) {
      console.error('Failed to accept offer:', err);
      alert('Server error. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!offerAmount || !taskInfo) return;

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: userId,
          content: `Counter-offer: ₹${offerAmount}`,
          negotiation_id: negotiation?.id || null,
          offered_price: parseFloat(offerAmount)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setOfferAmount('');
        alert('Counter-offer sent!');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to send counter-offer');
      }
    } catch (err) {
      console.error('Failed to send counter-offer:', err);
      alert('Server error. Please try again.');
    }
  };

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
    const reply = messages.find(m => m.id === msg.reply_to);
    if (reply) return reply;
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
                {/* Task Info - Collapsible */}
                {taskInfo && (
                  <div className="mt-1 flex items-center gap-1">
                    <button
                      onClick={() => setShowTaskInfo(!showTaskInfo)}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                    >
                      {showTaskInfo ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                      {showTaskInfo ? 'Hide task' : 'Show task'}
                    </button>
                  </div>
                )}
                {taskInfo && showTaskInfo && (
                  <p className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    {taskInfo.title}
                  </p>
                )}
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

        {/* Negotiation Panel - Only show for task posters */}
        {taskInfo && taskInfo.poster_id === user?.id && latestOffer && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <IndianRupee size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Offer from {otherUser?.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Current task price: ₹{taskInfo.price}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-green-700">
                  ₹{latestOffer.offered_price}
                </p>
                <p className="text-xs text-green-500">
                  {new Date(latestOffer.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAcceptOffer}
                disabled={accepting || parseFloat(latestOffer.offered_price) === parseFloat(taskInfo.price)}
                className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                  parseFloat(latestOffer.offered_price) === parseFloat(taskInfo.price)
                    ? 'bg-green-300 text-green-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {accepting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                {parseFloat(latestOffer.offered_price) === parseFloat(taskInfo.price) ? 'Already Accepted' : 'Accept Offer'}
              </button>
              <button
                onClick={() => setShowNegotiationPanel(!showNegotiationPanel)}
                className="py-2 px-4 bg-white border border-green-300 text-green-700 rounded-lg font-bold hover:bg-green-50 transition"
              >
                {showNegotiationPanel ? 'Hide Counter' : 'Counter-Offer'}
              </button>
            </div>

            {/* Counter-Offer Input */}
            {showNegotiationPanel && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <label className="text-xs font-medium text-green-700 block mb-2">
                  Your Counter-Offer
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">₹</span>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-green-300 rounded-lg font-bold text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={taskInfo.price}
                    />
                  </div>
                  <button
                    onClick={handleCounterOffer}
                    disabled={!offerAmount || accepting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-500">
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
                  <div className="relative">
                    <div className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwn
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-800 border'
                    }`}>
                      {replyMsg && (
                        <div className="text-xs mb-2">
                          <b>{replyMsg.sender_id === user?.id ? 'You' : 'User'}:</b> {replyMsg.content}
                        </div>
                      )}
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1">{formatTime(msg.created_at)}</p>
                    </div>

                    {isOwn && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <Trash2 size={12} />
                      </button>
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
          <div className="p-2 bg-gray-100 flex justify-between">
            Replying to: {replyingTo.content}
            <button onClick={() => setReplyingTo(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 flex gap-2 border-t">
          <input
            className="flex-1 border p-2 rounded"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>
            <Send />
          </button>
        </div>

      </div>
    </div>
  );
}