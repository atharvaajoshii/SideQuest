import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Send, User, Loader2, CheckCircle, DollarSign } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function Negotiation() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { user, token, API } = useAuth();

  const [task, setTask] = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [offer, setOffer] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch task details
        const taskRes = await fetch(`${API}/api/tasks/${taskId}`);
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTask(taskData);
          setOffer(taskData.price);

          // Fetch or create negotiation
          const negRes = await fetch(`${API}/api/negotiations/task/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (negRes.ok) {
            const negData = await negRes.json();
            setNegotiation(negData.negotiation);
            if (negData.messages) {
              setMessages(negData.messages);
            }
          }
        } else {
          navigate('/search');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, API, navigate, token]);

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
          negotiation_id: negotiation?.id || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setMessage('');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!offer || parseFloat(offer) <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    setAccepting(true);
    try {
      // Create order from negotiation
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
        alert('Offer accepted! Starting order now...');
        navigate(`/orders/${data.order.id}`);
      } else {
        alert(data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Failed to accept offer:', err);
      alert('Server error. Is backend running?');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-2" />
          <p className="text-slate-500">Loading negotiation...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Task not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <Link to={`/freelancer/${task.poster_id}`} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
              {task.poster_name?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{task.poster_name || 'Task Poster'}</h3>
              <p className="text-xs text-slate-500">Task: {task.title}</p>
            </div>
          </Link>
          <div className="text-right">
            <span className="text-sm text-slate-500 block">Your Offer</span>
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-secondary" />
              <input
                type="number"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="text-xl font-extrabold text-secondary w-24 text-right bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <p className="text-sm">No messages yet. Start the negotiation!</p>
              <p className="text-xs mt-1">Discuss task details, timeline, or price with the poster.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id || idx} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    isOwn ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {isOwn ? (user?.name?.charAt(0) || 'U') : (task.poster_name?.charAt(0) || 'P')}
                  </div>
                  <div className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    isOwn ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
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
          <div className="mx-auto bg-white border-2 border-green-500 rounded-xl p-4 max-w-sm text-center shadow-md my-6">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Official Offer</span>
            <h2 className="text-3xl font-extrabold text-slate-900 my-2">₹{offer}</h2>
            <p className="text-sm text-slate-500 mb-4">You're offering to complete the task for this amount.</p>
            <button
              onClick={handleAcceptOffer}
              disabled={accepting || task.status !== 'Open'}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  {task.status !== 'Open' ? 'Task Not Available' : 'Accept Offer & Start Order'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form className="flex gap-2" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              placeholder="Type a message or counter-offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
