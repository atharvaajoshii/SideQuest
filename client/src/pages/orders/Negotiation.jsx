import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Send, User, Loader2 } from 'lucide-react';

export default function Negotiation() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { user, token, API } = useAuth();

  const [task, setTask] = useState(null);
  const [offer, setOffer] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API}/api/tasks/${taskId}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
          setOffer(data.price);
          // Fetch negotiation messages from backend
          fetchNegotiationMessages(taskId, data.poster_id);
        } else {
          navigate('/search');
        }
      } catch (err) {
        console.error('Failed to fetch task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, API, navigate]);

  const fetchNegotiationMessages = async (taskId, posterId) => {
    try {
      // Get the negotiation ID or create one
      const res = await fetch(`${API}/api/negotiations/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch negotiation messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: task.poster_id,
          content: message,
          negotiation_id: task.id, // Link to task/negotiation
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!offer || offer <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          freelancer_id: user.id,
          task_id: parseInt(taskId),
          agreed_price: parseFloat(offer),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Offer accepted! Order created.');
        navigate(`/orders/${data.order.id}`);
      } else {
        alert(data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Failed to accept offer:', err);
      alert('Server error. Is backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <Link to={`/freelancer/${task.poster_id}`} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{task.poster_name || 'Poster'}</h3>
              <p className="text-xs text-slate-500">Task: {task.title}</p>
            </div>
          </Link>
          <div className="text-right">
            <span className="text-sm text-slate-500 block">Your Offer</span>
            <input
              type="number"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="text-xl font-extrabold text-secondary w-24 text-right bg-transparent border-b border-slate-300 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <p className="text-sm">No messages yet. Start the negotiation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id || idx} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isOwn ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isOwn ? (user?.name?.charAt(0) || 'U') : (task.poster_name?.charAt(0) || 'P')}
                  </div>
                  <div className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${isOwn ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-slate-300' : 'text-slate-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* System Offer Card */}
          <div className="mx-auto bg-white border-2 border-primary rounded-xl p-4 max-w-sm text-center shadow-md my-6">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Official Offer</span>
            <h2 className="text-3xl font-extrabold text-slate-900 my-2">₹{offer}</h2>
            <p className="text-sm text-slate-500 mb-4">You're offering to complete the task for this amount.</p>
            <button
              onClick={handleAcceptOffer}
              disabled={submitting}
              className="w-full bg-secondary text-white py-2 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Accept Offer & Start Order'}
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form className="flex gap-2" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Type a message or counter-offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition flex items-center gap-2 disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
